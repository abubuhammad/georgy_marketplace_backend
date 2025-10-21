import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Payment calculation (public endpoint)
router.post('/calculate', paymentController.calculatePayment);

// Payment initiation (requires auth)
router.post('/initiate', authenticateToken, paymentController.initiatePayment);

// Payment verification
router.get('/verify/:reference', paymentController.verifyPayment);

// Payment webhook (public endpoint)
router.post('/webhook/:provider', paymentController.handleWebhook);

// Escrow management (requires auth)
router.post('/escrow/release', authenticateToken, paymentController.releaseEscrow);

// Payment history (requires auth)
router.get('/history', authenticateToken, paymentController.getPaymentHistory);

// Invoice generation
router.post('/invoice/:paymentId', authenticateToken, paymentController.generateInvoice);

// Refund processing
router.post('/refund/:paymentId', authenticateToken, paymentController.processRefund);

export { router as paymentRoutes };
