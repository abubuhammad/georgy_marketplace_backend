import { Request, Response, NextFunction } from 'express';
import '../types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    userId?: string;
    email: string;
    role: string;
    accountStatus?: string;
    jobSeeker?: boolean;
    [key: string]: any;
  };
}

// Roles that require admin approval before they can create content
const ROLES_REQUIRING_APPROVAL = ['seller', 'agent', 'owner', 'developer', 'employer'];

// Roles allowed to post properties
export const PROPERTY_PUBLISHER_ROLES = ['agent', 'owner', 'developer', 'admin'];

// Roles allowed to post jobs
export const JOB_PUBLISHER_ROLES = ['employer', 'admin'];

/**
 * Middleware to check if user's account is active (approved by admin)
 * Used for actions that require an approved account
 */
export const requireActiveAccount = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admin and customer roles don't need approval
  if (req.user.role === 'admin' || req.user.role === 'customer') {
    return next();
  }

  // Check if user's account status is active
  if (req.user.accountStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending approval. Please wait for admin verification before performing this action.',
      accountStatus: req.user.accountStatus
    });
  }

  next();
};

/**
 * Middleware to check if user can publish properties
 * Requires: role in [agent, owner, developer, admin] AND accountStatus = 'active'
 */
export const canPublishProperty = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check role
  if (!PROPERTY_PUBLISHER_ROLES.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only agents, property owners, and developers can publish properties'
    });
  }

  // Admin bypass
  if (req.user.role === 'admin') {
    return next();
  }

  // Check account status
  if (req.user.accountStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Your account must be approved by admin before you can publish properties',
      accountStatus: req.user.accountStatus
    });
  }

  next();
};

/**
 * Middleware to check if user can post jobs
 * Requires: role = 'employer' AND accountStatus = 'active'
 */
export const canPostJob = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check role
  if (!JOB_PUBLISHER_ROLES.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Only employers can post job listings'
    });
  }

  // Admin bypass
  if (req.user.role === 'admin') {
    return next();
  }

  // Check account status
  if (req.user.accountStatus !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Your employer account must be approved by admin before you can post jobs',
      accountStatus: req.user.accountStatus
    });
  }

  next();
};

/**
 * Middleware to check if user can apply for jobs
 * Requires: jobSeeker flag = true (no admin approval needed for this flag)
 */
export const canApplyForJob = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Any user with jobSeeker flag can apply
  if (!req.user.jobSeeker) {
    return res.status(403).json({
      success: false,
      message: 'Please enable job seeker mode in your profile to apply for jobs'
    });
  }

  next();
};

/**
 * Check if a role requires admin approval on registration
 */
export const roleRequiresApproval = (role: string): boolean => {
  return ROLES_REQUIRING_APPROVAL.includes(role);
};

/**
 * Get the initial account status based on role
 */
export const getInitialAccountStatus = (role: string): string => {
  if (roleRequiresApproval(role)) {
    return 'pending';
  }
  return 'active';
};
