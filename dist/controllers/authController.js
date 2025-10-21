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
exports.logout = exports.refreshToken = exports.resetPassword = exports.requestPasswordReset = exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const config_1 = require("../config/config");
const prisma_1 = require("../utils/prisma");
const errorHandler_1 = require("../middleware/errorHandler");
require("../types"); // Import type definitions
// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, config_1.config.jwt.secret, { expiresIn: '7d' } // Use hardcoded value to avoid type issues
    );
};
// Generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign({ userId, type: 'refresh' }, config_1.config.jwt.secret, { expiresIn: '30d' } // Use hardcoded value to avoid type issues
    );
};
// User registration
exports.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, firstName, lastName, role = 'customer' } = req.body;
    // Check if user already exists
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (existingUser) {
        throw (0, errorHandler_1.createError)('User with this email already exists', 409);
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, config_1.config.bcrypt.saltRounds);
    // Create user
    const user = await prisma_1.prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role,
            emailVerified: false
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true
        }
    });
    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    // TODO: Send verification email
    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user,
            token,
            refreshToken
        }
    });
});
// User login
exports.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    // Find user by email
    const user = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401);
    }
    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: userWithoutPassword,
            token,
            refreshToken
        }
    });
});
// Get current user profile
exports.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true
        }
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    res.json({
        success: true,
        data: { user }
    });
});
// Update user profile
exports.updateProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, lastName, avatar } = req.body;
    const user = await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: {
            firstName,
            lastName,
            avatar,
            updatedAt: new Date()
        },
        select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            avatar: true,
            emailVerified: true,
            createdAt: true,
            updatedAt: true
        }
    });
    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user }
    });
});
// Change password
exports.changePassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    // Get current user with password
    const user = await prisma_1.prisma.user.findUnique({
        where: { id: req.user.id }
    });
    if (!user) {
        throw (0, errorHandler_1.createError)('User not found', 404);
    }
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
        throw (0, errorHandler_1.createError)('Current password is incorrect', 400);
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config_1.config.bcrypt.saltRounds);
    // Update password
    await prisma_1.prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
    });
    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});
// Request password reset
exports.requestPasswordReset = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const user = await prisma_1.prisma.user.findUnique({
        where: { email }
    });
    if (!user) {
        // Don't reveal if email exists for security
        res.json({
            success: true,
            message: 'If an account with this email exists, you will receive a password reset link'
        });
        return;
    }
    // Generate reset token
    const resetToken = jwt.sign({ userId: user.id, type: 'password-reset' }, config_1.config.jwt.secret, { expiresIn: '1h' });
    // Save reset token to database
    await prisma_1.prisma.passwordReset.create({
        data: {
            userId: user.id,
            token: resetToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        }
    });
    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
    res.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link'
    });
});
// Reset password with token
exports.resetPassword = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { token, newPassword } = req.body;
    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, config_1.config.jwt.secret);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Invalid or expired reset token', 400);
    }
    if (decoded.type !== 'password-reset') {
        throw (0, errorHandler_1.createError)('Invalid reset token', 400);
    }
    // Check if token exists and is not expired
    const resetRecord = await prisma_1.prisma.passwordReset.findFirst({
        where: {
            token,
            expiresAt: { gt: new Date() },
            used: false
        }
    });
    if (!resetRecord) {
        throw (0, errorHandler_1.createError)('Invalid or expired reset token', 400);
    }
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, config_1.config.bcrypt.saltRounds);
    // Update password and mark token as used
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: { id: resetRecord.userId },
            data: { password: hashedPassword }
        }),
        prisma_1.prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { used: true }
        })
    ]);
    res.json({
        success: true,
        message: 'Password reset successfully'
    });
});
// Refresh token
exports.refreshToken = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw (0, errorHandler_1.createError)('Refresh token required', 401);
    }
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, config_1.config.jwt.secret);
    }
    catch (error) {
        throw (0, errorHandler_1.createError)('Invalid refresh token', 401);
    }
    if (decoded.type !== 'refresh') {
        throw (0, errorHandler_1.createError)('Invalid refresh token', 401);
    }
    // Generate new tokens
    const newToken = generateToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);
    res.json({
        success: true,
        data: {
            token: newToken,
            refreshToken: newRefreshToken
        }
    });
});
// Logout (invalidate refresh token)
exports.logout = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // In a production app, you might want to blacklist the token
    // For now, we'll just return success since JWT tokens are stateless
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});
//# sourceMappingURL=authController.js.map