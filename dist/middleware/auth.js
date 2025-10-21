"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorizeRoles = exports.authenticateToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = require("../config/config");
const prisma_1 = require("../lib/prisma");
const errorHandler_1 = require("./errorHandler");
require("../types"); // Import type definitions
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            throw (0, errorHandler_1.createError)('Access token required', 401);
        }
        // Verify token
        const decoded = jwt.verify(token, config_1.config.jwt.secret);
        // Get user from database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            throw (0, errorHandler_1.createError)('User not found', 401);
        }
        req.user = {
            id: user.id,
            userId: user.id,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next((0, errorHandler_1.createError)('Invalid token', 401));
        }
        else if (error instanceof jwt.TokenExpiredError) {
            next((0, errorHandler_1.createError)('Token expired', 401));
        }
        else {
            next(error);
        }
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next((0, errorHandler_1.createError)('Authentication required', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next((0, errorHandler_1.createError)('Insufficient permissions', 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
// Optional authentication - doesn't throw error if no token
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, config_1.config.jwt.secret);
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    emailVerified: true
                }
            });
            if (user) {
                req.user = {
                    id: user.id,
                    userId: user.id,
                    email: user.email,
                    role: user.role
                };
            }
        }
        next();
    }
    catch (error) {
        // Don't throw error for optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map