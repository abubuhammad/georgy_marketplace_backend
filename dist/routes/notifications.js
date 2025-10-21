"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
require("../types"); // Import type definitions
const notificationService_1 = require("../services/notificationService");
const validateRequest_1 = require("../middleware/validateRequest");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
exports.notificationRoutes = router;
// Validation schemas
const createNotificationSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    type: joi_1.default.string().valid('order', 'delivery', 'payment', 'chat', 'artisan', 'admin', 'system').required(),
    title: joi_1.default.string().required(),
    message: joi_1.default.string().required(),
    data: joi_1.default.object().optional()
});
const updatePreferencesSchema = joi_1.default.object({
    pushEnabled: joi_1.default.boolean().optional(),
    emailEnabled: joi_1.default.boolean().optional(),
    smsEnabled: joi_1.default.boolean().optional(),
    categories: joi_1.default.object({
        orders: joi_1.default.boolean().optional(),
        delivery: joi_1.default.boolean().optional(),
        payments: joi_1.default.boolean().optional(),
        chat: joi_1.default.boolean().optional(),
        artisan: joi_1.default.boolean().optional(),
        marketing: joi_1.default.boolean().optional(),
        system: joi_1.default.boolean().optional()
    }).optional()
});
// Get user notifications
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const unreadOnly = req.query.unreadOnly === 'true';
        const result = await notificationService_1.notificationService.getUserNotifications(userId, {
            limit,
            offset,
            unreadOnly
        });
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications'
        });
    }
});
// Get notification preferences
router.get('/preferences', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = await notificationService_1.notificationService.getUserPreferences(userId);
        res.json({
            success: true,
            data: preferences
        });
    }
    catch (error) {
        console.error('Error getting notification preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification preferences'
        });
    }
});
// Update notification preferences
router.put('/preferences', auth_1.authenticateToken, (0, validateRequest_1.validateRequest)(updatePreferencesSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const preferences = await notificationService_1.notificationService.updateUserPreferences(userId, req.body);
        res.json({
            success: true,
            data: preferences,
            message: 'Notification preferences updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update notification preferences'
        });
    }
});
// Mark notification as read
router.patch('/:notificationId/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;
        await notificationService_1.notificationService.markAsRead(notificationId, userId);
        res.json({
            success: true,
            message: 'Notification marked as read'
        });
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});
// Mark all notifications as read
router.patch('/read-all', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        await notificationService_1.notificationService.markAllAsRead(userId);
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
});
// Delete notification
router.delete('/:notificationId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { notificationId } = req.params;
        await notificationService_1.notificationService.deleteNotification(notificationId, userId);
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification'
        });
    }
});
// Create notification (admin only)
router.post('/', auth_1.authenticateToken, (0, validateRequest_1.validateRequest)(createNotificationSchema), async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can create notifications'
            });
        }
        const notification = await notificationService_1.notificationService.createNotification(req.body);
        res.status(201).json({
            success: true,
            data: notification,
            message: 'Notification created successfully'
        });
    }
    catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification'
        });
    }
});
// Send bulk notifications (admin only)
router.post('/bulk', auth_1.authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can send bulk notifications'
            });
        }
        const { userIds, title, message, data } = req.body;
        if (!Array.isArray(userIds) || !title || !message) {
            return res.status(400).json({
                success: false,
                message: 'userIds, title, and message are required'
            });
        }
        const results = await notificationService_1.notificationService.sendBulkSystemNotification(userIds, title, message, data);
        res.json({
            success: true,
            data: results,
            message: 'Bulk notifications sent'
        });
    }
    catch (error) {
        console.error('Error sending bulk notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk notifications'
        });
    }
});
// Get notification statistics (admin only)
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can view notification statistics'
            });
        }
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
        const stats = await notificationService_1.notificationService.getNotificationStats(dateRange);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error getting notification stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notification statistics'
        });
    }
});
//# sourceMappingURL=notifications.js.map