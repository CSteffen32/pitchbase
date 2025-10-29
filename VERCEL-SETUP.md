# Vercel Setup - Quick Guide

## Step 1: Go to Your Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Go to your project (should be imported from GitHub)
3. Click on **Settings** → **Environment Variables**

## Step 2: Add These Environment Variables

Click "Add New" for each:

### Required Variables:

1. **DATABASE_URL**
   - Value: `file:./prisma/dev.db`
   - Environments: Production, Preview, Development

2. **NEXTAUTH_URL**
   - Value: `https://your-project-name.vercel.app` (replace with your actual Vercel URL)
   - Environments: Production, Preview, Development

3. **NEXTAUTH_SECRET**
   - Value: Generate one with: `openssl rand -base64 32`
   - Or use a random string (at least 32 characters)
   - Environments: Production, Preview, Development

4. **S3_ENDPOINT**
   - Value: Your S3 endpoint from `.env.local`
   - Environments: Production, Preview, Development

5. **S3_REGION**
   - Value: Your S3 region (e.g., `us-east-1`)
   - Environments: Production, Preview, Development

6. **S3_ACCESS_KEY_ID**
   - Value: Your S3 access key
   - Environments: Production, Preview, Development

7. **S3_SECRET_ACCESS_KEY**
   - Value: Your S3 secret key
   - Environments: Production, Preview, Development

8. **S3_BUCKET**
   - Value: Your S3 bucket name
   - Environments: Production, Preview, Development

## Step 3: Update Build Settings

Go to **Settings** → **General** → **Build & Development Settings**

Make sure these are set:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (should be auto-detected)
- **Output Directory**: `.next` (should be auto-detected)
- **Install Command**: `npm install` (should be auto-detected)

## Step 4: Build Configuration

✅ **Already Fixed!** The `package.json` now includes Prisma generation:
- Build command runs: `prisma generate && next build`
- Postinstall script runs: `prisma generate`

This ensures Prisma client is generated before building.

## Step 4.5: SQLite Database on Vercel

⚠️ **Important:** SQLite on Vercel has limitations:
- Serverless functions reset, so data may be ephemeral
- Each function instance has its own database
- Best for testing, not production with user data

**Current Setup (SQLite):**
- Database will be initialized automatically on first API call
- Data may reset between deployments
- Fine for testing

**Recommended Upgrade: Supabase (Free PostgreSQL)**
1. Sign up at [supabase.com](https://supabase.com) - 500MB free
2. Create new project → Get connection string from Settings → Database
3. Update `DATABASE_URL` in Vercel to PostgreSQL connection string
4. Update `prisma/schema.prisma` datasource to `postgresql` instead of `sqlite`
5. Commit and push changes

## Step 5: Deploy

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger deployment:
   ```bash
   git commit --allow-empty -m "Trigger Vercel deployment"
   git push origin main
   ```

## Step 6: Verify

After deployment:
1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test the site
3. If database errors occur, check Vercel logs

## Troubleshooting

**Database not found:**
- The database file needs to be created during build
- Vercel's file system is persistent, so once created it will persist

**Build fails:**
- Check logs in Vercel dashboard → Deployments → [Latest] → Build Logs

**Need help?**
- Check Vercel logs: Dashboard → Project → Deployments → Click deployment → View Function Logs

