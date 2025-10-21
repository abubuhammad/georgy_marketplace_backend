"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.adminRoutes = router;
// All admin routes require authentication and admin role
router.use(auth_1.authenticateToken);
router.use((0, auth_1.authorizeRoles)('admin'));
// Dashboard & Analytics
router.get('/dashboard-stats', adminController_1.getDashboardStats);
router.get('/platform-analytics', adminController_1.getPlatformAnalytics);
// User Management
router.get('/users', adminController_1.getUsers);
router.get('/users/:id', adminController_1.getUserDetails);
router.put('/users/:id/status', adminController_1.updateUserStatus);
router.get('/vendors', adminController_1.getVendors);
// Commission Management
router.get('/commission-settings', adminController_1.getCommissionSettings);
router.put('/commission-scheme', adminController_1.updateCommissionScheme);
router.post('/commission-scheme', adminController_1.createCommissionScheme);
// Revenue Share Schemes
router.post('/revenue-schemes', adminController_1.adminController.createRevenueShareScheme);
router.get('/revenue-schemes', adminController_1.adminController.getRevenueShareSchemes);
router.put('/revenue-schemes/:id', adminController_1.adminController.updateRevenueShareScheme);
router.delete('/revenue-schemes/:id', adminController_1.adminController.deleteRevenueShareScheme);
// Tax Rules
router.post('/tax-rules', adminController_1.adminController.createTaxRule);
router.get('/tax-rules', adminController_1.adminController.getTaxRules);
router.put('/tax-rules/:id', adminController_1.adminController.updateTaxRule);
router.delete('/tax-rules/:id', adminController_1.adminController.deleteTaxRule);
// Financial Analytics
router.get('/analytics/payments', adminController_1.adminController.getPaymentAnalytics);
router.get('/analytics/revenue', adminController_1.adminController.getRevenueBreakdown);
// Payout Management
router.get('/payouts/pending', adminController_1.adminController.getPendingPayouts);
router.post('/payouts/process', adminController_1.adminController.processPayouts);
// Refund Management
router.get('/refunds', adminController_1.getRefunds);
router.post('/refunds/:id/process', adminController_1.processRefund);
// Content Moderation
router.get('/moderation/queue', adminController_1.getModerationQueue);
router.post('/moderation/:id/moderate', adminController_1.moderateContent);
// System Configuration
router.get('/config/payment', adminController_1.adminController.getPaymentConfig);
router.put('/config/payment', adminController_1.adminController.updatePaymentConfig);
router.get('/system-settings', adminController_1.getSystemSettings);
router.put('/system-settings', adminController_1.updateSystemSettings);
//# sourceMappingURL=adminRoutes.js.map