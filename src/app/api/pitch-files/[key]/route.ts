import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

// Initialize S3 client
const s3ClientConfig: any = {
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
}

const s3Client = new S3Client(s3ClientConfig)
const BUCKET_NAME = process.env.S3_BUCKET!

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const key = decodeURIComponent(params.key)
    
    // Get the file from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const response = await s3Client.send(command)
    
    // Get the content type from the S3 response or default to application/pdf
    const contentType = response.ContentType || 'application/pdf'
    
    // Convert the stream to an array buffer
    const arrayBuffer = await response.Body!.transformToByteArray()
    const buffer = Buffer.from(arrayBuffer)

    // Return the file content with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error fetching file from S3:', error)
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    )
  }
}

