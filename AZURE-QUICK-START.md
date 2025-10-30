# Azure Quick Start Guide

## Prerequisites

1. **Azure Account** - [Sign up for free](https://azure.microsoft.com/free/)
2. **Azure CLI** - [Install](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **Node.js** - Already installed

## Quick Deployment (15 minutes)

### Step 1: Login to Azure

```bash
az login
```

This will open a browser to authenticate.

### Step 2: Install Prerequisites (if needed)

```bash
# Install PostgreSQL extension for Azure CLI
az extension add --name db-up
```

### Step 3: Run Deployment Script

```bash
chmod +x deploy-to-azure.sh
./deploy-to-azure.sh
```

This script will:
- ✅ Create resource group
- ✅ Create PostgreSQL database
- ✅ Create App Service Plan
- ✅ Create Web App
- ✅ Configure firewall rules
- ✅ Set up environment variables

**Note:** The script may prompt you for a database password. Choose a strong password and save it!

### Step 4: Get Database Connection String

After the script runs, get your connection strings:

```bash
# Get connection string
az postgres flexible-server connection-string show \
  --resource-group pitchbase-rg \
  --name pitchbase-db \
  --query connectionStrings.postgresql | tr -d '"'
```

Save this connection string - you'll need it for the next step.

### Step 5: Set Environment Variables

Update environment variables in Azure Portal OR via CLI:

**Via Azure Portal:**
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: Resource Groups → pitchbase-rg → pitchbase-app
3. Click **Configuration** → **Application settings**
4. Add/update these variables:

**Required Variables:**
```
DATABASE_URL = postgresql://adminuser:[PASSWORD]@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require
DIRECT_URL = postgresql://adminuser:[PASSWORD]@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require
NEXTAUTH_URL = https://pitchbase-app.azurewebsites.net
NEXTAUTH_SECRET = [generate with: openssl rand -base64 32]
AUTHOR_PASSWORD = [your author password]
S3_ENDPOINT = [your S3 endpoint]
S3_REGION = [your S3 region]
S3_ACCESS_KEY_ID = [your S3 access key]
S3_SECRET_ACCESS_KEY = [your S3 secret key]
S3_BUCKET = [your S3 bucket]
```

**Via CLI:**
```bash
# Generate NEXTAUTH_SECRET
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set all environment variables
az webapp config appsettings set \
  --resource-group pitchbase-rg \
  --name pitchbase-app \
  --settings \
    DATABASE_URL="postgresql://adminuser:[PASSWORD]@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require" \
    DIRECT_URL="postgresql://adminuser:[PASSWORD]@pitchbase-db.postgres.database.azure.com:5432/postgres?sslmode=require" \
    NEXTAUTH_URL="https://pitchbase-app.azurewebsites.net" \
    NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
    AUTHOR_PASSWORD="your-author-password" \
    S3_ENDPOINT="your-s3-endpoint" \
    S3_REGION="your-region" \
    S3_ACCESS_KEY_ID="your-key" \
    S3_SECRET_ACCESS_KEY="your-secret" \
    S3_BUCKET="your-bucket"
```

### Step 6: Deploy Your Application

**Option A: Deploy from Local Machine**

```bash
# Build the app
npm run build

# Deploy to Azure (using Azure CLI)
az webapp deployment source config-zip \
  --resource-group pitchbase-rg \
  --name pitchbase-app \
  --src deploy.zip
```

**Option B: Deploy from GitHub (Recommended)**

1. **Get Publishing Profile:**
   ```bash
   az webapp deployment list-publishing-profiles \
     --name pitchbase-app \
     --resource-group pitchbase-rg \
     --xml > publish-profile.xml
   ```

2. **Add to GitHub Secrets:**
   - Go to your GitHub repo → Settings → Secrets → Actions
   - Add `AZURE_WEBAPP_PUBLISH_PROFILE` with contents of `publish-profile.xml`
   - Also add all environment variables as secrets

3. **Push to GitHub:**
   ```bash
   git push origin main
   ```
   GitHub Actions will automatically deploy!

### Step 7: Run Database Migrations

After deployment, initialize the database schema:

```bash
# SSH into your Azure app
az webapp ssh --resource-group pitchbase-rg --name pitchbase-app

# Inside the container, run:
npx prisma db push
npm run db:seed  # Optional - adds sample data
```

### Step 8: Access Your App

Visit: `https://pitchbase-app.azurewebsites.net`

## Troubleshooting

### Database Connection Failed

```bash
# Check firewall rules allow Azure services
az postgres flexible-server firewall-rule create \
  --resource-group pitchbase-rg \
  --name pitchbase-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### View Logs

```bash
# Live logs
az webapp log tail --name pitchbase-app --resource-group pitchbase-rg

# Download logs
az webapp log download --name pitchbase-app --resource-group pitchbase-rg
```

### Restart App

```bash
az webapp restart --name pitchbase-app --resource-group pitchbase-rg
```

## Cost Estimate

**Current Setup:**
- App Service B1: ~$13/month
- PostgreSQL Burstable B_Gen5_1: ~$25/month
- **Total: ~$38/month**

**Free Tier Options:**
- App Service Free tier (limited)
- Use external free PostgreSQL (Supabase/Neon) instead of Azure DB

## Next Steps

1. ✅ Test author sign-in
2. ✅ Create your first pitch
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring (Application Insights)

For detailed instructions, see: `azure-deployment-guide.md`

