'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PDFViewer } from '@/components/pdf-viewer'
import { PitchWithTags } from '@/types'
import {
  ArrowLeft,
  Edit,
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

export default function PitchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [pitch, setPitch] = useState<PitchWithTags | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPitch(params.id as string)
    }
  }, [params.id])

  const fetchPitch = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/pitches/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPitch(data)
      } else {
        console.error('Failed to fetch pitch')
      }
    } catch (error) {
      console.error('Error fetching pitch:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!pitch || !confirm('Are you sure you want to delete this pitch?'))
      return

    try {
      const res = await fetch(`/api/dashboard/pitches/${pitch.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error deleting pitch:', error)
    }
  }

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!pitch) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pitch Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The pitch you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{pitch.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/p/${pitch.slug}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Public
            </Button>
          </Link>
          <Link href={`/dashboard/pitches/${pitch.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className="font-mono text-lg px-3 py-1"
                    >
                      {pitch.ticker}
                    </Badge>
                    {pitch.sector && (
                      <Badge variant="outline" className="text-lg px-3 py-1">
                        {pitch.sector}
                      </Badge>
                    )}
                    <Badge
                      variant={
                        pitch.status === 'PUBLISHED' ? 'default' : 'secondary'
                      }
                    >
                      {pitch.status}
                    </Badge>
                  </div>
                </div>
                {pitch.rating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-5 w-5 ${
                          i < pitch.rating!
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
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
                  <span>By {pitch.author.name || pitch.author.email}</span>
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
              <div className="prose max-w-none">
                <h3 className="text-xl font-semibold mb-4">Summary</h3>
                <p className="text-lg leading-relaxed mb-8">{pitch.summary}</p>

                {pitch.content && (
                  <>
                    <h3 className="text-xl font-semibold mb-4">Analysis</h3>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: pitch.content }}
                    />
                  </>
                )}

                {pitch.pdfUrl && (
                  <div className="mt-8 pt-8 border-t">
                    <PDFViewer url={pitch.pdfUrl} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
