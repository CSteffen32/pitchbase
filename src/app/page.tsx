'use client'

import { useState, useEffect } from 'react'
// Force rebuild
import { useSession } from 'next-auth/react'
import { PitchWithTags } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const { data: session } = useSession()
  const [pitches, setPitches] = useState<PitchWithTags[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPitches()
  }, [session])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPitches(searchQuery)
    }, 300) // Debounce search by 300ms

    return () => clearTimeout(timer)
  }, [searchQuery])

  async function fetchPitches(query: string = '') {
    try {
      // If user is authenticated, fetch their pitches from dashboard API
      // Otherwise fetch public published pitches
      const url = session?.user 
        ? `/api/dashboard/pitches`
        : query 
          ? `/api/pitches?search=${encodeURIComponent(query)}&limit=100`
          : '/api/pitches?limit=100'
      
      const res = await fetch(url)
      
      if (!res.ok) {
        throw new Error('Failed to fetch pitches')
      }

      const data = await res.json()
      setPitches(data.pitches)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pitches:', error)
      setPitches([])
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  // Client-side filtering for authenticated users
  const filteredPitches = session?.user && !searchQuery
    ? pitches
    : pitches.filter(
        pitch =>
          pitch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pitch.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-yellow-500/20 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Header */}
      <div className="bg-black border-b border-yellow-500/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                PitchBase
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            {searchQuery ? 'Search Results' : session?.user ? 'Your Pitches' : 'Latest Pitches'}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            {searchQuery 
              ? `Found ${filteredPitches.length} pitch${filteredPitches.length !== 1 ? 'es' : ''} matching "${searchQuery}"`
              : session?.user 
                ? 'Manage and view all your investment pitches'
                : 'Discover our most recent stock investment analysis'
            }
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search pitches by title or ticker..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Pitches Grid */}
        {filteredPitches.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-800 rounded-lg p-12 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold mb-4 text-white">
                {searchQuery ? 'No matches found' : 'No pitches yet'}
              </h3>
              <p className="text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Be the first to create a pitch and share your investment analysis'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPitches.map(pitch => (
              <div key={pitch.id} className="bg-gradient-to-b from-gray-800 to-black rounded-xl border border-yellow-500/20 overflow-hidden hover:border-yellow-500/40 transition-all hover:shadow-xl hover:shadow-yellow-500/10 group">
                {/* Clickable Image/Title Area */}
                <Link href={session?.user ? `/dashboard/pitches/${pitch.id}` : `/p/${pitch.slug}`}>
                  {/* Image Placeholder */}
                  <div className="h-64 bg-gradient-to-br from-yellow-600/20 to-yellow-900/20 relative">
                    {/* Ticker Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-sm px-3 py-1.5">
                        {pitch.ticker}
                      </Badge>
                    </div>
                    
                    {/* Status Badge */}
                    {pitch.status && (
                      <div className="absolute top-4 right-4">
                        <Badge className={pitch.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}>
                          {pitch.status}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Date */}
                    <div className="absolute bottom-4 right-4">
                      <span className="text-white text-sm font-medium">
                        {pitch.publishedAt ? new Date(pitch.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {pitch.title}
                    </h3>
                    <p className="text-gray-400 mb-6 line-clamp-3 text-sm leading-relaxed">
                      {pitch.summary}
                    </p>
                    
                    {/* Bottom Info Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        {pitch.pdfUrl && (
                          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-semibold border border-green-500/30">
                            PDF
                          </div>
                        )}
                      </div>
                      <span className="text-yellow-400 text-sm font-medium hover:text-yellow-300 transition-colors">
                        Read Pitch →
                      </span>
                    </div>
                  </div>
                </Link>
                
                {/* Action Buttons for Authenticated Users */}
                {session?.user && (
                  <div className="px-6 pb-6 border-t border-gray-700">
                    <div className="flex items-center gap-2 pt-4">
                      <Link href={`/dashboard/pitches/${pitch.id}`}>
                        <button className="flex-1 px-4 py-2 text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors font-medium">
                          View
                        </button>
                      </Link>
                      <Link href={`/p/${pitch.slug}`}>
                        <button className="flex-1 px-4 py-2 text-sm bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors font-medium">
                          Public
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
