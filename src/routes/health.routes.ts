import { Router } from 'express';
import { prisma } from '../services/prisma.service';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };

  res.status(200).json(healthCheck);
}));

// Detailed health check with database connectivity
router.get('/detailed', asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Check database connectivity
  let dbStatus = 'unknown';
  let dbResponseTime = 0;
  
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbResponseTime = Date.now() - dbStartTime;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'disconnected';
  }

  const totalResponseTime = Date.now() - startTime;

  const detailedHealthCheck = {
    status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    services: {
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
    },
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    },
    responseTime: totalResponseTime,
  };

  const statusCode = dbStatus === 'connected' ? 200 : 503;
  res.status(statusCode).json(detailedHealthCheck);
}));

// Readiness probe for Kubernetes
router.get('/ready', asyncHandler(async (req, res) => {
  try {
    // Check if database is ready
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready' });
  }
}));

// Liveness probe for Kubernetes
router.get('/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

export default router; 