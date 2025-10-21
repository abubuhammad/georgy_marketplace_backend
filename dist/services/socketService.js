"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketService = exports.initializeSocketService = exports.SocketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
const prisma_1 = require("../utils/prisma");
const notificationService_1 = require("./notificationService");
class SocketService {
    constructor(server) {
        this.connectedUsers = new Map();
        this.userSockets = new Map(); // userId -> socketId
        this.activeDeliveries = new Map();
        this.chatRooms = new Map(); // chatId -> Set of userIds
        this.typingUsers = new Map(); // chatId -> Set of userIds
        this.deliveryAgentLocations = new Map();
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: [config_1.config.frontend.url, 'http://localhost:19006'], // Include Expo dev server
                credentials: true,
                methods: ['GET', 'POST']
            },
            transports: ['websocket', 'polling'],
            pingTimeout: 60000,
            pingInterval: 25000
        });
        this.notificationService = new notificationService_1.NotificationService();
        this.setupAuthentication();
        this.setupEventHandlers();
        this.startPeriodicCleanup();
    }
    setupAuthentication() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        role: true,
                        isActive: true
                    }
                });
                if (!user || !user.isActive) {
                    return next(new Error('Invalid or inactive user'));
                }
                socket.data.user = user;
                next();
            }
            catch (error) {
                console.error('Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            const user = socket.data.user;
            console.log(`🔌 User ${user.email} connected (${socket.id})`);
            // Store connected user
            this.connectedUsers.set(socket.id, {
                id: user.id,
                email: user.email,
                role: user.role,
                socketId: socket.id
            });
            this.userSockets.set(user.id, socket.id);
            // Join user-specific rooms
            this.joinUserRooms(socket, user);
            // Handle real-time events
            this.setupRealTimeEventHandlers(socket);
            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`🔌 User ${user.email} disconnected (${socket.id})`);
                this.connectedUsers.delete(socket.id);
                this.userSockets.delete(user.id);
                // Broadcast user offline status
                this.broadcastUserPresence(user.id, 'offline');
            });
            // Broadcast user online status
            this.broadcastUserPresence(user.id, 'online');
        });
    }
    joinUserRooms(socket, user) {
        // Join personal room for notifications
        socket.join(`user:${user.id}`);
        // Join role-based rooms
        socket.join(`role:${user.role}`);
        // Join admin rooms if admin
        if (user.role === 'admin') {
            socket.join('admin:analytics');
            socket.join('admin:monitoring');
        }
        // Join seller rooms if seller
        if (user.role === 'seller') {
            socket.join(`seller:${user.id}`);
            socket.join(`inventory:${user.id}`);
        }
        // Join artisan rooms if artisan
        if (user.role === 'artisan') {
            socket.join(`artisan:${user.id}`);
        }
    }
    setupRealTimeEventHandlers(socket) {
        const user = socket.data.user;
        // Enhanced Chat events
        socket.on('chat:join_room', (chatId) => {
            socket.join(`chat:${chatId}`);
            // Track room membership
            if (!this.chatRooms.has(chatId)) {
                this.chatRooms.set(chatId, new Set());
            }
            this.chatRooms.get(chatId).add(user.id);
            // Notify other users in room
            socket.to(`chat:${chatId}`).emit('chat:user_joined', {
                userId: user.id,
                userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                createdAt: new Date().toISOString()
            });
            console.log(`📱 User ${user.email} joined chat room: ${chatId}`);
        });
        socket.on('chat:leave_room', (chatId) => {
            socket.leave(`chat:${chatId}`);
            // Remove from room tracking
            this.chatRooms.get(chatId)?.delete(user.id);
            this.typingUsers.get(chatId)?.delete(user.id);
            // Notify other users
            socket.to(`chat:${chatId}`).emit('chat:user_left', {
                userId: user.id,
                createdAt: new Date().toISOString()
            });
            console.log(`📱 User ${user.email} left chat room: ${chatId}`);
        });
        socket.on('chat:send_message', async (data) => {
            try {
                // Save message to database
                const savedMessage = await this.saveChatMessage({
                    chatId: data.chatId,
                    senderId: user.id,
                    message: data.message,
                    messageType: data.messageType || 'text',
                    metadata: data.metadata
                });
                // Broadcast to room
                this.broadcastChatMessage(data.chatId, savedMessage);
            }
            catch (error) {
                console.error('Error sending chat message:', error);
                socket.emit('chat:error', { error: 'Failed to send message' });
            }
        });
        socket.on('chat:typing', (data) => {
            if (!this.typingUsers.has(data.chatId)) {
                this.typingUsers.set(data.chatId, new Set());
            }
            if (data.isTyping) {
                this.typingUsers.get(data.chatId).add(user.id);
            }
            else {
                this.typingUsers.get(data.chatId).delete(user.id);
            }
            socket.to(`chat:${data.chatId}`).emit('chat:typing', {
                userId: user.id,
                isTyping: data.isTyping,
                createdAt: new Date().toISOString()
            });
        });
        // Enhanced Order tracking events
        socket.on('track', (orderId) => {
            socket.join(`${orderId}`);
            console.log(`📦 User ${user.email} tracking  ${orderId}`);
            // Send current order status
            this.sendCurrentOrderStatus(socket, orderId);
        });
        socket.on('stop_tracking', (orderId) => {
            socket.leave(`${orderId}`);
            console.log(`📦 User ${user.email} stopped tracking  ${orderId}`);
        });
        // Enhanced Delivery tracking events
        socket.on('delivery:track', (deliveryId) => {
            socket.join(`delivery:${deliveryId}`);
            console.log(`🚚 User ${user.email} tracking delivery: ${deliveryId}`);
            // Send current delivery status and location
            this.sendCurrentDeliveryStatus(socket, deliveryId);
        });
        socket.on('delivery:stop_tracking', (deliveryId) => {
            socket.leave(`delivery:${deliveryId}`);
            console.log(`🚚 User ${user.email} stopped tracking delivery: ${deliveryId}`);
        });
        // Enhanced Location updates (for delivery agents)
        socket.on('delivery:location_update', (data) => {
            if (user.role === 'DELIVERY_AGENT') {
                const normalized = {
                    deliveryId: data.deliveryId,
                    agentId: user.id,
                    location: data.location,
                    createdAt: new Date().toISOString(),
                    eta: data.eta
                };
                this.deliveryAgentLocations.set(user.id, normalized);
                this.broadcastEnhancedDeliveryLocation(normalized);
                if (normalized.eta) {
                    this.updateDeliveryETA(normalized.deliveryId, normalized.eta);
                }
            }
        });
        // Agent status updates
        socket.on('agent:status_update', (data) => {
            if (user.role === 'DELIVERY_AGENT') {
                this.broadcastAgentStatusUpdate(user.id, data);
            }
        });
        // Enhanced Presence updates
        socket.on('presence:update', (status) => {
            this.broadcastUserPresence(user.id, status);
        });
        // Notification events
        socket.on('notification:mark_read', async (notificationId) => {
            await this.markNotificationAsRead(user.id, notificationId);
        });
        socket.on('notification:mark_all_read', async () => {
            await this.markAllNotificationsAsRead(user.id);
        });
        // System events
        socket.on('system:ping', () => {
            socket.emit('system:pong', {
                createdAt: new Date().toISOString(),
                serverId: process.env.SERVER_ID || 'main'
            });
        });
        // Heartbeat for connection monitoring
        socket.on('heartbeat', () => {
            socket.emit('heartbeat_ack', {
                createdAt: new Date().toISOString(),
                userId: user.id
            });
        });
    }
    // Public methods for broadcasting events
    broadcastToUser(userId, event) {
        this.io.to(`user:${userId}`).emit(event.type, event.data);
    }
    broadcastToRoom(room, event) {
        this.io.to(room).emit(event.type, event.data);
    }
    broadcastOrderUpdate(orderId, data) {
        this.io.to(`${orderId}`).emit('status_update', {
            ...data,
            createdAt: new Date().toISOString()
        });
    }
    broadcastDeliveryLocation(deliveryId, location) {
        this.io.to(`delivery:${deliveryId}`).emit('delivery:location_update', {
            deliveryId,
            location,
            createdAt: new Date().toISOString()
        });
    }
    broadcastChatMessage(chatId, message) {
        this.io.to(`chat:${chatId}`).emit('chat:new_message', {
            chatId,
            message,
            createdAt: new Date().toISOString()
        });
    }
    broadcastNotification(userId, notification) {
        this.io.to(`user:${userId}`).emit('notification:new', {
            ...notification,
            createdAt: new Date().toISOString()
        });
    }
    broadcastInventoryUpdate(sellerId, data) {
        this.io.to(`inventory:${sellerId}`).emit('inventory:stock_update', {
            ...data,
            createdAt: new Date().toISOString()
        });
    }
    broadcastAnalyticsUpdate(data) {
        this.io.to('admin:analytics').emit('analytics:real_time_update', {
            ...data,
            createdAt: new Date().toISOString()
        });
    }
    broadcastUserPresence(userId, status) {
        this.io.emit('presence:user_status', {
            userId,
            status,
            createdAt: new Date().toISOString()
        });
    }
    broadcastToRole(role, event) {
        this.io.to(`role:${role}`).emit(event.type, event.data);
    }
    // Utility methods
    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }
    getUserSocketId(userId) {
        return this.userSockets.get(userId);
    }
    isUserConnected(userId) {
        return this.userSockets.has(userId);
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getConnectedUsersByRole(role) {
        return Array.from(this.connectedUsers.values()).filter(user => user.role === role);
    }
    // Enhanced helper methods
    async saveChatMessage(messageData) {
        try {
            // Compute recipient from chat
            const chat = await prisma_1.prisma.chat.findUnique({ where: { id: messageData.chatId } });
            if (!chat)
                throw new Error('Chat not found');
            const recipientId = chat.customerId === messageData.senderId ? chat.artisanId : chat.customerId;
            // Save to database
            const chatMessage = await prisma_1.prisma.message.create({
                data: {
                    chatId: messageData.chatId,
                    senderId: messageData.senderId,
                    recipientId,
                    content: messageData.message,
                    messageType: messageData.messageType
                }
            });
            return {
                id: chatMessage.id,
                chatId: chatMessage.chatId,
                senderId: chatMessage.senderId,
                message: chatMessage.content,
                messageType: chatMessage.messageType,
                createdAt: chatMessage.createdAt.toISOString()
            };
        }
        catch (error) {
            console.error('Error saving chat message:', error);
            throw error;
        }
    }
    async sendCurrentOrderStatus(socket, orderId) {
        try {
            const order = await prisma_1.prisma.order.findUnique({
                where: { id: orderId },
                include: {
                    shipments: {
                        include: {
                            agent: true,
                            zone: true
                        }
                    }
                }
            });
            if (order) {
                socket.emit('current_status', {
                    orderId: order.id,
                    status: order.status,
                    shipments: order.shipments.map(shipment => ({
                        id: shipment.id,
                        trackingNumber: shipment.trackingNumber,
                        status: shipment.status,
                        estimatedDelivery: shipment.estimatedDelivery,
                        currentLocation: shipment.currentLocation
                    }))
                });
            }
        }
        catch (error) {
            console.error('Error sending current order status:', error);
        }
    }
    async sendCurrentDeliveryStatus(socket, deliveryId) {
        try {
            const delivery = await prisma_1.prisma.shipment.findUnique({
                where: { id: deliveryId },
                include: {
                    agent: {
                        include: {
                            user: { select: { firstName: true, lastName: true } }
                        }
                    },
                    zone: true
                }
            });
            if (delivery) {
                const agentLocation = delivery.agent ?
                    this.deliveryAgentLocations.get(delivery.agent.id) : null;
                socket.emit('delivery:current_status', {
                    deliveryId: delivery.id,
                    trackingNumber: delivery.trackingNumber,
                    status: delivery.status,
                    currentLocation: delivery.currentLocation,
                    agentLocation: agentLocation?.location,
                    estimatedDelivery: delivery.estimatedDelivery,
                    agent: delivery.agent ? {
                        name: `${delivery.agent.user.firstName} ${delivery.agent.user.lastName}`,
                        vehicleType: delivery.agent.vehicleType
                    } : null
                });
            }
        }
        catch (error) {
            console.error('Error sending current delivery status:', error);
        }
    }
    broadcastEnhancedDeliveryLocation(data) {
        this.io.to(`delivery:${data.deliveryId}`).emit('delivery:location_update', {
            deliveryId: data.deliveryId,
            agentId: data.agentId,
            location: data.location,
            createdAt: data.createdAt,
            eta: data.eta
        });
        // Also broadcast to admin monitoring
        this.io.to('admin:monitoring').emit('agent:location_update', data);
    }
    async updateDeliveryETA(deliveryId, eta) {
        try {
            await prisma_1.prisma.shipment.update({
                where: { id: deliveryId },
                data: { estimatedDelivery: new Date(eta) }
            });
            this.io.to(`delivery:${deliveryId}`).emit('delivery:eta_update', {
                deliveryId,
                eta,
                createdAt: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error updating delivery ETA:', error);
        }
    }
    broadcastAgentStatusUpdate(agentId, data) {
        this.io.to('admin:monitoring').emit('agent:status_update', {
            agentId,
            ...data,
            createdAt: new Date().toISOString()
        });
    }
    async markNotificationAsRead(userId, notificationId) {
        try {
            await prisma_1.prisma.notification.update({
                where: {
                    id: notificationId,
                    userId: userId
                },
                data: {
                    read: true,
                    readAt: new Date()
                }
            });
            this.io.to(`user:${userId}`).emit('notification:marked_read', {
                notificationId,
                createdAt: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    async markAllNotificationsAsRead(userId) {
        try {
            await prisma_1.prisma.notification.updateMany({
                where: {
                    userId: userId,
                    read: false
                },
                data: {
                    read: true,
                    readAt: new Date()
                }
            });
            this.io.to(`user:${userId}`).emit('notification:all_marked_read', {
                createdAt: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
    startPeriodicCleanup() {
        // Clean up inactive connections and old data every 5 minutes
        setInterval(() => {
            this.cleanupInactiveConnections();
            this.cleanupOldTypingUsers();
        }, 5 * 60 * 1000);
    }
    cleanupInactiveConnections() {
        // Remove inactive delivery locations older than 10 minutes
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        for (const [agentId, location] of this.deliveryAgentLocations.entries()) {
            if (new Date(location.createdAt) < tenMinutesAgo) {
                this.deliveryAgentLocations.delete(agentId);
            }
        }
    }
    cleanupOldTypingUsers() {
        // This would be enhanced with actual typing timeout logic
        // For now, we'll clear all typing users periodically
        this.typingUsers.clear();
    }
    // Enhanced public methods
    async broadcastEnhancedNotification(userId, notification) {
        // Send via WebSocket
        this.io.to(`user:${userId}`).emit('notification:new', notification);
        // Also send via other channels if configured
        if (notification.priority === 'critical' || notification.priority === 'high') {
            await this.notificationService.sendChatNotification(userId, 'system', 'System', `${notification.title}: ${notification.message}`);
        }
    }
    broadcastSystemAlert(alert) {
        const notification = {
            id: `system_${Date.now()}`,
            title: alert.title,
            message: alert.message,
            type: alert.type,
            category: 'system',
            priority: alert.type === 'error' ? 'critical' : 'medium',
            createdAt: new Date().toISOString()
        };
        if (alert.targetRoles) {
            alert.targetRoles.forEach(role => {
                this.io.to(`role:${role}`).emit('system:alert', notification);
            });
        }
        else {
            this.io.emit('system:alert', notification);
        }
    }
    getRoomUsers(chatId) {
        return Array.from(this.chatRooms.get(chatId) || new Set());
    }
    getTypingUsers(chatId) {
        return Array.from(this.typingUsers.get(chatId) || new Set());
    }
    getActiveDeliveries() {
        return new Map(this.activeDeliveries);
    }
    getDeliveryAgentLocations() {
        return new Map(this.deliveryAgentLocations);
    }
    // System monitoring
    getSystemStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            totalRooms: this.io.sockets.adapter.rooms.size,
            activeChatRooms: this.chatRooms.size,
            activeDeliveries: this.activeDeliveries.size,
            deliveryAgents: this.deliveryAgentLocations.size,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            createdAt: new Date().toISOString()
        };
    }
}
exports.SocketService = SocketService;
// Singleton instance
let socketService;
const initializeSocketService = (server) => {
    if (!socketService) {
        socketService = new SocketService(server);
        console.log('🚀 Socket.io service initialized');
    }
    return socketService;
};
exports.initializeSocketService = initializeSocketService;
const getSocketService = () => {
    if (!socketService) {
        throw new Error('Socket service not initialized. Call initializeSocketService first.');
    }
    return socketService;
};
exports.getSocketService = getSocketService;
//# sourceMappingURL=socketService.js.map