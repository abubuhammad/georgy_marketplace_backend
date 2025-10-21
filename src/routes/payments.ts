import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import {
  initiatePayment,
  getPayment,
  handleWebhook,
  releaseEscrow,
  processRefund,
  getPaymentConfig,
  calculateBreakdown,
  getSellerFinancials,
  getFinancialReports,
  getUserPayments,
  getSellerPayouts
} from '../controllers/paymentController';

const router = Router();

// Public routes
router.get('/config', optionalAuth, getPaymentConfig);
router.post('/calculate', optionalAuth, calculateBreakdown);
router.get('/:reference', optionalAuth, getPayment);

// Webhook endpoints (no auth required)
router.post('/webhook/:provider', handleWebhook);

// Protected routes
router.use(authenticateToken);

// Payment operations
router.post('/initiate', initiatePayment);
router.post('/:paymentId/escrow/release', releaseEscrow);
router.post('/:paymentId/refund', processRefund);

// User and seller data
router.get('/user/payments', getUserPayments);
router.get('/seller/:sellerId/financials', getSellerFinancials);
router.get('/seller/:sellerId/payouts', getSellerPayouts);

// Admin reports (TODO: Add admin role check)
router.get('/reports/financial', getFinancialReports);

export { router as paymentRoutes };
