"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const prisma_1 = require("../lib/prisma");
const socketService_1 = require("./socketService");
const notificationService_1 = require("./notificationService");
class ChatService {
    async createChatRoom(data) {
        try {
            // Check if direct chat room already exists between participants
            if (data.type === 'direct' && data.participants.length === 2) {
                const existingRoom = await this.findDirectChatRoom(data.participants);
                if (existingRoom) {
                    return existingRoom;
                }
            }
            const chatRoom = await prisma_1.prisma.chat.create({
                data: {
                    id: this.generateId(),
                    customerId: data.participants[0],
                    artisanId: data.participants[1],
                    status: 'active',
                    createdAt: new Date()
                }
            });
            // Notify all participants about the new chat room
            const socketService = (0, socketService_1.getSocketService)();
            data.participants.forEach(userId => {
                socketService.broadcastToUser(userId, {
                    type: 'chat:room_created',
                    data: chatRoom,
                    createdAt: new Date().toISOString()
                });
            });
            return chatRoom;
        }
        catch (error) {
            console.error('Error creating chat room:', error);
            throw error;
        }
    }
    async findDirectChatRoom(participants) {
        try {
            const existing = await prisma_1.prisma.chat.findFirst({
                where: {
                    OR: [
                        { customerId: participants[0], artisanId: participants[1] },
                        { customerId: participants[1], artisanId: participants[0] }
                    ]
                }
            });
            return existing;
        }
        catch (error) {
            console.error('Error finding direct chat room:', error);
            return null;
        }
    }
    async sendMessage(data) {
        try {
            // Verify user is participant in the chat
            const chat = await prisma_1.prisma.chat.findUnique({ where: { id: data.chatId } });
            if (!chat) {
                throw new Error('Chat not found');
            }
            if (![chat.customerId, chat.artisanId].includes(data.senderId)) {
                throw new Error('User is not a participant in this chat');
            }
            // Determine recipient
            const recipientId = chat.customerId === data.senderId ? chat.artisanId : chat.customerId;
            // Optionally fetch sender name for notifications
            const senderUser = await prisma_1.prisma.user.findUnique({
                where: { id: data.senderId },
                select: { firstName: true, lastName: true }
            });
            // Create message
            const message = await prisma_1.prisma.message.create({
                data: {
                    id: this.generateId(),
                    chatId: data.chatId,
                    senderId: data.senderId,
                    recipientId,
                    content: data.content,
                    messageType: (data.type || 'text'),
                    createdAt: new Date()
                }
            });
            // Update chat's last activity
            await prisma_1.prisma.chat.update({
                where: { id: data.chatId },
                data: { lastMessageAt: new Date() }
            });
            // Broadcast message to all participants
            const socketService = (0, socketService_1.getSocketService)();
            socketService.broadcastChatMessage(data.chatId, message);
            // Send push notifications to the other participant
            const otherId = recipientId;
            if (!socketService.isUserConnected(otherId)) {
                const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : data.senderId;
                await notificationService_1.notificationService.sendChatNotification(otherId, data.senderId, senderName, data.content);
            }
            return message;
        }
        catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }
    async markMessagesAsRead(chatId, userId, messageIds) {
        try {
            const where = {
                chatId,
                senderId: { not: userId } // Don't mark own messages as read
            };
            if (messageIds && messageIds.length > 0) {
                where.id = { in: messageIds };
            }
            // Get messages to update
            const { count } = await prisma_1.prisma.message.updateMany({
                where,
                data: { readAt: new Date() }
            });
            const socketService = (0, socketService_1.getSocketService)();
            socketService.broadcastToRoom(`chat:${chatId}`, {
                type: 'chat:read_receipt',
                data: { chatId, userId },
                createdAt: new Date().toISOString()
            });
            return { success: true, updatedCount: count };
        }
        catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }
    async getChatRooms(userId, options = {}) {
        try {
            const { limit = 20, offset = 0 } = options;
            const chats = await prisma_1.prisma.chat.findMany({
                where: { OR: [{ customerId: userId }, { artisanId: userId }] },
                orderBy: { lastMessageAt: 'desc' },
                include: { messages: { take: 1, orderBy: { createdAt: 'desc' }, include: { sender: true } } }
            });
            const paginatedRooms = chats.slice(offset, offset + limit);
            const roomsWithUnreadCount = await Promise.all(paginatedRooms.map(async (room) => ({
                ...room,
                unreadCount: await this.getUnreadCount(room.id, userId)
            })));
            return {
                rooms: roomsWithUnreadCount,
                total: chats.length,
                hasMore: offset + limit < chats.length
            };
        }
        catch (error) {
            console.error('Error getting chat rooms:', error);
            throw error;
        }
    }
    async getChatMessages(chatId, userId, options = {}) {
        try {
            // Verify user is participant in the chat
            const chat = await prisma_1.prisma.chat.findUnique({ where: { id: chatId } });
            if (!chat) {
                throw new Error('Chat not found');
            }
            if (![chat.customerId, chat.artisanId].includes(userId)) {
                throw new Error('User is not a participant in this chat');
            }
            const { limit = 50, offset = 0, before } = options;
            const where = { chatId };
            if (before) {
                const beforeMessage = await prisma_1.prisma.message.findUnique({
                    where: { id: before },
                    select: { createdAt: true }
                });
                if (beforeMessage) {
                    where.createdAt = { lt: beforeMessage.createdAt };
                }
            }
            const messages = await prisma_1.prisma.message.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    sender: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            });
            const total = await prisma_1.prisma.message.count({ where: { chatId } });
            return {
                messages: messages.reverse(), // Return in chronological order
                total,
                hasMore: offset + limit < total
            };
        }
        catch (error) {
            console.error('Error getting chat messages:', error);
            throw error;
        }
    }
    async getUnreadCount(chatId, userId) {
        try {
            return await prisma_1.prisma.message.count({
                where: {
                    chatId,
                    senderId: { not: userId },
                    readAt: null
                }
            });
        }
        catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    }
    async deleteMessage(messageId, userId) {
        try {
            const message = await prisma_1.prisma.message.findUnique({
                where: { id: messageId }
            });
            if (!message) {
                throw new Error('Message not found');
            }
            if (message.senderId !== userId) {
                throw new Error('You can only delete your own messages');
            }
            await prisma_1.prisma.message.delete({
                where: { id: messageId }
            });
            // Broadcast message deletion
            const socketService = (0, socketService_1.getSocketService)();
            socketService.broadcastToRoom(`chat:${message.chatId}`, {
                type: 'chat:message_deleted',
                data: {
                    messageId,
                    chatId: message.chatId
                },
                createdAt: new Date().toISOString()
            });
            return { success: true };
        }
        catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }
    async searchMessages(query, userId, chatId) {
        try {
            // Get chats where user participates
            const userChats = await prisma_1.prisma.chat.findMany({
                where: { OR: [{ customerId: userId }, { artisanId: userId }] },
                select: { id: true }
            });
            const chatIds = chatId ? [chatId] : userChats.map(c => c.id);
            const messages = await prisma_1.prisma.message.findMany({
                where: {
                    chatId: { in: chatIds },
                    content: { contains: query }
                },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    sender: {
                        select: { id: true, firstName: true, lastName: true, avatar: true }
                    },
                    chat: { select: { id: true } }
                }
            });
            return { messages };
        }
        catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    }
    // Utility methods
    async getChatRoomInfo(chatId, userId) {
        try {
            const chat = await prisma_1.prisma.chat.findUnique({ where: { id: chatId } });
            if (!chat) {
                throw new Error('Chat not found');
            }
            if (![chat.customerId, chat.artisanId].includes(userId)) {
                throw new Error('User is not a participant in this chat');
            }
            const participantDetails = await prisma_1.prisma.user.findMany({
                where: { id: { in: [chat.customerId, chat.artisanId] } },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            });
            const unreadCount = await this.getUnreadCount(chatId, userId);
            const messageCount = await prisma_1.prisma.message.count({ where: { chatId } });
            return {
                id: chat.id,
                type: 'direct',
                participantDetails,
                unreadCount,
                messageCount
            };
        }
        catch (error) {
            console.error('Error getting chat room info:', error);
            throw error;
        }
    }
    generateId() {
        return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Analytics methods
    async getChatStats(dateRange) {
        try {
            const where = {};
            if (dateRange) {
                where.createdAt = {
                    gte: dateRange.start,
                    lte: dateRange.end
                };
            }
            const totalMessages = await prisma_1.prisma.message.count({ where });
            const totalRooms = await prisma_1.prisma.chat.count({
                where: dateRange ? {
                    createdAt: { gte: dateRange.start, lte: dateRange.end }
                } : {}
            });
            const activeUsers = await prisma_1.prisma.message.groupBy({
                by: ['senderId'],
                where,
                _count: { senderId: true }
            });
            return {
                totalMessages,
                totalRooms,
                activeUsers: activeUsers.length
            };
        }
        catch (error) {
            console.error('Error getting chat stats:', error);
            throw error;
        }
    }
}
exports.ChatService = ChatService;
// Singleton instance
const chatService = new ChatService();
exports.chatService = chatService;
//# sourceMappingURL=chatService.js.map