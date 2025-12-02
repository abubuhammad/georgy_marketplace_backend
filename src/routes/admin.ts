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
  updateSystemSettings,
  // Seller Approval & Split Payment endpoints
  getPendingSellers,
  approveSeller,
  rejectSeller,
  suspendSeller,
  getAllSellers,
  getPlatformSettings,
  updatePlatformSettings,
  getBankList,
  verifyBankAccount
} from '../controllers/adminController';
import {
  // Account moderation
  getPendingAccounts,
  approveAccount,
  rejectAccount,
  suspendAccount,
  // Property moderation
  getPendingProperties,
  approveProperty,
  rejectProperty,
  removeProperty,
  // Job moderation
  getPendingJobs,
  approveJob,
  rejectJob,
  closeJob,
  // Stats
  getModerationStats
} from '../controllers/adminModerationController';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(roleAuth(['admin']));

// Platform Overview
router.get('/overview', adminController.getOverview.bind(adminController));

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

// ==================== SELLER APPROVAL & SPLIT PAYMENT ROUTES ====================

// Seller Management
router.get('/sellers', getAllSellers as any);
router.get('/sellers/pending', getPendingSellers as any);
router.post('/sellers/:sellerId/approve', approveSeller as any);
router.post('/sellers/:sellerId/reject', rejectSeller as any);
router.post('/sellers/:sellerId/suspend', suspendSeller as any);

// Platform Settings (Commission Configuration)
router.get('/platform-settings', getPlatformSettings as any);
router.put('/platform-settings', updatePlatformSettings as any);

// Bank Utilities
router.get('/banks', getBankList as any);
router.post('/verify-bank', verifyBankAccount as any);

// ==================== ACCOUNT/PROPERTY/JOB MODERATION ROUTES ====================

// Moderation Stats
router.get('/moderation/stats', getModerationStats as any);

// Account Moderation
router.get('/accounts/pending', getPendingAccounts as any);
router.post('/accounts/:id/approve', approveAccount as any);
router.post('/accounts/:id/reject', rejectAccount as any);
router.post('/accounts/:id/suspend', suspendAccount as any);

// Property Moderation
router.get('/properties/pending', getPendingProperties as any);
router.post('/properties/:id/approve', approveProperty as any);
router.post('/properties/:id/reject', rejectProperty as any);
router.post('/properties/:id/remove', removeProperty as any);

// Job Moderation
router.get('/jobs/pending', getPendingJobs as any);
router.post('/jobs/:id/approve', approveJob as any);
router.post('/jobs/:id/reject', rejectJob as any);
router.post('/jobs/:id/close', closeJob as any);

export { router as adminRoutes };
