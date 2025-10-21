"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const authValidation_1 = require("../validation/authValidation");
const router = (0, express_1.Router)();
exports.authRoutes = router;
// Public routes
router.post('/register', (0, validation_1.validateRequest)(authValidation_1.authValidation.register), authController_1.register);
router.post('/login', (0, validation_1.validateRequest)(authValidation_1.authValidation.login), authController_1.login);
router.post('/request-password-reset', (0, validation_1.validateRequest)(authValidation_1.authValidation.requestPasswordReset), authController_1.requestPasswordReset);
router.post('/reset-password', (0, validation_1.validateRequest)(authValidation_1.authValidation.resetPassword), authController_1.resetPassword);
router.post('/refresh-token', (0, validation_1.validateRequest)(authValidation_1.authValidation.refreshToken), authController_1.refreshToken);
// Protected routes
router.use(auth_1.authenticateToken); // All routes below this middleware require authentication
router.get('/profile', authController_1.getProfile);
router.put('/profile', (0, validation_1.validateRequest)(authValidation_1.authValidation.updateProfile), authController_1.updateProfile);
router.post('/change-password', (0, validation_1.validateRequest)(authValidation_1.authValidation.changePassword), authController_1.changePassword);
router.post('/logout', authController_1.logout);
//# sourceMappingURL=auth.js.map