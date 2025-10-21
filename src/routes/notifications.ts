import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { Request } from 'express';
import '../types'; // Import type definitions
import { notificationService } from '../services/notificationService';
import { validateRequest } from '../middleware/validateRequest';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createNotificationSchema = Joi.object({
  userId: Joi.string().required(),
  type: Joi.string().valid('order', 'delivery', 'payment', 'chat', 'artisan', 'admin', 'system').required(),
  title: Joi.string().required(),
  message: Joi.string().required(),
  data: Joi.object().optional()
});

const updatePreferencesSchema = Joi.object({
  pushEnabled: Joi.boolean().optional(),
  emailEnabled: Joi.boolean().optional(),
  smsEnabled: Joi.boolean().optional(),
  categories: Joi.object({
    orders: Joi.boolean().optional(),
    delivery: Joi.boolean().optional(),
    payments: Joi.boolean().optional(),
    chat: Joi.boolean().optional(),
    artisan: Joi.boolean().optional(),
    marketing: Joi.boolean().optional(),
    system: Joi.boolean().optional()
  }).optional()
});

// Get user notifications
router.get('/', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await notificationService.getUserNotifications(userId, {
      limit,
      offset,
      unreadOnly
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications'
    });
  }
});

// Get notification preferences
router.get('/preferences', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const preferences = await notificationService.getUserPreferences(userId);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences'
    });
  }
});

// Update notification preferences
router.put('/preferences', 
  authenticateToken, 
  validateRequest(updatePreferencesSchema), 
  async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const preferences = await notificationService.updateUserPreferences(userId, req.body);

      res.json({
        success: true,
        data: preferences,
        message: 'Notification preferences updated successfully'
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences'
      });
    }
  }
);

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await notificationService.markAsRead(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const { notificationId } = req.params;

    await notificationService.deleteNotification(notificationId, userId);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Create notification (admin only)
router.post('/', 
  authenticateToken, 
  validateRequest(createNotificationSchema), 
  async (req: Request, res) => {
    try {
      // Check if user is admin
      if (req.user!.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can create notifications'
        });
      }

      const notification = await notificationService.createNotification(req.body);

      res.status(201).json({
        success: true,
        data: notification,
        message: 'Notification created successfully'
      });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notification'
      });
    }
  }
);

// Send bulk notifications (admin only)
router.post('/bulk', authenticateToken, async (req: Request, res) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
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

    const results = await notificationService.sendBulkSystemNotification(
      userIds, 
      title, 
      message, 
      data
    );

    res.json({
      success: true,
      data: results,
      message: 'Bulk notifications sent'
    });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications'
    });
  }
});

// Get notification statistics (admin only)
router.get('/stats', authenticateToken, async (req: Request, res) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view notification statistics'
      });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
    const stats = await notificationService.getNotificationStats(dateRange);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification statistics'
    });
  }
});

export { router as notificationRoutes };
