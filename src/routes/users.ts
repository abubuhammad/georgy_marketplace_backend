import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Get all users (admin only)',
    data: { users: [] }
  });
});

router.get('/:id', authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Get user by ID (admin only)',
    data: { user: null }
  });
});

router.put('/:id/verify', authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Verify user (admin only)'
  });
});

router.delete('/:id', authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Delete user (admin only)'
  });
});

export { router as userRoutes };
