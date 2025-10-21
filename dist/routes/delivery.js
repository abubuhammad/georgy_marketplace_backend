"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const deliveryController_1 = require("../controllers/deliveryController");
const router = (0, express_1.Router)();
exports.deliveryRoutes = router;
// Public routes
router.post('/quote', auth_1.optionalAuth, deliveryController_1.getDeliveryQuote);
router.get('/track/:trackingNumber', deliveryController_1.trackByNumber);
router.get('/shipments/:shipmentId/track', deliveryController_1.getShipmentTracking);
// Protected routes
router.use(auth_1.authenticateToken);
// Customer/Seller routes
router.post('/shipments', deliveryController_1.createShipment);
// Delivery Agent routes
router.post('/agent/register', deliveryController_1.registerDeliveryAgent);
router.get('/agent/profile', deliveryController_1.getAgentProfile);
router.post('/agent/availability', deliveryController_1.toggleAgentAvailability);
router.get('/agent/deliveries', deliveryController_1.getAgentDeliveries);
router.post('/agent/location', deliveryController_1.updateAgentLocation);
router.patch('/shipments/:shipmentId/status', deliveryController_1.updateShipmentStatus);
// Admin routes (TODO: Add role-based middleware)
router.get('/admin/shipments', deliveryController_1.getAllShipments);
router.get('/admin/analytics', deliveryController_1.getDeliveryAnalytics);
//# sourceMappingURL=delivery.js.map