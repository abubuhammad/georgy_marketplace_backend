import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Artisans API endpoint',
    data: { artisans: [] }
  });
});

router.get('/:id', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Get artisan by ID',
    data: { artisan: null }
  });
});

// Protected routes
router.use(authenticateToken);

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

export { router as artisanRoutes };
