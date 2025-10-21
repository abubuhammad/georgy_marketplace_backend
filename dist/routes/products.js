"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const productController_1 = require("../controllers/productController");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
exports.productRoutes = router;
// Validation middleware for product creation
const validateProduct = [
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('categoryId').notEmpty().withMessage('Category is required'),
    (0, express_validator_1.body)('price').isNumeric().withMessage('Price must be a number').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0')
];
// Public routes
router.get('/', auth_1.optionalAuth, productController_1.getProducts);
router.get('/:id', auth_1.optionalAuth, productController_1.getProductById);
// Protected routes
router.use(auth_1.authenticateToken);
router.post('/', validateProduct, productController_1.createProduct);
router.put('/:id', productController_1.updateProduct);
router.delete('/:id', productController_1.deleteProduct);
router.get('/seller/my-products', productController_1.getSellerProducts);
//# sourceMappingURL=products.js.map