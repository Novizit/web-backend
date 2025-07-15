import { Request, Response, NextFunction } from 'express';

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Override res.end to capture response time
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: any) {
    const responseTime = Date.now() - start;
    
    // Log performance metrics
    console.log({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: req.ip || 'Unknown',
      timestamp: new Date().toISOString(),
    });
    
    // Add response time header
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};

// Request size monitoring
export const requestSizeMonitor = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('Content-Length') || '0', 10);
  
  if (contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({ 
      message: 'Request entity too large',
      maxSize: '10MB'
    });
  }
  
  next();
};

// Rate limiting by IP
export const rateLimitByIP = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || 'unknown';
  
  // Simple in-memory rate limiting (in production, use Redis)
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  const clientData = global.rateLimitStore.get(clientIP) || { count: 0, resetTime: now + windowMs };
  
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + windowMs;
  } else {
    clientData.count++;
  }
  
  global.rateLimitStore.set(clientIP, clientData);
  
  if (clientData.count > maxRequests) {
    return res.status(429).json({
      message: 'Too many requests from this IP',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.count));
  res.setHeader('X-RateLimit-Reset', clientData.resetTime);
  
  next();
};

// Error tracking
export const errorTracker = (error: any, req: Request, res: Response, next: NextFunction) => {
  // Log error details for monitoring
  console.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });
  
  next(error);
};

// Declare global types
declare global {
  var rateLimitStore: Map<string, { count: number; resetTime: number }>;
} 