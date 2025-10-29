import { User, Pitch, Tag } from '@prisma/client'

export type { User, Pitch, Tag }

// Define types that Prisma doesn't generate (these are strings in schema, not enums)
export type PitchStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type Role = 'ADMIN' | 'AUTHOR' | 'READER'

export interface PitchWithTags extends Omit<Pitch, 'authorName'> {
  authorName: string | null
  tags: Array<{
    tag: Tag
  }>
  author: {
    id: string
    name: string | null
    email: string
  }
}

export interface CreatePitchData {
  title: string
  ticker: string
  sector?: string
  rating?: number
  timeframe?: string
  summary: string
  content?: string
  authorName?: string
  pdfUrl?: string
  coverImage?: string
  tagIds: string[]
}

export interface UpdatePitchData extends Partial<CreatePitchData> {
  status?: PitchStatus
}

export interface PitchFilters {
  search?: string
  tags?: string[]
  sector?: string
  rating?: number
  sortBy?: 'publishedAt' | 'title' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface UploadResponse {
  url: string
  key: string
}

export interface ServerEnv {
  DATABASE_URL: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  S3_ENDPOINT: string
  S3_REGION: string
  S3_ACCESS_KEY_ID: string
  S3_SECRET_ACCESS_KEY: string
  S3_BUCKET: string
  VERCEL_ANALYTICS_ID?: string
}
