import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic' // Make this dynamic to avoid build-time DB access

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ]

  // Try to get published pitches, but handle database errors gracefully
  let pitchPages: Array<{
    url: string
    lastModified: Date
    changeFrequency: 'weekly'
    priority: number
  }> = []

  try {
    const pitches = await prisma.pitch.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true },
    })

    pitchPages = pitches.map(pitch => ({
      url: `${baseUrl}/p/${pitch.slug}`,
      lastModified: pitch.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    // Database not available during build or on serverless (SQLite limitation)
    // Return static pages only - sitemap will still work
    console.warn('Could not fetch pitches for sitemap:', error)
  }

  return [...staticPages, ...pitchPages]
}
