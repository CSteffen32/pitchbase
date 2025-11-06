# Azure Deployment Center Setup (No GitHub Secrets Needed!)

This is the **easiest way** to deploy from GitHub to Azure - no GitHub Actions or secrets required!

## Step 1: Connect GitHub to Azure

1. Go to **Azure Portal** → Your Web App (`pitchbase-app`)
2. In the left menu, click **"Deployment Center"**
3. Under **"Source"**, select **"GitHub"**
4. Click **"Authorize"** and sign in with your GitHub account
5. Select:
   - **Organization:** `CSteffen32`
   - **Repository:** `pitchbase`
   - **Branch:** `main`
6. Under **"Build provider"**, select **"App Service build service"**
7. Click **"Save"**

## Step 2: Verify Environment Variables

Make sure these are set in Azure (not GitHub):

1. Go to **Configuration** → **Application settings**
2. Verify these exist:
   - `DATABASE_URL` = `postgresql://Charlie35:Pitchbase35!@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require`
   - `DIRECT_URL` = Same as `DATABASE_URL`
   - `NEXTAUTH_URL` = `https://pitchbase-app.azurewebsites.net`
   - `NEXTAUTH_SECRET` = (your random secret)
   - `AUTHOR_PASSWORD` = (your author password)
3. Click **"Save"** if you made changes

## Step 3: Verify Startup Command

1. Go to **Configuration** → **General settings**
2. Scroll to **"Startup Command"**
3. Should be:
   ```
   npx --yes prisma db push --schema=prisma/schema.prisma --accept-data-loss && npm start
   ```
4. If different, set it and click **"Save"**

## Step 4: Test Deployment

1. Make a small change to your code (or just push the current code)
2. Push to GitHub: `git push origin main`
3. Go to **Deployment Center** → **"Logs"** tab
4. Watch the deployment progress
5. Once complete, visit your site: `https://pitchbase-app.azurewebsites.net`

## How It Works

- Azure Deployment Center connects directly to your GitHub repo
- When you push to `main`, Azure automatically:
  1. Pulls the latest code
  2. Runs `npm install`
  3. Runs `npm run build` (which includes `prisma generate`)
  4. Deploys the app
  5. Runs the startup command (which includes `prisma db push`)

**No GitHub Actions needed!** Azure handles everything.

## Troubleshooting

### Deployment Fails
- Check **Deployment Center** → **"Logs"** for errors
- Verify environment variables are set correctly
- Check startup command is correct

### Build Fails
- Check that `package.json` has correct build script
- Verify Prisma is in dependencies (not devDependencies)

### App Doesn't Start
- Check **Log stream** for errors
- Verify `DATABASE_URL` and `DIRECT_URL` are set
- Check database firewall allows Azure services

## Disable GitHub Actions (Optional)

If you want to completely disable GitHub Actions:

1. Go to GitHub → Your repository → **"Settings"**
2. Click **"Actions"** → **"General"**
3. Under **"Workflow permissions"**, select **"Disable Actions"** (optional)
4. Or just leave the workflow file commented out (it won't run)

