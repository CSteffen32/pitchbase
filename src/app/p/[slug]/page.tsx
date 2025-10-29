import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PitchCard } from '@/components/pitch-card'
import { PDFViewer } from '@/components/pdf-viewer'
import { Star, Calendar, TrendingUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PitchWithTags } from '@/types'

interface PitchPageProps {
  params: { slug: string }
}

async function getPitch(slug: string): Promise<{
  pitch: PitchWithTags
  relatedPitches: PitchWithTags[]
} | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/pitches/${slug}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    return res.json()
  } catch (error) {
    console.error('Error fetching pitch:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: PitchPageProps): Promise<Metadata> {
  const data = await getPitch(params.slug)

  if (!data) {
    return {
      title: 'Pitch Not Found',
    }
  }

  const { pitch } = data

  return {
    title: `${pitch.title} (${pitch.ticker}) - PitchBase`,
    description: pitch.summary,
    openGraph: {
      title: pitch.title,
      description: pitch.summary,
      type: 'article',
      publishedTime: pitch.publishedAt
        ? new Date(pitch.publishedAt).toISOString()
        : undefined,
      authors: [pitch.authorName || pitch.author.name || pitch.author.email],
      tags: pitch.tags.map(({ tag }) => tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: pitch.title,
      description: pitch.summary,
    },
  }
}

export default async function PitchPage({ params }: PitchPageProps) {
  const data = await getPitch(params.slug)

  if (!data) {
    notFound()
  }

  const { pitch, relatedPitches } = data

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No date'

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return 'Invalid date'

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj)
    } catch {
      return 'Invalid date'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to pitches
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-b from-gray-800 to-black border-yellow-500/20">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2 text-white">
                      {pitch.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge
                        variant="secondary"
                        className="font-mono text-lg px-3 py-1"
                      >
                        {pitch.ticker}
                      </Badge>
                      {pitch.sector && (
                        <Badge
                          variant="outline"
                          className="text-yellow-400 text-lg px-5 py-1.5"
                        >
                          {pitch.sector}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {pitch.rating && (
                    <div className="flex items-center gap-1">
                      {renderStars(pitch.rating)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-400 mb-4">
                  {pitch.timeframe && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {pitch.timeframe}
                    </div>
                  )}
                  {pitch.publishedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Published {formatDate(pitch.publishedAt)}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span>
                      By{' '}
                      {pitch.authorName ||
                        pitch.author.name ||
                        pitch.author.email}
                    </span>
                  </div>
                </div>

                {pitch.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pitch.tags.map(({ tag }) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="prose max-w-none text-white">
                  <h3 className="text-xl font-semibold mb-4 text-yellow-400">
                    Summary
                  </h3>
                  <p className="text-lg leading-relaxed mb-8 text-gray-300">
                    {pitch.summary}
                  </p>

                  {pitch.content && (
                    <>
                      <h3 className="text-xl font-semibold mb-4 text-yellow-400">
                        Analysis
                      </h3>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: pitch.content }}
                      />
                    </>
                  )}

                  {pitch.pdfUrl && (
                    <div className="mt-8 pt-8 border-t">
                      <h3 className="text-xl font-semibold mb-4">Pitch</h3>
                      <PDFViewer url={pitch.pdfUrl} />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {relatedPitches.length > 0 && (
              <Card className="bg-gradient-to-b from-gray-800 to-black border-yellow-500/20">
                <CardHeader>
                  <CardTitle className="text-white">More Pitches</CardTitle>
                  <CardDescription className="text-gray-400">
                    Related investment analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {relatedPitches.map(relatedPitch => (
                    <PitchCard key={relatedPitch.id} pitch={relatedPitch} />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
