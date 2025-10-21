import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authMiddleware } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
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
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics/platform', getPlatformAnalytics);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// Vendor Management
router.get('/vendors', getVendors);

// Commission Management
router.get('/commission/settings', getCommissionSettings);
router.post('/commission/schemes', createCommissionScheme);
router.put('/commission/schemes/:id', updateCommissionScheme);

// Refund Management
router.get('/refunds', getRefunds);
router.put('/refunds/:id/process', processRefund);

// Content Moderation
router.get('/moderation/queue', getModerationQueue);
router.put('/moderation/:id', moderateContent);

// System Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Legacy routes for backward compatibility
router.post('/revenue-schemes', adminController.createRevenueShareScheme);
router.get('/revenue-schemes', adminController.getRevenueShareSchemes);
router.put('/revenue-schemes/:id', adminController.updateRevenueShareScheme);
router.post('/tax-rules', adminController.createTaxRule);
router.get('/tax-rules', adminController.getTaxRules);
router.get('/payouts/pending', adminController.getPendingPayouts);

export { router as adminRoutes };
