"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const sellerController_1 = require("../controllers/sellerController");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(auth_1.authMiddleware);
// Apply seller role authorization to all routes
router.use((0, roleAuth_1.roleAuth)(['seller']));
// Dashboard & Analytics
router.get('/dashboard/stats', sellerController_1.getDashboardStats);
router.get('/analytics', sellerController_1.getAnalytics);
// Product Management
router.get('/products', sellerController_1.getSellerProducts);
router.post('/products', sellerController_1.createProduct);
router.put('/products/:id', sellerController_1.updateProduct);
router.delete('/products/:id', sellerController_1.deleteProduct);
router.put('/products/bulk', sellerController_1.bulkUpdateProducts);
// Order Management
router.get('/orders', sellerController_1.getSellerOrders);
router.put('/orders/:id/status', sellerController_1.updateOrderStatus);
// Financial Management
router.get('/earnings', sellerController_1.getEarnings);
router.post('/withdrawal', sellerController_1.requestWithdrawal);
// Store Settings
router.get('/store/settings', sellerController_1.getStoreSettings);
router.put('/store/settings', sellerController_1.updateStoreSettings);
exports.default = router;
//# sourceMappingURL=seller.js.map