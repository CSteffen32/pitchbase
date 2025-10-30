# PostgreSQL Migration Guide

## Step 1: Create Supabase Database (Recommended - Free)

1. **Sign up at [supabase.com](https://supabase.com)**
   - Free tier includes 500MB database

2. **Create a new project**
   - Choose a project name
   - Set a database password (save this!)
   - Choose a region close to you

3. **Get connection strings**
   - Go to **Settings → Database**
   - Find **Connection string** section
   - Copy both:
     - **Connection pooling** (transaction mode) → Use for `DATABASE_URL`
     - **Direct connection** → Use for `DIRECT_URL`

   Example connection strings:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

## Step 2: Update Environment Variables

### Local Development (.env.local)

Add/update these in your `.env.local`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Replace [YOUR-PASSWORD] and [PROJECT-REF] with your actual values
```

### Vercel Production

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Update `DATABASE_URL` to your Supabase connection string (with `pgbouncer=true`)
3. Add new variable `DIRECT_URL` with your direct connection string
4. Make sure both are set for **Production, Preview, and Development**

## Step 3: Push Schema to Database

Run this locally (requires DIRECT_URL):

```bash
npx prisma db push
```

This will create all tables in your PostgreSQL database.

## Step 4: Generate Prisma Client

```bash
npm run db:generate
```

## Step 5: (Optional) Seed Database

If you want sample data:

```bash
npm run db:seed
```

## Step 6: Test Locally

```bash
npm run dev
```

Test that:
- Homepage loads
- Author sign-in works
- You can create pitches

## Step 7: Deploy to Vercel

1. **Commit and push changes:**
   ```bash
   git add prisma/schema.prisma POSTGRESQL-MIGRATION.md
   git commit -m "Migrate from SQLite to PostgreSQL"
   git push origin main
   ```

2. **Vercel will automatically deploy** but you need to run migrations there too

3. **Run migrations on Vercel** (optional, but recommended):
   - You can use Vercel CLI or add a build script
   - Or use Supabase's SQL editor to run migrations manually

## Troubleshooting

**"Connection error"**
- Check password is correct
- Make sure `DIRECT_URL` doesn't have `pgbouncer=true`
- Verify connection strings match Supabase dashboard

**"Relation does not exist"**
- Run `npx prisma db push` to create tables
- Make sure `DIRECT_URL` is set locally

**"Timeout errors on Vercel"**
- Use the pooled connection string (`pgbouncer=true`) for `DATABASE_URL`
- This prevents connection limit issues

## Alternative: Neon or Railway

### Neon (Serverless PostgreSQL)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project
3. Copy connection string from dashboard
4. No `DIRECT_URL` needed for Neon (handles pooling automatically)

### Railway
1. Sign up at [railway.app](https://railway.app)
2. Create PostgreSQL service
3. Copy connection string
4. Similar setup to Supabase

## Benefits of PostgreSQL

✅ Works perfectly on Vercel serverless  
✅ Persistent data (doesn't reset)  
✅ Better for production  
✅ Connection pooling for performance  
✅ Scalable  

