# Real Estate Platform Backend

A robust Node.js backend API for the Real Estate Platform built with Express, Prisma, and Azure services.

## 🚀 Features

- **RESTful API** for property management
- **Azure Blob Storage** integration for image uploads
- **PostgreSQL** database with Prisma ORM
- **Security** with Helmet, CORS, and rate limiting
- **Logging** with Winston
- **Health checks** for monitoring
- **Docker** support for containerization
- **Azure App Service** deployment ready

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database
- Azure account (for deployment)
- Azure CLI (for deployment)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Copy `env.example` to `.env` and configure the following:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/real_estate_db"

# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Azure Blob Storage
AZURE_STORAGE_ACCOUNT=your_storage_account
AZURE_STORAGE_ACCESS_KEY=your_access_key
AZURE_BLOB_CONTAINER=property-images
AZURE_SAS_EXPIRY_HOURS=1
```

## 🐳 Docker

### Build and run with Docker

```bash
# Build the image
docker build -t real-estate-backend .

# Run the container
docker run -p 3001:3001 --env-file .env real-estate-backend
```

### Docker Compose

```bash
docker-compose up -d
```

## 🚀 Azure App Service Deployment

### Prerequisites

1. **Azure CLI** installed and logged in
2. **Azure subscription** with appropriate permissions
3. **Azure Database for PostgreSQL** (optional, can use local DB)

### Quick Deployment

#### Using Bash (Linux/macOS)
```bash
chmod +x azure-deploy.sh
./azure-deploy.sh
```

#### Using PowerShell (Windows)
```powershell
.\azure-deploy.ps1
```

### Manual Deployment

1. **Create Azure resources**
   ```bash
   # Create resource group
   az group create --name real-estate-platform-rg --location "East US"
   
   # Create App Service plan
   az appservice plan create --name real-estate-backend-plan --resource-group real-estate-platform-rg --sku B1 --is-linux
   
   # Create App Service
   az webapp create --name real-estate-backend --resource-group real-estate-platform-rg --plan real-estate-backend-plan --runtime "NODE|18-lts"
   ```

2. **Configure environment variables**
   ```bash
   az webapp config appsettings set --resource-group real-estate-platform-rg --name real-estate-backend --settings \
     DATABASE_URL="your-database-url" \
     NODE_ENV="production" \
     AZURE_STORAGE_ACCOUNT="your-storage-account" \
     AZURE_STORAGE_ACCESS_KEY="your-access-key"
   ```

3. **Deploy the application**
   ```bash
   # Build the application
   npm run build
   
   # Deploy
   az webapp deployment source config-zip --resource-group real-estate-platform-rg --name real-estate-backend --src deployment.zip
   ```

### Azure Services Setup

#### 1. Azure Database for PostgreSQL

```bash
# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group real-estate-platform-rg \
  --name real-estate-db \
  --admin-user postgres \
  --admin-password "YourPassword123!" \
  --sku-name Standard_B1ms \
  --version 14

# Create database
az postgres flexible-server db create \
  --resource-group real-estate-platform-rg \
  --server-name real-estate-db \
  --database-name real_estate_db
```

#### 2. Azure Blob Storage

```bash
# Create storage account
az storage account create \
  --resource-group real-estate-platform-rg \
  --name realestatestorage \
  --location "East US" \
  --sku Standard_LRS

# Create blob container
az storage container create \
  --account-name realestatestorage \
  --name property-images
```

## 📊 API Endpoints

### Health Check
- `GET /health` - Application health status

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create new property
- `GET /api/properties/:id` - Get property by ID
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Azure Blob Storage
- `POST /api/azure/sas-url` - Get SAS URL for image upload

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🔒 Security

- **Helmet** for security headers
- **CORS** configuration
- **Rate limiting** to prevent abuse
- **Input validation** with Zod
- **Error handling** middleware
- **Non-root user** in Docker container

## 📈 Monitoring

- **Health checks** at `/health`
- **Structured logging** with Winston
- **Request logging** with Morgan
- **Error tracking** and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the logs in Azure App Service 