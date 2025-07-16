"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
const winston_1 = require("winston");
const { combine, timestamp, errors, json, printf, colorize } = winston_1.format;
// Custom format for development
const developmentFormat = printf((_a) => {
    var { level, message, timestamp } = _a, metadata = __rest(_a, ["level", "message", "timestamp"]);
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
// Create logger instance
const logger = (0, winston_1.createLogger)({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), process.env.NODE_ENV === 'production' ? json() : developmentFormat),
    defaultMeta: { service: 'real-estate-backend' },
    transports: [
        // Console transport for development
        new winston_1.transports.Console({
            format: combine(colorize(), developmentFormat),
        }),
        // File transport for production
        ...(process.env.NODE_ENV === 'production' ? [
            new winston_1.transports.File({
                filename: 'logs/error.log',
                level: 'error',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),
            new winston_1.transports.File({
                filename: 'logs/combined.log',
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }),
        ] : []),
    ],
    // Handle uncaught exceptions
    exceptionHandlers: [
        new winston_1.transports.File({ filename: 'logs/exceptions.log' }),
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
        new winston_1.transports.File({ filename: 'logs/rejections.log' }),
    ],
});
// Create a stream object for Morgan HTTP logging
exports.stream = {
    write: (message) => {
        logger.info(message.trim());
    },
};
exports.default = logger;
