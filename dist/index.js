"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const azure_routes_1 = __importDefault(require("./routes/azure.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const security_1 = require("./middleware/security");
const logger_1 = __importDefault(require("./config/logger"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security middleware
app.use(security_1.securityHeaders);
app.use(security_1.rateLimiter);
// CORS configuration
app.use((0, cors_1.default)(security_1.corsOptions));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging
if (process.env.NODE_ENV !== 'test') {
    app.use(security_1.requestLogger);
}
// Health check routes
app.use('/health', health_routes_1.default);
// API routes
app.use('/api/properties', property_routes_1.default);
// Azure Blob Storage SAS URL route
app.use('/api/azure', azure_routes_1.default);
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Real Estate Platform Backend API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});
// 404 handler - catch all unmatched routes
app.use((req, res) => {
    logger_1.default.warn(`Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});
// Error handling middleware (must be last)
app.use(errorHandler_1.errorHandler);
// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    logger_1.default.info(`${signal} received, shutting down gracefully`);
    // Close server
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
    // Force close after 10 seconds
    setTimeout(() => {
        logger_1.default.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};
// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Start server
const server = app.listen(PORT, () => {
    logger_1.default.info(`🚀 Server is running on port ${PORT}`);
    logger_1.default.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger_1.default.info(`🔗 Health check: http://localhost:${PORT}/health`);
    logger_1.default.info(`🌐 API Base URL: http://localhost:${PORT}/api`);
});
