import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSignedUploadUrl, generateFileKey, getFileUrl } from '@/lib/upload'
import { z } from 'zod'

const uploadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  type: z.enum(['pdf', 'image']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log(
      'Upload request - Session:',
      session?.user?.email,
      'Role:',
      session?.user?.role
    )

    if (
      !session?.user ||
      (session.user.role !== 'ADMIN' && session.user.role !== 'AUTHOR')
    ) {
      console.log('Upload request rejected - Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Upload request body:', body)
    const { filename, contentType, type } = uploadSchema.parse(body)

    // Validate file type
    if (type === 'pdf' && !contentType.includes('application/pdf')) {
      return NextResponse.json(
        { error: 'Invalid PDF file type' },
        { status: 400 }
      )
    }

    if (type === 'image' && !contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid image file type' },
        { status: 400 }
      )
    }

    const key = generateFileKey(type, filename)
    console.log('Generating signed URL for key:', key)
    const uploadUrl = await getSignedUploadUrl({
      key,
      contentType,
      expiresIn: 3600, // 1 hour
    })

    const fileUrl = getFileUrl(key)
    console.log('Generated upload URL:', uploadUrl.substring(0, 100) + '...')
    console.log('File URL:', fileUrl)

    return NextResponse.json({
      uploadUrl,
      key,
      fileUrl,
      expiresIn: 3600,
    })
  } catch (error) {
    console.error('Upload error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
