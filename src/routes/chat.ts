import { Router, Request } from 'express';
import { authenticateToken } from '../middleware/auth';
import '../types'; // Import type definitions
import { chatService } from '../services/chatService';
import { validateRequest } from '../middleware/validateRequest';
import Joi from 'joi';

const router = Router();

// Validation schemas
const createRoomSchema = Joi.object({
  type: Joi.string().valid('direct', 'group', 'support').required(),
  participants: Joi.array().items(Joi.string()).min(2).required(),
  name: Joi.string().optional()
});

const sendMessageSchema = Joi.object({
  content: Joi.string().required(),
  type: Joi.string().valid('text', 'image', 'file', 'location').optional(),
  metadata: Joi.object().optional()
});

const markReadSchema = Joi.object({
  messageIds: Joi.array().items(Joi.string()).optional()
});

// Get user's chat rooms
router.get('/rooms', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await chatService.getChatRooms(userId, { limit, offset });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat rooms'
    });
  }
});

// Create a new chat room
router.post('/rooms', 
  authenticateToken, 
  validateRequest(createRoomSchema), 
  async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const { type, participants, name } = req.body;

      // Ensure current user is included in participants
      if (!participants.includes(userId)) {
        participants.push(userId);
      }

      const room = await chatService.createChatRoom({
        type,
        participants,
        name
      });

      res.status(201).json({
        success: true,
        data: room,
        message: 'Chat room created successfully'
      });
    } catch (error) {
      console.error('Error creating chat room:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create chat room'
      });
    }
  }
);

// Get chat room info
router.get('/rooms/:roomId', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const { roomId } = req.params;

    const roomInfo = await chatService.getChatRoomInfo(roomId, userId);

    res.json({
      success: true,
      data: roomInfo
    });
  } catch (error) {
    console.error('Error getting chat room info:', error);
    res.status(404).json({
      success: false,
      message: (error as Error).message || 'Chat room not found'
    });
  }
});

// Get messages for a chat room
router.get('/rooms/:roomId/messages', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const before = req.query.before as string;

    const result = await chatService.getChatMessages(roomId, userId, {
      limit,
      offset,
      before
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to get chat messages'
    });
  }
});

// Send a message
router.post('/rooms/:roomId/messages', 
  authenticateToken, 
  validateRequest(sendMessageSchema), 
  async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const { roomId } = req.params;
      const { content, type, metadata } = req.body;

      const message = await chatService.sendMessage({
        chatId: roomId,
        senderId: userId,
        content,
        type,
        metadata
      });

      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully'
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: (error as Error).message || 'Failed to send message'
      });
    }
  }
);

// Mark messages as read
router.patch('/rooms/:roomId/read', 
  authenticateToken, 
  validateRequest(markReadSchema), 
  async (req: Request, res) => {
    try {
      const userId = req.user!.id;
      const { roomId } = req.params;
      const { messageIds } = req.body;

      const result = await chatService.markMessagesAsRead(roomId, userId, messageIds);

      res.json({
        success: true,
        data: result,
        message: 'Messages marked as read'
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark messages as read'
      });
    }
  }
);

// Delete a message
router.delete('/messages/:messageId', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const { messageId } = req.params;

    await chatService.deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message || 'Failed to delete message'
    });
  }
});

// Search messages
router.get('/search', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const query = req.query.q as string;
    const roomId = req.query.roomId as string;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await chatService.searchMessages(query, userId, roomId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search messages'
    });
  }
});

// Get chat statistics (admin only)
router.get('/stats', authenticateToken, async (req: Request, res) => {
  try {
    // Check if user is admin
    if (req.user!.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can view chat statistics'
      });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
    const stats = await chatService.getChatStats(dateRange);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting chat stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat statistics'
    });
  }
});

// Get unread count for a room
router.get('/rooms/:roomId/unread-count', authenticateToken, async (req: Request, res) => {
  try {
    const userId = req.user!.id;
    const { roomId } = req.params;

    const unreadCount = await chatService.getUnreadCount(roomId, userId);

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
});

export { router as chatRoutes };
