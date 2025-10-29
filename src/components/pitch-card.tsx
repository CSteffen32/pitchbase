'use client'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Calendar, TrendingUp } from 'lucide-react'
import { PitchWithTags } from '@/types'

interface PitchCardProps {
  pitch: PitchWithTags
}

export function PitchCard({ pitch }: PitchCardProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'No date'

    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return 'Invalid date'

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
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
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <Link href={`/p/${pitch.slug}`}>
      <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2 mb-2">
                {pitch.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="font-mono">
                  {pitch.ticker}
                </Badge>
                {pitch.sector && (
                  <Badge variant="outline">{pitch.sector}</Badge>
                )}
              </div>
            </div>
            {pitch.rating && (
              <div className="flex items-center gap-1">
                {renderStars(pitch.rating)}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <CardDescription className="line-clamp-3 mb-4">
            {pitch.summary}
          </CardDescription>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              {pitch.timeframe && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {pitch.timeframe}
                </div>
              )}
              {pitch.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(pitch.publishedAt)}
                </div>
              )}
            </div>
          </div>

          {pitch.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {pitch.tags.slice(0, 3).map(({ tag }) => (
                <Badge key={tag.id} variant="outline" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
              {pitch.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{pitch.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
