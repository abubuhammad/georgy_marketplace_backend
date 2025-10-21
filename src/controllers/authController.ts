import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { prisma } from '../utils/prisma';
import { asyncHandler, createError } from '../middleware/errorHandler';
import '../types'; // Import type definitions

// Generate JWT token
const generateToken = (userId: string): string => {
  return jwt.sign(
    { userId }, 
    config.jwt.secret as string,
    { expiresIn: '7d' } // Use hardcoded value to avoid type issues
  );
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh' }, 
    config.jwt.secret as string,
    { expiresIn: '30d' } // Use hardcoded value to avoid type issues
  );
};

// User registration
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role = 'customer' } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  // Create user
  const user = await prisma.user.create({
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
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw createError('Invalid email or password', 401);
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
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
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
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: { user }
  });
});

// Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
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
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  // Get current user with password
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isValidPassword = await bcrypt.compare(currentPassword, user.password);

  if (!isValidPassword) {
    throw createError('Current password is incorrect', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedPassword }
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Request password reset
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
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
  const resetToken = jwt.sign(
    { userId: user.id, type: 'password-reset' },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  // Save reset token to database
  await prisma.passwordReset.create({
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
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.secret) as { userId: string; type: string };
  } catch (error) {
    throw createError('Invalid or expired reset token', 400);
  }

  if (decoded.type !== 'password-reset') {
    throw createError('Invalid reset token', 400);
  }

  // Check if token exists and is not expired
  const resetRecord = await prisma.passwordReset.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
      used: false
    }
  });

  if (!resetRecord) {
    throw createError('Invalid or expired reset token', 400);
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

  // Update password and mark token as used
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetRecord.userId },
      data: { password: hashedPassword }
    }),
    prisma.passwordReset.update({
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
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token required', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.secret) as { userId: string; type: string };
  } catch (error) {
    throw createError('Invalid refresh token', 401);
  }

  if (decoded.type !== 'refresh') {
    throw createError('Invalid refresh token', 401);
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
export const logout = asyncHandler(async (req: Request, res: Response) => {
  // In a production app, you might want to blacklist the token
  // For now, we'll just return success since JWT tokens are stateless
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});
