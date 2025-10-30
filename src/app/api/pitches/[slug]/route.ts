import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const pitch = await prisma.pitch.findUnique({
      where: {
        slug: params.slug,
        status: 'PUBLISHED',
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

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // Get related pitches
    const relatedPitches = await prisma.pitch.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: pitch.id },
        OR: [
          {
            tags: {
              some: {
                tag: {
                  id: {
                    in: pitch.tags.map(pt => pt.tag.id),
                  },
                },
              },
            },
          },
          {
            sector: pitch.sector,
          },
        ],
      },
      take: 4,
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

    return NextResponse.json({
      pitch,
      relatedPitches,
    })
  } catch (error) {
    console.error('Error fetching pitch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

