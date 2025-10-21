import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import {
  getDeliveryQuote,
  createShipment,
  getShipmentTracking,
  trackByNumber,
  updateShipmentStatus,
  getAgentDeliveries,
  updateAgentLocation,
  registerDeliveryAgent,
  getAgentProfile,
  toggleAgentAvailability,
  getAllShipments,
  getDeliveryAnalytics
} from '../controllers/deliveryController';

const router = Router();

// Public routes
router.post('/quote', optionalAuth, getDeliveryQuote);
router.get('/track/:trackingNumber', trackByNumber);
router.get('/shipments/:shipmentId/track', getShipmentTracking);

// Protected routes
router.use(authenticateToken);

// Customer/Seller routes
router.post('/shipments', createShipment);

// Delivery Agent routes
router.post('/agent/register', registerDeliveryAgent);
router.get('/agent/profile', getAgentProfile);
router.post('/agent/availability', toggleAgentAvailability);
router.get('/agent/deliveries', getAgentDeliveries);
router.post('/agent/location', updateAgentLocation);
router.patch('/shipments/:shipmentId/status', updateShipmentStatus);

// Admin routes (TODO: Add role-based middleware)
router.get('/admin/shipments', getAllShipments);
router.get('/admin/analytics', getDeliveryAnalytics);

export { router as deliveryRoutes };
