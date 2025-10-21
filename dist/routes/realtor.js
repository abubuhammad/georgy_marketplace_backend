"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const realtorController_1 = require("../controllers/realtorController");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.authMiddleware);
// Apply realtor role authorization to all routes
router.use((0, roleAuth_1.roleAuth)(['realtor', 'admin']));
// Dashboard & Analytics
router.get('/dashboard/stats', realtorController_1.getDashboardStats);
router.get('/analytics', realtorController_1.getAnalytics);
router.get('/market/insights', realtorController_1.getMarketInsights);
// Property Management
router.get('/properties', realtorController_1.getProperties);
router.post('/properties', realtorController_1.createProperty);
router.put('/properties/:id', realtorController_1.updateProperty);
router.delete('/properties/:id', realtorController_1.deleteProperty);
router.put('/properties/bulk', realtorController_1.bulkUpdateProperties);
// Viewing Management
router.get('/viewings', realtorController_1.getViewings);
router.post('/viewings', realtorController_1.scheduleViewing);
router.put('/viewings/:id/status', realtorController_1.updateViewingStatus);
// Profile Management
router.get('/profile', realtorController_1.getProfile);
router.put('/profile', realtorController_1.updateProfile);
// Client Management
router.get('/clients', realtorController_1.getClients);
exports.default = router;
//# sourceMappingURL=realtor.js.map