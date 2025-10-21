import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { body } from 'express-validator';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  getUserProperties,
  scheduleViewing
} from '../controllers/propertyController';

const router = Router();

// Validation middleware for property creation
const validateProperty = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').isIn(['sale', 'lease', 'rent']).withMessage('Valid type is required'),
  body('propertyType').isIn(['house', 'apartment', 'commercial', 'land']).withMessage('Valid property type is required'),
  body('price').isNumeric().withMessage('Price must be a number').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('location').notEmpty().withMessage('Location is required'),
  body('address').notEmpty().withMessage('Address is required')
];

// Public routes
router.get('/properties', optionalAuth, getProperties);
router.get('/properties/:id', optionalAuth, getPropertyById);

// Protected routes
router.use(authenticateToken);

router.post('/properties', validateProperty, createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);
router.get('/user/properties', getUserProperties);
router.post('/properties/:id/viewing', scheduleViewing);

export { router as realEstateRoutes };
