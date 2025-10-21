import { Router } from 'express';
import { 
  adminController,
  getDashboardStats,
  getPlatformAnalytics,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getVendors,
  getCommissionSettings,
  updateCommissionScheme,
  createCommissionScheme,
  getRefunds,
  processRefund,
  getModerationQueue,
  moderateContent,
  getSystemSettings,
  updateSystemSettings
} from '../controllers/adminController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// Dashboard & Analytics
router.get('/dashboard-stats', getDashboardStats);
router.get('/platform-analytics', getPlatformAnalytics);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.get('/vendors', getVendors);

// Commission Management
router.get('/commission-settings', getCommissionSettings);
router.put('/commission-scheme', updateCommissionScheme);
router.post('/commission-scheme', createCommissionScheme);

// Revenue Share Schemes
router.post('/revenue-schemes', adminController.createRevenueShareScheme);
router.get('/revenue-schemes', adminController.getRevenueShareSchemes);
router.put('/revenue-schemes/:id', adminController.updateRevenueShareScheme);
router.delete('/revenue-schemes/:id', adminController.deleteRevenueShareScheme);

// Tax Rules
router.post('/tax-rules', adminController.createTaxRule);
router.get('/tax-rules', adminController.getTaxRules);
router.put('/tax-rules/:id', adminController.updateTaxRule);
router.delete('/tax-rules/:id', adminController.deleteTaxRule);

// Financial Analytics
router.get('/analytics/payments', adminController.getPaymentAnalytics);
router.get('/analytics/revenue', adminController.getRevenueBreakdown);

// Payout Management
router.get('/payouts/pending', adminController.getPendingPayouts);
router.post('/payouts/process', adminController.processPayouts);

// Refund Management
router.get('/refunds', getRefunds);
router.post('/refunds/:id/process', processRefund);

// Content Moderation
router.get('/moderation/queue', getModerationQueue);
router.post('/moderation/:id/moderate', moderateContent);

// System Configuration
router.get('/config/payment', adminController.getPaymentConfig);
router.put('/config/payment', adminController.updatePaymentConfig);
router.get('/system-settings', getSystemSettings);
router.put('/system-settings', updateSystemSettings);

export { router as adminRoutes };
