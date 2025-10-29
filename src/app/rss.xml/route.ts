import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  // Get published pitches
  const pitches = await prisma.pitch.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    include: {
      author: {
        select: { name: true, email: true },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PitchBase - Stock Investment Pitches</title>
    <description>Professional stock investment analysis and pitches</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    
    ${pitches
      .map(
        pitch => `
    <item>
      <title><![CDATA[${pitch.title} (${pitch.ticker})]]></title>
      <description><![CDATA[${pitch.summary}]]></description>
      <link>${baseUrl}/p/${pitch.slug}</link>
      <guid isPermaLink="true">${baseUrl}/p/${pitch.slug}</guid>
      <pubDate>${pitch.publishedAt?.toUTCString()}</pubDate>
      <author>${pitch.author.name || pitch.author.email}</author>
      ${pitch.tags.map(({ tag }) => `<category>${tag.name}</category>`).join('')}
    </item>`
      )
      .join('')}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}


