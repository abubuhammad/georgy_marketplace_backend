"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.userRoutes = router;
// All routes require authentication
router.use(auth_1.authenticateToken);
// Admin only routes
router.get('/', (0, auth_1.authorizeRoles)('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Get all users (admin only)',
        data: { users: [] }
    });
});
router.get('/:id', (0, auth_1.authorizeRoles)('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Get user by ID (admin only)',
        data: { user: null }
    });
});
router.put('/:id/verify', (0, auth_1.authorizeRoles)('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Verify user (admin only)'
    });
});
router.delete('/:id', (0, auth_1.authorizeRoles)('admin'), (req, res) => {
    res.json({
        success: true,
        message: 'Delete user (admin only)'
    });
});
//# sourceMappingURL=users.js.map