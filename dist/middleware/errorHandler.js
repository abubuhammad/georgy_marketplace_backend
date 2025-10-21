"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.asyncHandler = exports.errorHandler = exports.createError = void 0;
const client_1 = require("@prisma/client");
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const errorHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let details = null;
    // Handle operational errors
    if ('statusCode' in error && error.isOperational) {
        statusCode = error.statusCode || 500;
        message = error.message;
    }
    // Handle Prisma errors
    else if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                statusCode = 409;
                message = 'A record with this information already exists';
                details = { field: error.meta?.target };
                break;
            case 'P2025':
                statusCode = 404;
                message = 'Record not found';
                break;
            case 'P2003':
                statusCode = 400;
                message = 'Invalid reference to related record';
                break;
            default:
                statusCode = 400;
                message = 'Database operation failed';
                details = { code: error.code };
        }
    }
    // Handle Prisma validation errors
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Invalid data provided';
    }
    // Handle JSON parsing errors
    else if (error instanceof SyntaxError && 'body' in error) {
        statusCode = 400;
        message = 'Invalid JSON format';
    }
    // Handle other errors
    else {
        message = error.message || 'Internal Server Error';
    }
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            message: error.message,
            stack: error.stack,
            url: req.url,
            method: req.method,
            body: req.body,
            params: req.params,
            query: req.query
        });
    }
    res.status(statusCode).json({
        success: false,
        error: {
            message,
            ...(details && { details }),
            ...(process.env.NODE_ENV === 'development' && {
                stack: error.stack,
                originalError: error.message
            })
        }
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
const notFound = (req, res, next) => {
    const error = (0, exports.createError)(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map