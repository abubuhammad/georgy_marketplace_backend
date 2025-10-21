"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const adminController_2 = require("../controllers/adminController");
const router = (0, express_1.Router)();
exports.adminRoutes = router;
// All admin routes require authentication and admin role
router.use(auth_1.authMiddleware);
router.use((0, roleAuth_1.roleAuth)(['admin']));
// Dashboard & Analytics
router.get('/dashboard/stats', adminController_2.getDashboardStats);
router.get('/analytics/platform', adminController_2.getPlatformAnalytics);
// User Management
router.get('/users', adminController_2.getUsers);
router.get('/users/:id', adminController_2.getUserDetails);
router.put('/users/:id/status', adminController_2.updateUserStatus);
// Vendor Management
router.get('/vendors', adminController_2.getVendors);
// Commission Management
router.get('/commission/settings', adminController_2.getCommissionSettings);
router.post('/commission/schemes', adminController_2.createCommissionScheme);
router.put('/commission/schemes/:id', adminController_2.updateCommissionScheme);
// Refund Management
router.get('/refunds', adminController_2.getRefunds);
router.put('/refunds/:id/process', adminController_2.processRefund);
// Content Moderation
router.get('/moderation/queue', adminController_2.getModerationQueue);
router.put('/moderation/:id', adminController_2.moderateContent);
// System Settings
router.get('/settings', adminController_2.getSystemSettings);
router.put('/settings', adminController_2.updateSystemSettings);
// Legacy routes for backward compatibility
router.post('/revenue-schemes', adminController_1.adminController.createRevenueShareScheme);
router.get('/revenue-schemes', adminController_1.adminController.getRevenueShareSchemes);
router.put('/revenue-schemes/:id', adminController_1.adminController.updateRevenueShareScheme);
router.post('/tax-rules', adminController_1.adminController.createTaxRule);
router.get('/tax-rules', adminController_1.adminController.getTaxRules);
router.get('/payouts/pending', adminController_1.adminController.getPendingPayouts);
//# sourceMappingURL=admin.js.map