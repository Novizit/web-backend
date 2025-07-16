"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_service_1 = require("../services/prisma.service");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// Basic health check
router.get('/', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
})));
// Detailed health check with database connectivity
router.get('/detailed', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const startTime = Date.now();
    // Check database connectivity
    let dbStatus = 'unknown';
    let dbResponseTime = 0;
    try {
        const dbStartTime = Date.now();
        yield prisma_service_1.prisma.$queryRaw `SELECT 1`;
        dbResponseTime = Date.now() - dbStartTime;
        dbStatus = 'connected';
    }
    catch (error) {
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
})));
// Readiness probe for Kubernetes
router.get('/ready', (0, errorHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if database is ready
        yield prisma_service_1.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({ status: 'ready' });
    }
    catch (error) {
        res.status(503).json({ status: 'not ready' });
    }
})));
// Liveness probe for Kubernetes
router.get('/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
});
exports.default = router;
