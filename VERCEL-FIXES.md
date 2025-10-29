# Vercel Deployment Fixes

## Common Errors & Solutions

### Error 1: "Prisma Client not generated"
**Fix:** Already fixed in `package.json` - build script now includes `prisma generate`

### Error 2: "Cannot find module '@prisma/client'"
**Fix:** Make sure Prisma is in dependencies (already done)

### Error 3: SQLite Database Issues
**Problem:** SQLite files are ephemeral on Vercel serverless functions.

**Solution A: Initialize database on first API call** (Recommended for now)
- Database will be created automatically on first use
- Data persists during function execution but resets between deployments
- Good for testing, not ideal for production

**Solution B: Use Supabase (Free PostgreSQL)** (Recommended for production)
- 500MB free database
- Better for production apps
- Update `DATABASE_URL` in Vercel to Supabase connection string

### Error 4: Missing Environment Variables
**Fix:** Add ALL these in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
S3_ENDPOINT=<your-endpoint>
S3_REGION=<your-region>
S3_ACCESS_KEY_ID=<your-key>
S3_SECRET_ACCESS_KEY=<your-secret>
S3_BUCKET=<your-bucket>
```

### Error 5: TypeScript/Build Errors
**Fix:** Check build logs in Vercel dashboard for specific errors

### Error 6: "Module not found" errors
**Fix:** Make sure all dependencies are in `dependencies`, not `devDependencies`

## Quick Fix Checklist

✅ Updated `package.json` build script  
✅ Added `postinstall` script for Prisma  
✅ Created `vercel.json` config  
✅ Check environment variables are set  
✅ Push to GitHub to trigger new deployment  

## SQLite on Vercel - Important Notes

⚠️ **SQLite Limitations on Vercel:**
- Serverless functions reset, so database changes may be lost
- Each function instance has its own database file
- Not recommended for production with user data

✅ **Better Options:**
1. **Supabase** (Free PostgreSQL) - Best for production
2. **PlanetScale** (Free MySQL) - Another good option
3. **Railway** (Free PostgreSQL) - Simple setup

## Next Steps After Fixes

1. Commit these changes:
   ```bash
   git add package.json vercel.json
   git commit -m "Fix Vercel deployment: add Prisma generation to build"
   git push
   ```

2. Check Vercel deployment logs for any remaining errors

3. If errors persist, share the specific error messages from Vercel dashboard

