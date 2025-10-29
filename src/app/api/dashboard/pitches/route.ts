import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { CreatePitchData } from '@/types'
import { z } from 'zod'

const createPitchSchema = z.object({
  title: z.string().min(1),
  ticker: z.string().min(1),
  sector: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  timeframe: z.string().optional(),
  summary: z.string().min(1),
  content: z.string().optional(),
  authorName: z.string().optional(),
  pdfUrl: z.string().optional(),
  coverImage: z.string().optional(),
  tagIds: z.array(z.string()),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session?.user ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'AUTHOR')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const data = createPitchSchema.parse(body)

    // Generate slug from title
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug is unique
    const existingPitch = await prisma.pitch.findUnique({
      where: { slug },
    })

    if (existingPitch) {
      return NextResponse.json(
        { error: 'A pitch with this title already exists' },
        { status: 400 }
      )
    }

    // Remove tagIds from data before creating pitch
    const { tagIds, ...pitchData } = data

    const pitch = await prisma.pitch.create({
      data: {
        ...pitchData,
        slug,
        authorId: session.user.id,
        status: 'PUBLISHED', // Publish immediately
        publishedAt: new Date(),
        tags: {
          create: tagIds.map(tagId => ({
            tag: {
              connect: { id: tagId },
            },
          })),
        },
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(pitch, { status: 201 })
  } catch (error) {
    console.error('Error creating pitch:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session?.user ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'AUTHOR')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = searchParams.get('search') || undefined

    const where: any = {}

    // Authors can only see their own pitches, admins can see all
    if (session.user.role === 'AUTHOR') {
      where.authorId = session.user.id
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { ticker: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [pitches, total] = await Promise.all([
      prisma.pitch.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.pitch.count({ where }),
    ])

    return NextResponse.json({
      pitches,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard pitches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
