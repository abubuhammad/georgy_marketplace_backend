"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.uploadMultipleImages = exports.uploadSingleImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        // Create uploads directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
// Configure multer middleware
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
// Upload single image
const uploadSingleImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                imageUrl: imageUrl
            }
        });
    }
    catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload image'
        });
    }
};
exports.uploadSingleImage = uploadSingleImage;
// Upload multiple images
const uploadMultipleImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }
        const files = req.files;
        const uploadedImages = files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            size: file.size,
            imageUrl: `/uploads/${file.filename}`
        }));
        res.json({
            success: true,
            data: uploadedImages
        });
    }
    catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload images'
        });
    }
};
exports.uploadMultipleImages = uploadMultipleImages;
// Delete uploaded image
const deleteImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path_1.default.join(process.cwd(), 'uploads', filename);
        // Check if file exists
        if (!fs_1.default.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }
        // Delete the file
        fs_1.default.unlinkSync(filePath);
        res.json({
            success: true,
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete image'
        });
    }
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=uploadController.js.map