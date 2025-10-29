#!/bin/bash
# Azure Deployment Script for PitchBase

set -e

echo "🚀 Starting Azure deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="pitchbase-rg"
APP_NAME="pitchbase-app"
DB_NAME="pitchbase-db"
PLAN_NAME="pitchbase-plan"
LOCATION="eastus"

echo -e "${BLUE}Step 1: Creating Azure resources...${NC}"

# Check if resource group exists
if ! az group show --name $RESOURCE_GROUP &>/dev/null; then
    echo "Creating resource group..."
    az group create --name $RESOURCE_GROUP --location $LOCATION
else
    echo -e "${GREEN}Resource group already exists${NC}"
fi

# Check if database exists
if ! az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $DB_NAME &>/dev/null; then
    echo "Creating PostgreSQL database..."
    az postgres flexible-server create \
        --resource-group $RESOURCE_GROUP \
        --name $DB_NAME \
        --admin-user adminuser \
        --admin-password $(openssl rand -base64 16) \
        --sku-name B_Gen5_1 \
        --tier Burstable \
        --version 15 \
        --location $LOCATION \
        --storage-size 32 \
        --yes
else
    echo -e "${GREEN}Database already exists${NC}"
fi

# Check if App Service Plan exists
if ! az appservice plan show --resource-group $RESOURCE_GROUP --name $PLAN_NAME &>/dev/null; then
    echo "Creating App Service Plan..."
    az appservice plan create \
        --resource-group $RESOURCE_GROUP \
        --name $PLAN_NAME \
        --sku B1 \
        --is-linux
else
    echo -e "${GREEN}App Service Plan already exists${NC}"
fi

# Check if Web App exists
if ! az webapp show --resource-group $RESOURCE_GROUP --name $APP_NAME &>/dev/null; then
    echo "Creating Web App..."
    az webapp create \
        --resource-group $RESOURCE_GROUP \
        --plan $PLAN_NAME \
        --name $APP_NAME \
        --runtime "NODE:20-lts"
else
    echo -e "${GREEN}Web App already exists${NC}"
fi

echo -e "${BLUE}Step 2: Configuring database firewall...${NC}"

# Allow Azure services access
az postgres flexible-server firewall-rule create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_NAME \
    --rule-name AllowAzureServices \
    --start-ip-address 0.0.0.0 \
    --end-ip-address 0.0.0.0 \
    --output none 2>/dev/null || echo "Firewall rule may already exist"

echo -e "${BLUE}Step 3: Getting database connection string...${NC}"

# Get database info
DB_HOST=$(az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $DB_NAME --query fullyQualifiedDomainName -o tsv)
DB_ADMIN=$(az postgres flexible-server show --resource-group $RESOURCE_GROUP --name $DB_NAME --query administratorLogin -o tsv)
DB_PASSWORD=$(echo -e "You'll need to set this manually. Run:\naz postgres flexible-server show --resource-group $RESOURCE_GROUP --name $DB_NAME --query password")

echo "Database Host: $DB_HOST"

echo -e "${BLUE}Step 4: Setting up environment variables...${NC}"

# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "Please update these environment variables in Azure Portal:"
echo "  - DATABASE_URL"
echo "  - NEXTAUTH_URL"
echo "  - NEXTAUTH_SECRET"
echo "  - S3 Configuration"
echo ""
echo "To set them via CLI, run:"
echo ""
echo "az webapp config appsettings set \\"
echo "  --resource-group $RESOURCE_GROUP \\"
echo "  --name $APP_NAME \\"
echo "  --settings \\"
echo "    NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\" \\"
echo "    DATABASE_URL=\"postgresql://adminuser:PASSWORD@$DB_HOST:5432/postgres?schema=public&sslmode=require\" \\"
echo "    NEXTAUTH_URL=\"https://your-domain.com\""

echo -e "${BLUE}Step 5: Building and deploying...${NC}"

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma
echo "Generating Prisma client..."
npm run db:generate

# Build
echo "Building application..."
npm run build

# Create deployment package
echo "Creating deployment package..."
zip -r deploy.zip . -x "node_modules/*" -x ".next/*" -x ".git/*" -x "*.zip" -x "deploy.sh" -x "azure-deployment-guide.md" > /dev/null

# Deploy
echo "Deploying to Azure..."
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --src deploy.zip

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Your app is available at: https://$APP_NAME.azurewebsites.net"
echo ""
echo "Next steps:"
echo "1. Set up your environment variables in Azure Portal"
echo "2. Configure your custom domain (optional)"
echo "3. Set up continuous deployment from GitHub"
echo ""
echo "Run database migrations:"
echo "  az webapp ssh --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo "  Then inside the container: npx prisma db push"

