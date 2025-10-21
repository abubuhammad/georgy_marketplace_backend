"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminOrAgent = exports.requireDeliveryAgent = exports.requireAdmin = exports.requireRole = void 0;
require("../types"); // Import type definitions
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)('admin');
exports.requireDeliveryAgent = (0, exports.requireRole)('delivery_agent');
exports.requireAdminOrAgent = (0, exports.requireRole)(['admin', 'delivery_agent']);
//# sourceMappingURL=roleAuth.js.map