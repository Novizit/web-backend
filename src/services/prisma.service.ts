import { PrismaClient } from '@prisma/client';
import logger from '../config/logger';

declare global {
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with better error handling
const createPrismaClient = () => {
  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  // Log queries in development
  if (process.env.NODE_ENV === 'development') {
    client.$on('query', (e) => {
      logger.debug(`Query: ${e.query}`);
      logger.debug(`Params: ${e.params}`);
      logger.debug(`Duration: ${e.duration}ms`);
    });
  }

  // Log errors
  client.$on('error', (e) => {
    logger.error('Prisma Error:', e);
  });

  // Handle connection issues
  client.$on('beforeExit', async () => {
    logger.info('Prisma client is shutting down');
  });

  return client;
};

export const prisma = globalThis.prisma || createPrismaClient();

// Ensure single instance in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 