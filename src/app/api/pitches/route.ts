import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PitchFilters } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters: PitchFilters = {
      search: searchParams.get('search') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      sector: searchParams.get('sector') || undefined,
      rating: searchParams.get('rating')
        ? parseInt(searchParams.get('rating')!)
        : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'publishedAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    const where: any = {
      status: 'PUBLISHED',
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { ticker: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.sector) {
      where.sector = filters.sector
    }

    if (filters.rating) {
      where.rating = filters.rating
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            slug: {
              in: filters.tags,
            },
          },
        },
      }
    }

    const orderBy: any = {}
    orderBy[filters.sortBy!] = filters.sortOrder

    const [pitches, total] = await Promise.all([
      prisma.pitch.findMany({
        where,
        orderBy,
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
    console.error('Error fetching pitches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


