import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { UpdatePitchData } from '@/types'
import { z } from 'zod'

const updatePitchSchema = z.object({
  title: z.string().min(1).optional(),
  ticker: z.string().min(1).optional(),
  sector: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  timeframe: z.string().optional(),
  summary: z.string().min(1).optional(),
  content: z.string().optional(),
  pdfUrl: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  tagIds: z.array(z.string()).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session?.user ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'AUTHOR')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pitch = await prisma.pitch.findUnique({
      where: { id: params.id },
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

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Authors can only access their own pitches
    if (session.user.role === 'AUTHOR' && pitch.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json(pitch)
  } catch (error) {
    console.error('Error fetching pitch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session?.user ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'AUTHOR')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pitch = await prisma.pitch.findUnique({
      where: { id: params.id },
    })

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Authors can only update their own pitches
    if (session.user.role === 'AUTHOR' && pitch.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const data = updatePitchSchema.parse(body)

    // Handle slug update if title changed
    let slug = pitch.slug
    if (data.title && data.title !== pitch.title) {
      slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if new slug is unique
      const existingPitch = await prisma.pitch.findUnique({
        where: { slug },
      })

      if (existingPitch && existingPitch.id !== params.id) {
        return NextResponse.json(
          { error: 'A pitch with this title already exists' },
          { status: 400 }
        )
      }
    }

    // Handle status change to PUBLISHED
    const updateData: any = { ...data, slug }
    if (data.status === 'PUBLISHED' && pitch.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date()
    }

    // Handle tag updates
    if (data.tagIds) {
      // First disconnect all existing tags
      await prisma.pitchTag.deleteMany({
        where: { pitchId: params.id },
      })
    }

    const updatedPitch = await prisma.pitch.update({
      where: { id: params.id },
      data: {
        ...updateData,
        ...(data.tagIds && {
          tags: {
            create: data.tagIds.map(tagId => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          },
        }),
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

    return NextResponse.json(updatedPitch)
  } catch (error) {
    console.error('Error updating pitch:', error)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (
      !session?.user ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'AUTHOR')
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pitch = await prisma.pitch.findUnique({
      where: { id: params.id },
    })

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Authors can only delete their own pitches
    if (session.user.role === 'AUTHOR' && pitch.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.pitch.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pitch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


