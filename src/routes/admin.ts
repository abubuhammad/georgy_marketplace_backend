import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
import { Response } from 'express';
import {
  getDashboardStats,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getVendors,
  getCommissionSettings,
  updateCommissionScheme,
  createCommissionScheme,
  getRefunds,
  processRefund,
  getPlatformAnalytics,
  getModerationQueue,
  moderateContent,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleAuth(['admin']));

// Dashboard & Analytics
router.get('/dashboard/stats', getDashboardStats as any);
router.get('/analytics/platform', getPlatformAnalytics as any);

// User Management
router.get('/users', getUsers as any);
router.get('/users/:id', getUserDetails as any);
router.put('/users/:id/status', updateUserStatus as any);

// Vendor Management
router.get('/vendors', getVendors as any);

// Commission Management
router.get('/commission/settings', getCommissionSettings as any);
router.post('/commission/schemes', createCommissionScheme as any);
router.put('/commission/schemes/:id', updateCommissionScheme as any);

// Refund Management
router.get('/refunds', getRefunds as any);
router.put('/refunds/:id/process', processRefund as any);

// Content Moderation
router.get('/moderation/queue', getModerationQueue as any);
router.put('/moderation/:id', moderateContent as any);

// System Settings
router.get('/settings', getSystemSettings as any);
router.put('/settings', updateSystemSettings as any);

// Legacy routes for backward compatibility
router.post('/revenue-schemes', adminController.createRevenueShareScheme);
router.get('/revenue-schemes', adminController.getRevenueShareSchemes);
router.put('/revenue-schemes/:id', adminController.updateRevenueShareScheme);
router.post('/tax-rules', adminController.createTaxRule);
router.get('/tax-rules', adminController.getTaxRules);
router.get('/payouts/pending', adminController.getPendingPayouts);

export { router as adminRoutes };
