import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
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
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Product Management
router.get('/products', getSellerProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/bulk', bulkUpdateProducts);

// Order Management
router.get('/orders', getSellerOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Financial Management
router.get('/earnings', getEarnings);
router.post('/withdrawal', requestWithdrawal);

// Store Settings
router.get('/store/settings', getStoreSettings);
router.put('/store/settings', updateStoreSettings);

export default router;