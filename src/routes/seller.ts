import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
import { Response } from 'express';
import {
  getDashboardStats,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProducts,
  getSellerOrders,
  updateOrderStatus,
  getEarnings,
  requestWithdrawal,
  getStoreSettings,
  updateStoreSettings,
  getAnalytics
} from '../controllers/sellerController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply seller role authorization to all routes
router.use(roleAuth(['seller']));

// Dashboard & Analytics
router.get('/dashboard/stats', getDashboardStats as any);
router.get('/analytics', getAnalytics as any);

// Product Management
router.get('/products', getSellerProducts as any);
router.post('/products', createProduct as any);
router.put('/products/:id', updateProduct as any);
router.delete('/products/:id', deleteProduct as any);
router.put('/products/bulk', bulkUpdateProducts as any);

// Order Management
router.get('/orders', getSellerOrders as any);
router.put('/orders/:id/status', updateOrderStatus as any);

// Financial Management
router.get('/earnings', getEarnings as any);
router.post('/withdrawal', requestWithdrawal as any);

// Store Settings
router.get('/store/settings', getStoreSettings as any);
router.put('/store/settings', updateStoreSettings as any);

export default router;