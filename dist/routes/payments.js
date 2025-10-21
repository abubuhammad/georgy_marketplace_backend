"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const paymentController_1 = require("../controllers/paymentController");
const router = (0, express_1.Router)();
exports.paymentRoutes = router;
// Public routes
router.get('/config', auth_1.optionalAuth, paymentController_1.getPaymentConfig);
router.post('/calculate', auth_1.optionalAuth, paymentController_1.calculateBreakdown);
router.get('/:reference', auth_1.optionalAuth, paymentController_1.getPayment);
// Webhook endpoints (no auth required)
router.post('/webhook/:provider', paymentController_1.handleWebhook);
// Protected routes
router.use(auth_1.authenticateToken);
// Payment operations
router.post('/initiate', paymentController_1.initiatePayment);
router.post('/:paymentId/escrow/release', paymentController_1.releaseEscrow);
router.post('/:paymentId/refund', paymentController_1.processRefund);
// User and seller data
router.get('/user/payments', paymentController_1.getUserPayments);
router.get('/seller/:sellerId/financials', paymentController_1.getSellerFinancials);
router.get('/seller/:sellerId/payouts', paymentController_1.getSellerPayouts);
// Admin reports (TODO: Add admin role check)
router.get('/reports/financial', paymentController_1.getFinancialReports);
//# sourceMappingURL=payments.js.map