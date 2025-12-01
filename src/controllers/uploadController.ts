import { Request, Response } from 'express';
import multer from 'multer';
import { cloudinaryService } from '../services/cloudinaryService';

// Configure multer for memory storage (for Cloudinary uploads)
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer middleware
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Upload single image to Cloudinary
export const uploadSingleImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Get folder from query or default to 'products'
    const folder = (req.query.folder as string) || 'products';
    
    // Upload to Cloudinary
    const result = await cloudinaryService.uploadBuffer(req.file.buffer, folder);

    res.json({
      success: true,
      data: {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
};

// Upload multiple images to Cloudinary
export const uploadMultipleImages = async (req: Request, res: Response) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const files = req.files as Express.Multer.File[];
    const folder = (req.query.folder as string) || 'products';
    
    // Upload all files to Cloudinary in parallel
    const uploadPromises = files.map(file => 
      cloudinaryService.uploadBuffer(file.buffer, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    const uploadedImages = results.map(result => ({
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    }));

    res.json({
      success: true,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    });
  }
};

// Upload images from base64 strings (for frontend that sends base64)
export const uploadBase64Images = async (req: Request, res: Response) => {
  try {
    const { images, folder = 'products' } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No images provided'
      });
    }

    if (images.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 10 images allowed per upload'
      });
    }

    // Upload all base64 images to Cloudinary
    const uploadPromises = images.map((base64: string) => 
      cloudinaryService.uploadBase64(base64, folder)
    );
    
    const results = await Promise.all(uploadPromises);
    
    const uploadedImages = results.map(result => ({
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes
    }));

    res.json({
      success: true,
      data: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading base64 images:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    });
  }
};

// Delete image from Cloudinary
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'Public ID is required'
      });
    }

    const success = await cloudinaryService.deleteImage(publicId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Image not found or already deleted'
      });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
};