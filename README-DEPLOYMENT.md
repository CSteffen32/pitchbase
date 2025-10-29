# Quick Start: Deploy PitchBase to Azure

## Prerequisites

1. Azure account ([Sign up for free](https://azure.microsoft.com/free/))
2. Azure CLI installed
3. Node.js and npm

## Quick Deployment (5 Minutes)

### 1. Login to Azure

```bash
az login
```

### 2. Run the Deployment Script

```bash
./deploy-to-azure.sh
```

This script will:
- Create all necessary Azure resources
- Configure your database
- Build and deploy your application

### 3. Configure Environment Variables

After deployment, you'll need to set these in Azure Portal:

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (e.g., `https://pitchbase-app.azurewebsites.net`)
- `NEXTAUTH_SECRET` - Random secret (script will generate this)
- `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET` - Your AWS S3 credentials

**Set them via CLI:**
```bash
az webapp config appsettings set \
  --resource-group pitchbase-rg \
  --name pitchbase-app \
  --settings \
    NEXTAUTH_SECRET="your-generated-secret" \
    DATABASE_URL="postgresql://..." \
    NEXTAUTH_URL="https://pitchbase-app.azurewebsites.net"
```

### 4. Run Database Migrations

```bash
# SSH into your Azure app
az webapp ssh --resource-group pitchbase-rg --name pitchbase-app

# Inside the container, run:
npx prisma db push
npm run db:seed  # Optional
```

## Access Your App

Visit: `https://pitchbase-app.azurewebsites.net`

## Adding a Custom Domain

### Option A: Via Azure Portal
1. Go to your Web App in Azure Portal
2. Click "Custom domains"
3. Add your domain and follow verification steps

### Option B: Via CLI
```bash
# Add domain
az webapp config hostname add \
  --webapp-name pitchbase-app \
  --resource-group pitchbase-rg \
  --hostname pitchbase.com

# Bind SSL certificate
az webapp config ssl bind \
  --name pitchbase-app \
  --resource-group pitchbase-rg \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

## Continuous Deployment from GitHub

### 1. Get Publish Profile

```bash
az webapp deployment list-publishing-profiles \
  --name pitchbase-app \
  --resource-group pitchbase-rg \
  --xml > publish-profile.xml
```

### 2. Add Secret to GitHub

1. Go to your GitHub repository
2. Settings → Secrets → Actions
3. Add new secret: `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Paste the contents of `publish-profile.xml`

### 3. Add Other Secrets

Also add to GitHub Secrets:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `S3_*` variables

### 4. Push to Main

```bash
git add .
git commit -m "Prepare for Azure deployment"
git push origin main
```

GitHub Actions will automatically deploy!

## Cost Optimization

**Current Setup (~$40/month):**
- App Service B1: $13/month
- PostgreSQL Burstable: $25/month

**Ways to reduce costs:**
1. Use App Service Free tier (with limitations)
2. Use Azure Database for PostgreSQL Basic tier
3. Use consumption-based pricing

## Monitoring

```bash
# View live logs
az webapp log tail --name pitchbase-app --resource-group pitchbase-rg

# Download logs
az webapp log download --name pitchbase-app --resource-group pitchbase-rg
```

## Troubleshooting

### Database Connection Issues

```bash
# Check firewall rules
az postgres flexible-server firewall-rule list \
  --resource-group pitchbase-rg \
  --name pitchbase-db
```

### App Crashes

```bash
# View application logs
az webapp log show --name pitchbase-app --resource-group pitchbase-rg
```

### Need to Redeploy

```bash
./deploy-to-azure.sh
```

## Environment-Specific Configs

### Production
- Use Azure Key Vault for secrets
- Enable Application Insights
- Set up auto-scaling
- Configure backup for database

### Staging
Create a deployment slot:
```bash
az webapp deployment slot create \
  --resource-group pitchbase-rg \
  --name pitchbase-app \
  --slot staging
```

## Support

For detailed instructions, see: `azure-deployment-guide.md`

## Quick Reference

```bash
# View app
az webapp browse --name pitchbase-app --resource-group pitchbase-rg

# Restart app
az webapp restart --name pitchbase-app --resource-group pitchbase-rg

# Scale up
az appservice plan update \
  --resource-group pitchbase-rg \
  --name pitchbase-plan \
  --sku S1

# Delete everything (careful!)
az group delete --name pitchbase-rg --yes
```

