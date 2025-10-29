# PitchBase

A production-ready web application for publishing and viewing professional stock investment pitches. Built with Next.js 14, TypeScript, and modern web technologies.

## Features

### Public Blog Layout

- **Home Page**: Grid/list of published pitches with card UI
- **Pitch Detail Pages**: Full pitch view with PDF viewer and related content
- **Search & Filters**: Search by title/ticker/tags with filtering options
- **SEO Optimized**: Dynamic meta tags, OpenGraph, Twitter cards, sitemap, RSS feed

### Authenticated Dashboard

- **Pitch Management**: Create, edit, publish, and manage pitches
- **Tag System**: Organize pitches with custom tags
- **File Upload**: Drag-and-drop PDF and image uploads
- **Role-based Access**: ADMIN, AUTHOR, and READER roles

### Technical Features

- **PDF Viewer**: In-browser PDF preview with pagination
- **S3-Compatible Storage**: AWS S3, Cloudflare R2, or local MinIO
- **Authentication**: NextAuth with Google OAuth and email/password
- **Database**: PostgreSQL with Prisma ORM
- **Responsive Design**: Mobile-first with dark mode support

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Storage**: S3-compatible (AWS S3, Cloudflare R2, MinIO)
- **PDF Viewing**: react-pdf + PDF.js
- **Icons**: Lucide React
- **Testing**: Playwright
- **Linting**: ESLint + Prettier + Husky

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- S3-compatible storage (or MinIO for local development)

### 1. Clone and Install

```bash
git clone <repository-url>
cd pitchbase
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pitchbase?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# S3 Compatible Storage
S3_ENDPOINT="https://your-s3-endpoint.com"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="pitchbase"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Local Development with Docker

For a complete local development environment:

```bash
# Start PostgreSQL and MinIO
docker-compose up -d

# Configure environment for local services
# Update .env.local:
DATABASE_URL="postgresql://postgres:password@localhost:5432/pitchbase?schema=public"
S3_ENDPOINT="http://localhost:9000"
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET="pitchbase"

# Run migrations and seed
npm run db:migrate
npm run db:seed
```

Access MinIO console at [http://localhost:9001](http://localhost:9001) (minioadmin/minioadmin)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth configuration
│   │   ├── upload/        # File upload endpoints
│   │   ├── pitches/       # Public pitch API
│   │   └── dashboard/     # Dashboard API
│   ├── dashboard/          # Authenticated dashboard
│   ├── p/[slug]/          # Public pitch pages
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── navigation.tsx     # Main navigation
│   ├── pitch-card.tsx     # Pitch card component
│   └── dashboard-layout.tsx
├── lib/                    # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── upload.ts          # S3 upload service
│   └── utils.ts           # Utility functions
└── types/                  # TypeScript type definitions
```

## API Endpoints

### Public Endpoints

- `GET /api/pitches` - List published pitches with filters
- `GET /api/pitches/[slug]` - Get pitch details

### Authenticated Endpoints

- `POST /api/upload` - Get signed upload URL
- `GET /api/dashboard/pitches` - List user's pitches
- `POST /api/dashboard/pitches` - Create new pitch
- `PUT /api/dashboard/pitches/[id]` - Update pitch
- `DELETE /api/dashboard/pitches/[id]` - Delete pitch
- `GET /api/dashboard/tags` - List tags
- `POST /api/dashboard/tags` - Create tag

## User Roles

- **ADMIN**: Full access to all pitches and system settings
- **AUTHOR**: Can create, edit, and manage their own pitches
- **READER**: Can view published pitches (public access)

## Default Admin Account

After running the seed script, you can sign in with:

- **Email**: admin@pitchbase.com
- **Role**: ADMIN

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Options

- **Supabase**: Managed PostgreSQL with built-in auth
- **PlanetScale**: Serverless MySQL alternative
- **Railway**: Simple PostgreSQL hosting
- **AWS RDS**: Production-grade PostgreSQL

### Storage Options

- **AWS S3**: Most popular, reliable
- **Cloudflare R2**: Cost-effective alternative
- **DigitalOcean Spaces**: Simple S3-compatible storage
- **MinIO**: Self-hosted option

## Development Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
npm run db:studio       # Open Prisma Studio

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run format          # Format with Prettier
npm run format:check    # Check formatting

# Testing
npm run test            # Run Playwright tests
npm run test:ui         # Run tests with UI
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For questions and support, please open an issue on GitHub.


