# Azure Deployment Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check Log Stream (Most Important!)

1. Go to Azure Portal → Your Web App (`pitchbase-app`)
2. In the left menu, click **"Log stream"** (under Monitoring)
3. Look for errors - copy the **first error line** you see

Common errors you might see:
- `Error: Can't reach database server` → Database connection issue
- `Prisma schema validation error` → Environment variable issue
- `Command failed: prisma db push` → Database permissions issue
- `Module not found: @prisma/client` → Build issue

### 2. Verify Environment Variables

Go to **Configuration** → **Application settings** and verify these exist:

**Required:**
- `DATABASE_URL` - Should start with `postgresql://`
- `DIRECT_URL` - Same as DATABASE_URL
- `NEXTAUTH_URL` - Should be `https://YOUR-APP-NAME.azurewebsites.net`
- `NEXTAUTH_SECRET` - Should be a long random string (32+ characters)
- `AUTHOR_PASSWORD` - Your author login password

**Optional (if using S3):**
- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

**After adding/changing variables:**
1. Click **"Save"** at the top
2. Click **"Continue"** when prompted
3. Wait for the app to restart (~30 seconds)

### 3. Check Startup Command

1. Go to **Configuration** → **General settings**
2. Scroll down to **"Startup Command"**
3. It should be:
   ```
   npx --yes prisma db push --schema=prisma/schema.prisma --accept-data-loss && npm start
   ```
4. If it's different or empty, set it to the above
5. Click **"Save"** and wait for restart

### 4. Verify Database Connection

**Check database firewall:**
1. Go to your PostgreSQL database (`pitchbase-db`)
2. Click **"Networking"** in the left menu
3. Make sure:
   - **"Allow public access"** is enabled
   - **"Allow Azure services and resources to access this server"** is checked
   - There's a firewall rule for `0.0.0.0 - 255.255.255.255` (allows Azure services)

**Test connection string format:**
Your `DATABASE_URL` should look like:
```
postgresql://adminuser:YOUR_PASSWORD@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require
```

**Important:** Replace `YOUR_PASSWORD` with your actual database password (URL-encoded if it contains special characters).

### 5. Check Build Status

1. Go to **Deployment Center** (in your Web App)
2. Click **"Logs"** tab
3. Look for build errors

If build failed:
- Check that `package.json` has `"build": "prisma generate && next build"`
- Check that Prisma is in dependencies (not devDependencies)

### 6. Manual Database Schema Push

If the app starts but database isn't initialized:

1. Go to **SSH** or **Console** (in your Web App)
2. Run:
   ```bash
   npx prisma generate
   npx prisma db push --accept-data-loss
   ```

If SSH doesn't work:
- Try **"Advanced Tools"** → **"Go"** → **"SSH"** (Kudu console)
- Or use **"Debug Console"** (in Configuration → General settings)

## Common Error Messages & Fixes

### "Application Error" or Blank Page

**Cause:** App failed to start

**Fix:**
1. Check **Log stream** for the actual error
2. Most likely: Missing `NEXTAUTH_SECRET` or `DATABASE_URL`
3. Verify all environment variables are set
4. Check startup command is correct

### "Incorrect password" on login

**Cause:** Database connection issue or wrong password

**Fix:**
1. Verify `AUTHOR_PASSWORD` is set correctly in Configuration
2. Check database connection (see step 4 above)
3. Verify database schema is pushed (see step 6)

### "Prisma Client not generated"

**Cause:** Build didn't run `prisma generate`

**Fix:**
1. Check `package.json` has `"postinstall": "prisma generate"`
2. Manually run in SSH: `npx prisma generate`
3. Restart the app

### "Can't reach database server"

**Cause:** Database firewall or connection string issue

**Fix:**
1. Check database firewall rules (see step 4)
2. Verify `DATABASE_URL` is correct
3. Make sure password in connection string is URL-encoded if it has special characters

### Build Succeeds but Deployment Fails

**Cause:** Startup command failing or missing dependencies

**Fix:**
1. Check startup command (see step 3)
2. Verify `package.json` start script includes Prisma
3. Check Log stream for startup errors

## Reset Everything

If nothing works, try a fresh deployment:

1. **Delete and recreate Web App:**
   - Go to your Web App
   - Click **"Delete"** at the top
   - Confirm deletion
   - Recreate following the deployment guide

2. **Or redeploy code:**
   - Go to **Deployment Center**
   - Click **"Sync"** or **"Redeploy"**
   - Wait for deployment to complete

## Still Stuck?

1. **Copy the exact error from Log stream** (first line)
2. **Screenshot your Configuration → Application settings** (hide passwords)
3. **Check:**
   - What's your Web App name?
   - What's your database name?
   - When did you last deploy?

## Quick Health Check Commands

Run these in SSH/Console to diagnose:

```bash
# Check if Prisma is installed
npx prisma --version

# Check environment variables (will show values)
printenv | grep -E "DATABASE_URL|NEXTAUTH|AUTHOR"

# Test database connection
npx prisma db push --dry-run

# Check if app is running
ps aux | grep node
```

