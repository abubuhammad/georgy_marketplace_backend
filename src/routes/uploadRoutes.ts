import express from 'express';
import { upload, uploadSingleImage, uploadMultipleImages, deleteImage } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Upload single image
router.post('/single', authenticateToken, upload.single('image'), uploadSingleImage);

// Upload multiple images
router.post('/multiple', authenticateToken, upload.array('images', 10), uploadMultipleImages);

// Delete image
router.delete('/image/:filename', authenticateToken, deleteImage);

export { router as uploadRoutes };