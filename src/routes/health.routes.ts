import { Router } from 'express';
import { prisma } from '../services/prisma.service';
import logger from '../config/logger';

const router = Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'real-estate-backend',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database health check
router.get('/db', async (req, res) => {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Test a simple query
    const propertyCount = await prisma.property.count();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      propertyCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Database health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  } finally {
    await prisma.$disconnect();
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 8080
    }
  };

  try {
    // Test database
    await prisma.$connect();
    const propertyCount = await prisma.property.count();
    health.checks.database = 'connected';
    health.checks.propertyCount = propertyCount;
  } catch (error) {
    health.status = 'unhealthy';
    health.checks.database = 'disconnected';
    health.checks.databaseError = error instanceof Error ? error.message : 'Unknown error';
  } finally {
    await prisma.$disconnect();
  }

  const statusCode = health.status === 'healthy' ? 200 : 500;
  res.status(statusCode).json(health);
});

export default router; 