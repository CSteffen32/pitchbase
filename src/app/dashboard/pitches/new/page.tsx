'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tag } from '@/types'
import { ArrowLeft, Upload, X, FileText } from 'lucide-react'
import Link from 'next/link'

export default function NewPitchPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    ticker: '',
    sector: '',
    rating: '',
    timeframe: '',
    summary: '',
    content: '',
    authorName: '',
    pdfUrl: '',
  })
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/dashboard/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    setIsUploading(true)

    try {
      // Use S3 upload API
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          type: 'pdf',
        }),
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        console.error('Upload API error:', uploadResponse.status, errorText)
        throw new Error(`Failed to get upload URL: ${uploadResponse.status} - ${errorText}`)
      }

      const { uploadUrl, fileUrl } = await uploadResponse.json()
      console.log('Got upload URL:', uploadUrl)
      console.log('File URL:', fileUrl)

      // Upload file to S3
      console.log('Uploading to S3...')
      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      })

      console.log('S3 response status:', s3Response.status)
      if (!s3Response.ok) {
        const s3ErrorText = await s3Response.text()
        console.error('S3 upload failed:', s3Response.status, s3ErrorText)
        throw new Error(`Failed to upload to S3: ${s3Response.status} - ${s3ErrorText}`)
      }

      setFormData(prev => ({ ...prev, pdfUrl: fileUrl }))
      setUploadedFile(file)
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`Failed to upload file: ${errorMessage}\n\nCheck the console for more details.`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setFormData(prev => ({ ...prev, pdfUrl: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/dashboard/pitches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          rating: formData.rating ? parseInt(formData.rating) : undefined,
          tagIds: selectedTags,
        }),
      })

      if (res.ok) {
        const pitch = await res.json()
        router.push(`/dashboard/pitches/${pitch.id}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to create pitch')
      }
    } catch (error) {
      console.error('Error creating pitch:', error)
      alert('Failed to create pitch')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    try {
      const res = await fetch('/api/dashboard/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTag.trim() }),
      })

      if (res.ok) {
        const tag = await res.json()
        setTags([...tags, tag])
        setSelectedTags([...selectedTags, tag.id])
        setNewTag('')
      }
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">New Pitch</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the essential details for your stock pitch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Tesla: The Future of Transportation"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Ticker *
                </label>
                <Input
                  value={formData.ticker}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      ticker: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="e.g., TSLA"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Author Name
              </label>
              <Input
                value={formData.authorName}
                onChange={e =>
                  setFormData({ ...formData, authorName: e.target.value })
                }
                placeholder="Enter the author's name for credit"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Sector</label>
                <Input
                  value={formData.sector}
                  onChange={e =>
                    setFormData({ ...formData, sector: e.target.value })
                  }
                  placeholder="e.g., Automotive"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Rating (1-5)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={e =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  placeholder="5"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Timeframe
                </label>
                <Input
                  value={formData.timeframe}
                  onChange={e =>
                    setFormData({ ...formData, timeframe: e.target.value })
                  }
                  placeholder="e.g., 6 months"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Summary *
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.summary}
                onChange={e =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                placeholder="Provide a compelling summary of your investment thesis..."
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>
              Add detailed analysis and supporting content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Detailed Analysis
              </label>
              <textarea
                className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.content}
                onChange={e =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Write your detailed investment analysis here..."
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                PDF Upload
              </label>
              {uploadedFile ? (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{uploadedFile.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload your pitch PDF document
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-upload"
                    disabled={isUploading}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    disabled={isUploading}
                    onClick={() => document.getElementById('pdf-upload')?.click()}
                  >
                    {isUploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>
              Add tags to help categorize your pitch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                placeholder="Add new tag..."
                onKeyPress={e =>
                  e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                }
              />
              <Button type="button" onClick={handleAddTag}>
                Add Tag
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={
                    selectedTags.includes(tag.id) ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Link href="/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Pitch'}
          </Button>
        </div>
      </form>
    </div>
  )
}
