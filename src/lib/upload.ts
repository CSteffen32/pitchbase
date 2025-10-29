import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Determine if we should use a custom endpoint
function shouldUseCustomEndpoint(endpoint?: string): boolean {
  if (!endpoint) return false
  // Use custom endpoint for non-AWS services (MinIO, R2, etc.)
  return endpoint.includes('localhost') || 
         endpoint.includes('127.0.0.1') || 
         endpoint.includes('.cloudflarestorage.com') ||
         endpoint.includes('.r2.cloudflarestorage.com')
}

function getS3Endpoint(endpoint?: string, bucket?: string): string | undefined {
  if (!endpoint) return undefined
  
  // For standard AWS S3 URLs (bucket.s3.region.amazonaws.com), don't use endpoint
  // Let the SDK auto-construct it based on region
  if (endpoint.includes('.s3.') && endpoint.includes('.amazonaws.com')) {
    return undefined
  }
  
  // For MinIO and other S3-compatible services, use the endpoint as-is
  return endpoint
}

const endpoint = getS3Endpoint(process.env.S3_ENDPOINT, process.env.S3_BUCKET)
const useForcePathStyle = shouldUseCustomEndpoint(process.env.S3_ENDPOINT)

const s3ClientConfig: any = {
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: useForcePathStyle,
}

// Only add endpoint if we have a custom one
if (endpoint) {
  s3ClientConfig.endpoint = endpoint
}

const s3Client = new S3Client(s3ClientConfig)

const BUCKET_NAME = process.env.S3_BUCKET!

export interface UploadConfig {
  key: string
  contentType: string
  expiresIn?: number
}

export async function getSignedUploadUrl(config: UploadConfig) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: config.key,
      ContentType: config.contentType,
    })

    console.log('S3 Client config:', {
      bucket: BUCKET_NAME,
      region: s3ClientConfig.region,
      endpoint: s3ClientConfig.endpoint,
    })

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: config.expiresIn || 3600,
    })
    
    return signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  })

  return s3Client.send(command)
}

export function getFileUrl(key: string): string {
  // Return a URL through our proxy endpoint that serves files from S3
  // Encode forward slashes but keep the path structure readable
  const encodedKey = key.replace(/\//g, '%2F')
  return `/api/pitch-files/${encodedKey}`
}

export function generateFileKey(
  type: 'pdf' | 'image',
  filename: string
): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop()

  return `${type}s/${timestamp}-${randomId}.${extension}`
}
