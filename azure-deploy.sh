#!/bin/bash

# Azure App Service Deployment Script
# This script deploys the backend to Azure App Service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="Data_base"
APP_SERVICE_NAME="real-estate-backend"
LOCATION="East US"
SKU="B1"
RUNTIME="NODE|18-lts"

echo -e "${GREEN}🚀 Starting Azure App Service Deployment${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Please log in to Azure first:${NC}"
    az login
fi

echo -e "${GREEN}✅ Azure CLI is ready${NC}"

# Create resource group if it doesn't exist
echo -e "${YELLOW}📦 Creating resource group...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION --output none

# Create App Service plan if it doesn't exist
echo -e "${YELLOW}📋 Creating App Service plan...${NC}"
az appservice plan create \
    --name "${APP_SERVICE_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --sku $SKU \
    --is-linux \
    --output none

# Create App Service if it doesn't exist
echo -e "${YELLOW}🌐 Creating App Service...${NC}"
az webapp create \
    --name $APP_SERVICE_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_SERVICE_NAME}-plan" \
    --runtime $RUNTIME \
    --deployment-local-git \
    --output none

# Configure environment variables
echo -e "${YELLOW}⚙️  Configuring environment variables...${NC}"

# Set Node.js version
az webapp config set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_SERVICE_NAME \
    --linux-fx-version "NODE|18-lts" \
    --output none

# Set startup command
az webapp config set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_SERVICE_NAME \
    --startup-file "npm start" \
    --output none

# Enable logging
az webapp log config \
    --resource-group $RESOURCE_GROUP \
    --name $APP_SERVICE_NAME \
    --web-server-logging filesystem \
    --output none

# Configure CORS (update with your frontend URL)
az webapp cors add \
    --resource-group $RESOURCE_GROUP \
    --name $APP_SERVICE_NAME \
    --allowed-origins "https://your-frontend-app.azurewebsites.net" \
    --output none

echo -e "${GREEN}✅ App Service configuration complete${NC}"

# Build and deploy
echo -e "${YELLOW}🔨 Building application...${NC}"

# Build the application
npm run build

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
zip -r deployment.zip . -x "node_modules/*" ".git/*" "*.log" "coverage/*" ".env*" "src/*" "prisma/*"

# Deploy to Azure
echo -e "${YELLOW}🚀 Deploying to Azure App Service...${NC}"
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $APP_SERVICE_NAME \
    --src deployment.zip \
    --output none

# Clean up deployment package
rm deployment.zip

# Get the app URL
APP_URL=$(az webapp show --resource-group $RESOURCE_GROUP --name $APP_SERVICE_NAME --query defaultHostName --output tsv)

echo -e "${GREEN}✅ Deployment successful!${NC}"
echo -e "${GREEN}🌐 Your app is available at: https://${APP_URL}${NC}"
echo -e "${GREEN}🔗 Health check: https://${APP_URL}/health${NC}"
echo -e "${GREEN}📊 API Base URL: https://${APP_URL}/api${NC}"

# Display next steps
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Configure environment variables in Azure App Service"
echo -e "2. Set up Azure Database for PostgreSQL"
echo -e "3. Configure Azure Blob Storage"
echo -e "4. Update CORS settings with your frontend URL"
echo -e "5. Run database migrations: az webapp ssh --resource-group $RESOURCE_GROUP --name $APP_SERVICE_NAME"

echo -e "${GREEN}🎉 Deployment script completed!${NC}" 