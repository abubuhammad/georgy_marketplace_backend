import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
import { Response } from 'express';
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
router.get('/dashboard/stats', getDashboardStats as any);
router.get('/performance', getPerformanceMetrics as any);

// Shipment Management
router.get('/shipments', getAssignedShipments as any);
router.put('/shipments/:id/status', updateShipmentStatus as any);
router.get('/route/optimized', getOptimizedRoute as any);

// Earnings Management
router.get('/earnings', getEarnings as any);

// Profile Management
router.get('/profile', getProfile as any);
router.put('/profile', updateProfile as any);

// Location Services
router.post('/location', updateLocation as any);
router.put('/availability', toggleAvailability as any);

export default router;