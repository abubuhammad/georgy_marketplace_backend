import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getSellerProducts 
} from '../controllers/productController';
import { body } from 'express-validator';

const router = Router();

// Validation middleware for product creation
const validateProduct = [
  body('description').notEmpty().withMessage('Description is required'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0')
];

// Public routes
router.get('/', optionalAuth, getProducts);
router.get('/:id', optionalAuth, getProductById);

// Protected routes
router.use(authenticateToken);

router.post('/', validateProduct, createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/seller/my-products', getSellerProducts);

export { router as productRoutes };
