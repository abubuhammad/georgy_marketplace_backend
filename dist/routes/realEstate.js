"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realEstateRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const express_validator_1 = require("express-validator");
const propertyController_1 = require("../controllers/propertyController");
const router = (0, express_1.Router)();
exports.realEstateRoutes = router;
// Validation middleware for property creation
const validateProperty = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Title is required'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('Description is required'),
    (0, express_validator_1.body)('type').isIn(['sale', 'lease', 'rent']).withMessage('Valid type is required'),
    (0, express_validator_1.body)('propertyType').isIn(['house', 'apartment', 'commercial', 'land']).withMessage('Valid property type is required'),
    (0, express_validator_1.body)('price').isNumeric().withMessage('Price must be a number').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    (0, express_validator_1.body)('location').notEmpty().withMessage('Location is required'),
    (0, express_validator_1.body)('address').notEmpty().withMessage('Address is required')
];
// Public routes
router.get('/properties', auth_1.optionalAuth, propertyController_1.getProperties);
router.get('/properties/:id', auth_1.optionalAuth, propertyController_1.getPropertyById);
// Protected routes
router.use(auth_1.authenticateToken);
router.post('/properties', validateProperty, propertyController_1.createProperty);
router.put('/properties/:id', propertyController_1.updateProperty);
router.delete('/properties/:id', propertyController_1.deleteProperty);
router.get('/user/properties', propertyController_1.getUserProperties);
router.post('/properties/:id/viewing', propertyController_1.scheduleViewing);
//# sourceMappingURL=realEstate.js.map