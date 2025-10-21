"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.paymentRoutes = router;
// Payment calculation (public endpoint)
router.post('/calculate', paymentController_1.paymentController.calculatePayment);
// Payment initiation (requires auth)
router.post('/initiate', auth_1.authenticateToken, paymentController_1.paymentController.initiatePayment);
// Payment verification
router.get('/verify/:reference', paymentController_1.paymentController.verifyPayment);
// Payment webhook (public endpoint)
router.post('/webhook/:provider', paymentController_1.paymentController.handleWebhook);
// Escrow management (requires auth)
router.post('/escrow/release', auth_1.authenticateToken, paymentController_1.paymentController.releaseEscrow);
// Payment history (requires auth)
router.get('/history', auth_1.authenticateToken, paymentController_1.paymentController.getPaymentHistory);
// Invoice generation
router.post('/invoice/:paymentId', auth_1.authenticateToken, paymentController_1.paymentController.generateInvoice);
// Refund processing
router.post('/refund/:paymentId', auth_1.authenticateToken, paymentController_1.paymentController.processRefund);
//# sourceMappingURL=paymentRoutes.js.map