import express from 'express';
import { upload, uploadSingleImage, uploadMultipleImages, uploadBase64Images, deleteImage } from '../controllers/uploadController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Upload single image to Cloudinary
router.post('/single', authenticateToken, upload.single('image'), uploadSingleImage);

// Upload multiple images to Cloudinary
router.post('/multiple', authenticateToken, upload.array('images', 10), uploadMultipleImages);

// Upload base64 images to Cloudinary (alternative method)
router.post('/base64', authenticateToken, uploadBase64Images);

// Delete image from Cloudinary
router.delete('/image/:publicId', authenticateToken, deleteImage);

export { router as uploadRoutes };