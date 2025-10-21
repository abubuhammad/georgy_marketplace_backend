import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { roleAuth } from '../middleware/roleAuth';
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
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/market/insights', getMarketInsights);

// Property Management
router.get('/properties', getProperties);
router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);
router.put('/properties/bulk', bulkUpdateProperties);

// Viewing Management
router.get('/viewings', getViewings);
router.post('/viewings', scheduleViewing);
router.put('/viewings/:id/status', updateViewingStatus);

// Profile Management
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Client Management
router.get('/clients', getClients);

export default router;