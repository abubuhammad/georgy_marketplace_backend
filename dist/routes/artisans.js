"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artisanRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.artisanRoutes = router;
// Public routes
router.get('/', auth_1.optionalAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Artisans API endpoint',
        data: { artisans: [] }
    });
});
router.get('/:id', auth_1.optionalAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Get artisan by ID',
        data: { artisan: null }
    });
});
// Protected routes
router.use(auth_1.authenticateToken);
router.post('/register', (req, res) => {
    res.json({
        success: true,
        message: 'Register as artisan',
        data: { artisan: null }
    });
});
router.post('/service-requests', (req, res) => {
    res.json({
        success: true,
        message: 'Create service request',
        data: { request: null }
    });
});
router.post('/quotes', (req, res) => {
    res.json({
        success: true,
        message: 'Submit quote',
        data: { quote: null }
    });
});
//# sourceMappingURL=artisans.js.map