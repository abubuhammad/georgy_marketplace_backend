"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artisanOnly = exports.sellerOnly = exports.adminOnly = void 0;
const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Admin access required'
        });
    }
    next();
};
exports.adminOnly = adminOnly;
const sellerOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Seller access required'
        });
    }
    next();
};
exports.sellerOnly = sellerOnly;
const artisanOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }
    if (req.user.role !== 'artisan' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Artisan access required'
        });
    }
    next();
};
exports.artisanOnly = artisanOnly;
//# sourceMappingURL=roles.js.map