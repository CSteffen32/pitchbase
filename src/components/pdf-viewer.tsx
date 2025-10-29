'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'

interface PDFViewerProps {
  url: string
  className?: string
}

export function PDFViewer({ url, className }: PDFViewerProps) {
  const [loading, setLoading] = useState(true)

  // Convert relative URLs to absolute URLs
  const getAbsoluteUrl = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `${typeof window !== 'undefined' ? window.location.origin : ''}${url}`
  }

  const absoluteUrl = getAbsoluteUrl(url)

  return (
    <div className={`${className || ''}`}>
      <div className="rounded-lg border border-border overflow-hidden shadow-lg bg-white">
        <div className="bg-muted px-4 py-2 flex items-center border-b">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="relative bg-white" style={{ overflow: 'hidden' }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}
          <iframe
            src={`${absoluteUrl}#toolbar=0&navpanes=0&zoom=page-width`}
            className="w-full"
            style={{ height: '400px', border: 'none', display: 'block' }}
            title="PDF Viewer"
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <Button
          asChild
          variant="outline"
          className="bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-500"
        >
          <a href={absoluteUrl} download className="text-black">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          className="bg-white hover:bg-gray-100 text-black border-white"
        >
          <a
            href={absoluteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-black"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in new tab
          </a>
        </Button>
      </div>
    </div>
  )
}
