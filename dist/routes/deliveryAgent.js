"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const deliveryAgentController_1 = require("../controllers/deliveryAgentController");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.authMiddleware);
// Apply delivery agent role authorization to all routes
router.use((0, roleAuth_1.roleAuth)(['delivery_agent', 'admin']));
// Dashboard & Analytics
router.get('/dashboard/stats', deliveryAgentController_1.getDashboardStats);
router.get('/performance', deliveryAgentController_1.getPerformanceMetrics);
// Shipment Management
router.get('/shipments', deliveryAgentController_1.getAssignedShipments);
router.put('/shipments/:id/status', deliveryAgentController_1.updateShipmentStatus);
router.get('/route/optimized', deliveryAgentController_1.getOptimizedRoute);
// Earnings Management
router.get('/earnings', deliveryAgentController_1.getEarnings);
// Profile Management
router.get('/profile', deliveryAgentController_1.getProfile);
router.put('/profile', deliveryAgentController_1.updateProfile);
// Location Services
router.post('/location', deliveryAgentController_1.updateLocation);
router.put('/availability', deliveryAgentController_1.toggleAvailability);
exports.default = router;
//# sourceMappingURL=deliveryAgent.js.map