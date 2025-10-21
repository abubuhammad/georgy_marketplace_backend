import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
  refreshToken,
  logout
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { authValidation } from '../validation/authValidation';

const router = Router();

// Public routes
router.post('/register', validateRequest(authValidation.register), register);
router.post('/login', validateRequest(authValidation.login), login);
router.post('/request-password-reset', validateRequest(authValidation.requestPasswordReset), requestPasswordReset);
router.post('/reset-password', validateRequest(authValidation.resetPassword), resetPassword);
router.post('/refresh-token', validateRequest(authValidation.refreshToken), refreshToken);

// Protected routes
router.use(authenticateToken); // All routes below this middleware require authentication

router.get('/profile', getProfile);
router.put('/profile', validateRequest(authValidation.updateProfile), updateProfile);
router.post('/change-password', validateRequest(authValidation.changePassword), changePassword);
router.post('/logout', logout);

export { router as authRoutes };
