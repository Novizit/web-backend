# Azure App Service Deployment Script (PowerShell)
# This script deploys the backend to Azure App Service

param(
    [string]$ResourceGroup = "Data_base",
    [string]$AppServiceName = "real-estate-backend",
    [string]$Location = "East US",
    [string]$Sku = "B1"
)

# Error handling
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Azure App Service Deployment" -ForegroundColor Green

# Check if Azure CLI is installed
try {
    $null = Get-Command az -ErrorAction Stop
} catch {
    Write-Host "❌ Azure CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if user is logged in
try {
    $null = az account show 2>$null
} catch {
    Write-Host "⚠️  Please log in to Azure first:" -ForegroundColor Yellow
    az login
}

Write-Host "✅ Azure CLI is ready" -ForegroundColor Green

# Create resource group if it doesn't exist
Write-Host "📦 Creating resource group..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output none

# Create App Service plan if it doesn't exist
Write-Host "📋 Creating App Service plan..." -ForegroundColor Yellow
az appservice plan create `
    --name "${AppServiceName}-plan" `
    --resource-group $ResourceGroup `
    --sku $Sku `
    --is-linux `
    --output none

# Create App Service if it doesn't exist
Write-Host "🌐 Creating App Service..." -ForegroundColor Yellow
az webapp create `
    --name $AppServiceName `
    --resource-group $ResourceGroup `
    --plan "${AppServiceName}-plan" `
    --runtime "NODE|18-lts" `
    --deployment-local-git `
    --output none

# Configure environment variables
Write-Host "⚙️  Configuring environment variables..." -ForegroundColor Yellow

# Set Node.js version
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --linux-fx-version "NODE|18-lts" `
    --output none

# Set startup command
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --startup-file "npm start" `
    --output none

# Configure always on to prevent process from being killed
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --always-on true `
    --output none

# Set idle timeout to prevent process termination
az webapp config set `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --generic-configurations '{"idleTimeoutInMinutes": 0}' `
    --output none

# Enable logging
az webapp log config `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --web-server-logging filesystem `
    --output none

# Configure CORS (update with your frontend URL)
az webapp cors add `
    --resource-group $ResourceGroup `
    --name $AppServiceName `
    --allowed-origins "https://your-frontend-app.azurewebsites.net" `
    --output none

Write-Host "✅ App Service configuration complete" -ForegroundColor Green

# Build and deploy
Write-Host "🔨 Building application..." -ForegroundColor Yellow

# Build the application
npm run build

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Create a temporary directory for the deployment package
$tempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
$deploymentDir = Join-Path $tempDir "deployment"

# Copy files to deployment directory (excluding unnecessary files)
Copy-Item -Path "." -Destination $deploymentDir -Recurse -Exclude @(
    "node_modules",
    ".git",
    "*.log",
    "coverage",
    ".env*",
    "src",
    "prisma"
)

# Create zip file
$zipPath = Join-Path $tempDir "deployment.zip"
Compress-Archive -Path "$deploymentDir\*" -DestinationPath $zipPath -Force

# Deploy to Azure
Write-Host "🚀 Deploying to Azure App Service..." -ForegroundColor Yellow
az webapp deployment source config-zip `