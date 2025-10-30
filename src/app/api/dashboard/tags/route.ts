import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createTagSchema = z.object({
  name: z.string().min(1),
})

const updateTagSchema = z.object({
  name: z.string().min(1),
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
    const { name } = createTagSchema.parse(body)

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { slug },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'A tag with this name already exists' },
        { status: 400 }
      )
    }

    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error creating tag:', error)

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

    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            pitches: true,
          },
        },
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

