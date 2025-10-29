# Azure Deployment Guide for PitchBase

This guide will help you deploy PitchBase to Azure with a custom domain.

## Prerequisites

- Azure Account (free trial available at azure.microsoft.com)
- Custom domain name (optional, you can use Azure's default domain)
- Azure CLI installed ([Download here](https://aka.ms/installazurecliwindows))

## Step 1: Setup Azure Resources

### 1.1 Create Resource Group

```bash
# Login to Azure
az login

# Create a resource group (choose a location near you, e.g., eastus, westeurope)
az group create --name pitchbase-rg --location eastus
```

### 1.2 Create PostgreSQL Flexible Server Database

```bash
# Create PostgreSQL server (adjust pricing tier as needed)
az postgres flexible-server create \
  --resource-group pitchbase-rg \
  --name pitchbase-db \
  --admin-user adminuser \
  --admin-password <STRONG_PASSWORD> \
  --sku-name B_Gen5_1 \
  --tier Burstable \
  --version 15 \
  --location eastus \
  --storage-size 32
```

### 1.3 Create App Service Plan

```bash
# Create App Service Plan (Basic tier for cost-effective hosting)
az appservice plan create \
  --resource-group pitchbase-rg \
  --name pitchbase-plan \
  --sku B1 \
  --is-linux
```

### 1.4 Create Web App

```bash
# Create the web app
az webapp create \
  --resource-group pitchbase-rg \
  --plan pitchbase-plan \
  --name pitchbase-app \
  --runtime "NODE:20-lts"
```

### 1.5 Get Database Connection String

```bash
# Get the connection string
az postgres flexible-server show \
  --resource-group pitchbase-rg \
  --name pitchbase-db \
  --query "{FullyQualifiedDomainName:fullyQualifiedDomainName}"
```

Note the output - you'll need it for DATABASE_URL.

## Step 2: Configure Database

### 2.1 Calculate DATABASE_URL

Format: `postgresql://adminuser:PASSWORD@pitchbase-db.azure.com:5432/postgres?schema=public&sslmode=require`

Get the connection string:
```bash
az postgres flexible-server connection-string show \
  --resource-group pitchbase-rg \
  --name pitchbase-db \
  --query connectionStrings.postgres
```

### 2.2 Configure App Service Environment Variables

```bash
# Set DATABASE_URL
az webapp config appsettings set \
  --resource-group pitchbase-rg \
  --name pitchbase-app \
  --settings DATABASE_URL="$DATABASE_URL" \
             DIRECT_URL="$DATABASE_URL" \
             NEXTAUTH_URL="https://your-domain.com" \
             NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
             S3_ENDPOINT="your-s3-endpoint" \
             S3_REGION="your-region" \
             S3_ACCESS_KEY_ID="your-key" \
             S3_SECRET_ACCESS_KEY="your-secret" \
             S3_BUCKET="your-bucket"
```

## Step 3: Deploy Your Application

### 3.1 Install Dependencies and Build

```bash
# Navigate to project directory
cd /Users/charlie/Development/PitchBase

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate
```

### 3.2 Deploy with Azure CLI

```bash
# Create a ZIP deployment package
zip -r deploy.zip . -x "node_modules/*" -x ".next/*" -x ".git/*" -x "deploy.zip"

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group pitchbase-rg \
  --name pitchbase-app \
  --src deploy.zip
```

### 3.3 Run Database Migrations

After deployment, you need to run migrations. SSH into your app:

```bash
az webapp ssh --resource-group pitchbase-rg --name pitchbase-app
```

Then inside the container:
```bash
# Generate Prisma client
npx prisma generate

# Push schema
npx prisma db push

# Optional: Seed database
npm run db:seed
```

## Step 4: Configure Custom Domain (Optional)

### 4.1 Add Custom Domain to Azure

1. Go to Azure Portal → pitchbase-app → Custom domains
2. Add your domain (e.g., `pitchbase.com`)
3. Follow the steps to verify ownership

### 4.2 Configure DNS

Add these DNS records to your domain provider:

```
Type: A
Name: @
Value: <Azure IP Address>

Type: CNAME
Name: www
Value: pitchbase-app.azurewebsites.net
```

### 4.3 Update SSL Certificate

Azure automatically provides a free SSL certificate through App Service Managed Certificates:

```bash
az webapp config hostname add \
  --webapp-name pitchbase-app \
  --resource-group pitchbase-rg \
  --hostname your-domain.com

az webapp config ssl bind \
  --name pitchbase-app \
  --resource-group pitchbase-rg \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

## Step 5: Post-Deployment Configuration

### 5.1 Set Deployment Slot

For zero-downtime deployments:

```bash
az webapp deployment slot create \
  --resource-group pitchbase-rg \
  --name pitchbase-app \
  --slot staging
```

### 5.2 Enable Logging

```bash
az webapp log config \
  --resource-group pitchbase-rg \
  --name pitchbase-app \
  --application-logging filesystem \
  --detailed-error-messages true \
  --failed-request-tracing true \
  --web-server-logging filesystem
```

## Alternative: GitHub Actions Deployment (Recommended)

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'pitchbase-app'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

## Cost Estimates

- **App Service Plan (B1)**: ~$13/month
- **PostgreSQL (Burstable)**: ~$25/month
- **Total**: ~$40/month for basic deployment

## Monitoring

Access your app at: `https://pitchbase-app.azurewebsites.net`

Monitor logs:
```bash
az webapp log tail --name pitchbase-app --resource-group pitchbase-rg
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if database allows Azure services
az postgres flexible-server firewall-rule create \
  --resource-group pitchbase-rg \
  --name pitchbase-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### View Application Logs

```bash
az webapp log download --resource-group pitchbase-rg --name pitchbase-app
```

## Next Steps

1. Set up continuous deployment from GitHub
2. Configure auto-scaling if needed
3. Set up Azure Application Insights for monitoring
4. Configure backup for database

## Support

For issues:
- Azure Portal: portal.azure.com
- Azure CLI: github.com/Azure/azure-cli
- Next.js Deployment: nextjs.org/docs/deployment

