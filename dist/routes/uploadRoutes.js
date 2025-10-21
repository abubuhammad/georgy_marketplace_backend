"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRoutes = void 0;
const express_1 = __importDefault(require("express"));
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
exports.uploadRoutes = router;
// Upload single image
router.post('/single', auth_1.authenticateToken, uploadController_1.upload.single('image'), uploadController_1.uploadSingleImage);
// Upload multiple images
router.post('/multiple', auth_1.authenticateToken, uploadController_1.upload.array('images', 10), uploadController_1.uploadMultipleImages);
// Delete image
router.delete('/image/:filename', auth_1.authenticateToken, uploadController_1.deleteImage);
//# sourceMappingURL=uploadRoutes.js.map