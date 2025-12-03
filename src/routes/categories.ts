import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getCategories,
  getMainCategories,
  getCategoryById,
  getCategoryBySlug,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories
} from '../controllers/categoryController';
import { body } from 'express-validator';

const router = Router();

// Validation middleware for category creation/update
const validateCategory = [
  body('name').notEmpty().withMessage('Name is required'),
  body('slug').notEmpty().withMessage('Slug is required')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must contain only lowercase letters, numbers, and hyphens')
];

// Public routes
router.get('/', getCategories);
router.get('/main', getMainCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);
router.get('/:parentId/subcategories', getSubcategories);

// Seed endpoint (one-time setup - call POST /api/categories/seed)
router.post('/seed', seedCategories);

// Admin routes (protected)
router.post('/', authenticateToken, requireAdmin, validateCategory, createCategory);
router.put('/:id', authenticateToken, requireAdmin, updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, deleteCategory);

export { router as categoryRoutes };
