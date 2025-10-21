import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
import {
  getDashboardStats,
  getAssignedShipments,
  updateShipmentStatus,
  getOptimizedRoute,
  getEarnings,
  getProfile,
  updateProfile,
  updateLocation,
  toggleAvailability,
  getPerformanceMetrics
} from '../controllers/deliveryAgentController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply delivery agent role authorization to all routes
router.use(roleAuth(['delivery_agent', 'admin']));

// Dashboard & Analytics
router.get('/dashboard/stats', getDashboardStats);
router.get('/performance', getPerformanceMetrics);

// Shipment Management
router.get('/shipments', getAssignedShipments);
router.put('/shipments/:id/status', updateShipmentStatus);
router.get('/route/optimized', getOptimizedRoute);

// Earnings Management
router.get('/earnings', getEarnings);

// Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Location Services
router.post('/location', updateLocation);
router.put('/availability', toggleAvailability);

export default router;