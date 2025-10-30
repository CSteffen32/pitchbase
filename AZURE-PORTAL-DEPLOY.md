# Azure Portal Deployment Guide (Browser-Based)

This guide walks you through deploying PitchBase entirely through the Azure Portal web interface - no CLI needed!

## Step 1: Create Azure Account

1. Go to [portal.azure.com](https://portal.azure.com)
2. Sign in or create a free account
3. Get $200 in free credits for 30 days!

## Step 2: Create Resource Group

1. In Azure Portal, click **"Create a resource"** (top left)
2. Search for **"Resource group"**
3. Click **"Create"**
4. Fill in:
   - **Subscription:** Your subscription
   - **Resource group:** `pitchbase-rg`
   - **Region:** Choose closest to you (e.g., East US)
5. Click **"Review + create"** → **"Create"**

## Step 3: Create PostgreSQL Database

1. In Azure Portal, click **"Create a resource"**
2. Search for **"Azure Database for PostgreSQL flexible server"**
3. Click **"Create"**
4. Fill in the **Basics** tab:

   **Project details:**
   - **Subscription:** Your subscription
   - **Resource group:** Select `pitchbase-rg`
   
   **Server details:**
   - **Server name:** `pitchbase-db` (must be globally unique)
   - **Region:** Same as resource group
   - **PostgreSQL version:** 15
   - **Workload type:** Development
   - **Compute + storage:** Burstable B1ms (1 vCore, 2 GB RAM) - cheapest option
   
   **Administrator account:**
   - **Admin username:** `adminuser`
   - **Password:** Create a strong password (SAVE THIS!)
   
5. Click **"Next: Networking"**
6. **Networking tab:**
   - **Connectivity method:** Public access
   - **Firewall rules:**
     - Click **"+ Add current client IP address"**
     - Click **"+ Add 0.0.0.0 - 255.255.255.255"** (allows Azure services)
   
7. Click **"Next: Security"** → **"Review + create"** → **"Create"**
8. Wait ~5 minutes for database to be created

## Step 4: Create App Service Plan

1. Click **"Create a resource"**
2. Search for **"App Service Plan"**
3. Click **"Create"**
4. Fill in:

   **Basics:**
   - **Subscription:** Your subscription
   - **Resource group:** `pitchbase-rg`
   - **Name:** `pitchbase-plan`
   - **Operating system:** Linux
   - **Region:** Same as resource group
   - **Pricing tier:** 
     - Click **"See all pricing tiers"**
     - Select **"Dev/Test"** tab
     - Choose **"B1"** (Basic) - ~$13/month
     - Click **"Select"**
   
5. Click **"Review + create"** → **"Create"**

## Step 5: Create Web App

1. Click **"Create a resource"**
2. Search for **"Web App"**
3. Click **"Create"**
4. Fill in the **Basics** tab:

   **Project details:**
   - **Subscription:** Your subscription
   - **Resource group:** `pitchbase-rg`
   
   **Instance details:**
   - **Name:** `pitchbase-app` (must be globally unique, add numbers if needed)
   - **Publish:** Code
   - **Runtime stack:** Node.js 20 LTS
   - **Operating system:** Linux
   - **Region:** Same as resource group
   - **App Service Plan:** Select `pitchbase-plan` (created above)
   
5. Click **"Review + create"** → **"Create"**
6. Wait ~2 minutes for web app to be created

## Step 6: Get Database Connection Strings

1. Go to **Resource groups** → `pitchbase-rg`
2. Click on `pitchbase-db` (your PostgreSQL database)
3. In the left menu, click **"Settings"** → **"Connection strings"**
4. Find **"PostgreSQL"** connection string
5. Copy the connection string - it looks like:
   ```
   postgresql://adminuser:PASSWORD@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require
   ```
6. **Save this connection string** - you'll need it in Step 7

**Note:** Replace `PASSWORD` with your actual database password.

## Step 7: Configure Environment Variables

1. Go to **Resource groups** → `pitchbase-rg`
2. Click on `pitchbase-app` (your Web App)
3. In the left menu, click **"Configuration"** → **"Application settings"**
4. Click **"+ New application setting"** and add each of these:

   **Database Settings:**
   ```
   Name: DATABASE_URL
   Value: postgresql://adminuser:[YOUR-PASSWORD]@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require
   ```
   
   ```
   Name: DIRECT_URL
   Value: postgresql://adminuser:[YOUR-PASSWORD]@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require
   ```
   *(Replace [YOUR-PASSWORD] with your actual database password)*

   **NextAuth Settings:**
   ```
   Name: NEXTAUTH_URL
   Value: https://pitchbase-app.azurewebsites.net
   ```
   *(Replace `pitchbase-app` with your actual app name if different)*
   
   ```
   Name: NEXTAUTH_SECRET
   Value: [Generate a random 32-character string]
   ```
   *(You can use a password generator or this: [Go to https://generate-secret.now.sh/32](https://generate-secret.now.sh/32))*

   **Author Access:**
   ```
   Name: AUTHOR_PASSWORD
   Value: [Your author password - choose something secure]
   ```

   **S3 Settings (Your existing S3 credentials):**
   ```
   Name: S3_ENDPOINT
   Value: [Your S3 endpoint]
   
   Name: S3_REGION
   Value: [Your S3 region, e.g., us-east-1]
   
   Name: S3_ACCESS_KEY_ID
   Value: [Your S3 access key]
   
   Name: S3_SECRET_ACCESS_KEY
   Value: [Your S3 secret key]
   
   Name: S3_BUCKET
   Value: [Your S3 bucket name]
   ```

5. Click **"Save"** at the top
6. Azure will restart your app (this is normal)

## Step 8: Deploy Your Code

### Option A: Deploy from GitHub (Recommended)

1. Go to your Web App (`pitchbase-app`)
2. In the left menu, click **"Deployment Center"**
3. Select **"Source":**
   - Choose **"GitHub"**
   - Authorize Azure to access GitHub if prompted
   - Select your repository
   - Select branch: `main`
   - Click **"Save"**
4. Azure will automatically deploy your code!
5. Go to **"Logs"** tab to watch the deployment

### Option B: Deploy via ZIP Upload

1. **Locally, create a deployment package:**
   ```bash
   npm run build
   zip -r deploy.zip . -x "node_modules/*" -x ".next/*" -x ".git/*"
   ```

2. **In Azure Portal:**
   - Go to your Web App
   - Click **"Deployment Center"**
   - Choose **"Local Git"** or **"ZIP Deploy"**
   - Upload your `deploy.zip` file

### Option C: Use VS Code Extension

1. Install **"Azure App Service"** extension in VS Code
2. Right-click your project folder
3. Select **"Deploy to Web App"**
4. Follow the prompts

## Step 9: Initialize Database Schema

After deployment completes:

1. Go to your Web App (`pitchbase-app`)
2. In the left menu, click **"SSH"** or **"Console"**
3. Run these commands:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

   This creates all tables in your PostgreSQL database.

4. (Optional) Seed sample data:
   ```bash
   npm run db:seed
   ```

## Step 10: Test Your Deployment

1. Go to your Web App overview page
2. Click **"Browse"** or visit: `https://pitchbase-app.azurewebsites.net`
3. Test:
   - Homepage loads
   - Author sign-in works (`/auth/signin`)
   - Create a pitch
   - View pitches

## Troubleshooting

### Database Connection Errors

1. **Check firewall rules:**
   - Go to `pitchbase-db` → **"Networking"**
   - Make sure "Allow access to Azure services" is enabled
   - Add your IP if needed

2. **Check connection string:**
   - Make sure password is correct
   - Verify `sslmode=require` is in the connection string

### App Not Starting

1. **Check logs:**
   - Go to Web App → **"Log stream"** (live logs)
   - Or **"Monitoring"** → **"Logs"**

2. **Common issues:**
   - Missing environment variables
   - Wrong NEXTAUTH_URL
   - Database connection failed

### Build Errors

1. **Check deployment logs:**
   - Web App → **"Deployment Center"** → **"Logs"**
   - Look for error messages

2. **Make sure:**
   - `package.json` has correct build script
   - Prisma is in dependencies

## Next Steps

1. **Custom Domain:**
   - Web App → **"Custom domains"**
   - Add your domain and verify ownership

2. **SSL Certificate:**
   - Azure provides free SSL for `*.azurewebsites.net`
   - For custom domains, add SSL certificate

3. **Monitoring:**
   - Web App → **"Application Insights"**
   - Enable monitoring (free tier available)

## Quick Reference

**Your App URL:** `https://pitchbase-app.azurewebsites.net`  
**Database:** `pitchbase-db.postgres.database.azure.com`  
**Resource Group:** `pitchbase-rg`

## Cost Monitoring

- Go to **"Cost Management"** in Azure Portal
- Set up budgets to track spending
- Free tier gives you $200 credit for 30 days

---

**Need help?** Check the logs first - they'll tell you exactly what's wrong!

