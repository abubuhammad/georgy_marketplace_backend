"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
require("../types"); // Import type definitions
const chatService_1 = require("../services/chatService");
const validateRequest_1 = require("../middleware/validateRequest");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
exports.chatRoutes = router;
// Validation schemas
const createRoomSchema = joi_1.default.object({
    type: joi_1.default.string().valid('direct', 'group', 'support').required(),
    participants: joi_1.default.array().items(joi_1.default.string()).min(2).required(),
    name: joi_1.default.string().optional()
});
const sendMessageSchema = joi_1.default.object({
    content: joi_1.default.string().required(),
    type: joi_1.default.string().valid('text', 'image', 'file', 'location').optional(),
    metadata: joi_1.default.object().optional()
});
const markReadSchema = joi_1.default.object({
    messageIds: joi_1.default.array().items(joi_1.default.string()).optional()
});
// Get user's chat rooms
router.get('/rooms', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const result = await chatService_1.chatService.getChatRooms(userId, { limit, offset });
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error getting chat rooms:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat rooms'
        });
    }
});
// Create a new chat room
router.post('/rooms', auth_1.authenticateToken, (0, validateRequest_1.validateRequest)(createRoomSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, participants, name } = req.body;
        // Ensure current user is included in participants
        if (!participants.includes(userId)) {
            participants.push(userId);
        }
        const room = await chatService_1.chatService.createChatRoom({
            type,
            participants,
            name
        });
        res.status(201).json({
            success: true,
            data: room,
            message: 'Chat room created successfully'
        });
    }
    catch (error) {
        console.error('Error creating chat room:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create chat room'
        });
    }
});
// Get chat room info
router.get('/rooms/:roomId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { roomId } = req.params;
        const roomInfo = await chatService_1.chatService.getChatRoomInfo(roomId, userId);
        res.json({
            success: true,
            data: roomInfo
        });
    }
    catch (error) {
        console.error('Error getting chat room info:', error);
        res.status(404).json({
            success: false,
            message: error.message || 'Chat room not found'
        });
    }
});
// Get messages for a chat room
router.get('/rooms/:roomId/messages', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { roomId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const before = req.query.before;
        const result = await chatService_1.chatService.getChatMessages(roomId, userId, {
            limit,
            offset,
            before
        });
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error getting chat messages:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get chat messages'
        });
    }
});
// Send a message
router.post('/rooms/:roomId/messages', auth_1.authenticateToken, (0, validateRequest_1.validateRequest)(sendMessageSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { roomId } = req.params;
        const { content, type, metadata } = req.body;
        const message = await chatService_1.chatService.sendMessage({
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
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to send message'
        });
    }
});
// Mark messages as read
router.patch('/rooms/:roomId/read', auth_1.authenticateToken, (0, validateRequest_1.validateRequest)(markReadSchema), async (req, res) => {
    try {
        const userId = req.user.id;
        const { roomId } = req.params;
        const { messageIds } = req.body;
        const result = await chatService_1.chatService.markMessagesAsRead(roomId, userId, messageIds);
        res.json({
            success: true,
            data: result,
            message: 'Messages marked as read'
        });
    }
    catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark messages as read'
        });
    }
});
// Delete a message
router.delete('/messages/:messageId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { messageId } = req.params;
        await chatService_1.chatService.deleteMessage(messageId, userId);
        res.json({
            success: true,
            message: 'Message deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete message'
        });
    }
});
// Search messages
router.get('/search', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const query = req.query.q;
        const roomId = req.query.roomId;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        const result = await chatService_1.chatService.searchMessages(query, userId, roomId);
        res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Error searching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search messages'
        });
    }
});
// Get chat statistics (admin only)
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can view chat statistics'
            });
        }
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;
        const stats = await chatService_1.chatService.getChatStats(dateRange);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error getting chat stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get chat statistics'
        });
    }
});
// Get unread count for a room
router.get('/rooms/:roomId/unread-count', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { roomId } = req.params;
        const unreadCount = await chatService_1.chatService.getUnreadCount(roomId, userId);
        res.json({
            success: true,
            data: { unreadCount }
        });
    }
    catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count'
        });
    }
});
//# sourceMappingURL=chat.js.map