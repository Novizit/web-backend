"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query,
        });
    }
    // Don't leak error details in production
    const errorResponse = Object.assign({ message: statusCode === 500 && process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : message }, (process.env.NODE_ENV === 'development' && { stack: err.stack }));
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
