import { Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
import { Response } from 'express';
import {
  getDashboardStats,
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  bulkUpdateProperties,
  getViewings,
  scheduleViewing,
  updateViewingStatus,
  getAnalytics,
  getProfile,
  updateProfile,
  getClients,
  getMarketInsights
} from '../controllers/realtorController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply realtor role authorization to all routes
router.use(roleAuth(['realtor', 'admin']));

// Dashboard & Analytics
router.get('/dashboard/stats', getDashboardStats as any);
router.get('/analytics', getAnalytics as any);
router.get('/market/insights', getMarketInsights as any);

// Property Management
router.get('/properties', getProperties as any);
router.post('/properties', createProperty as any);
router.put('/properties/:id', updateProperty as any);
router.delete('/properties/:id', deleteProperty as any);
router.put('/properties/bulk', bulkUpdateProperties as any);

// Viewing Management
router.get('/viewings', getViewings as any);
router.post('/viewings', scheduleViewing as any);
router.put('/viewings/:id/status', updateViewingStatus as any);

// Profile Management
router.get('/profile', getProfile as any);
router.put('/profile', updateProfile as any);

// Client Management
router.get('/clients', getClients as any);

export default router;