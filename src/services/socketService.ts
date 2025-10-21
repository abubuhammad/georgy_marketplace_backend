import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { prisma } from '../utils/prisma';
import { NotificationService } from './notificationService';

export interface SocketUser {
  id: string;
  email: string;
  role: string;
  socketId: string;
}

export interface WebSocketEvent {
  type: string;
  data: any;
  createdAt: string;
  userId?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: 'order' | 'delivery' | 'chat' | 'payment' | 'system' | 'notification';
}

export interface DeliveryLocationUpdate {
  deliveryId: string;
  agentId: string;
  location: {
    lat: number;
    lng: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
  };
  createdAt: string;
  eta?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'location' | 'system';
  createdAt: string;
  metadata?: any;
}

export interface OrderStatusUpdate {
  orderId: string;
  status: string;
  previousStatus?: string;
  details?: string;
  location?: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export interface NotificationData {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'order' | 'delivery' | 'payment' | 'chat' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  data?: any;
  actionUrl?: string;
  expiresAt?: string;
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, SocketUser>();
  private userSockets = new Map<string, string>(); // userId -> socketId
  private activeDeliveries = new Map<string, DeliveryLocationUpdate>();
  private chatRooms = new Map<string, Set<string>>(); // chatId -> Set of userIds
  private typingUsers = new Map<string, Set<string>>(); // chatId -> Set of userIds
  private deliveryAgentLocations = new Map<string, DeliveryLocationUpdate>();
  private notificationService: NotificationService;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: [config.frontend.url, 'http://localhost:19006'], // Include Expo dev server
        credentials: true,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.notificationService = new NotificationService();
    this.setupAuthentication();
    this.setupEventHandlers();
    this.startPeriodicCleanup();
  }

  private setupAuthentication() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as any;
        const user = await prisma.user.findUnique({
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
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
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

  private joinUserRooms(socket: any, user: any) {
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

  private setupRealTimeEventHandlers(socket: any) {
    const user = socket.data.user;

    // Enhanced Chat events
    socket.on('chat:join_room', (chatId: string) => {
      socket.join(`chat:${chatId}`);
      
      // Track room membership
      if (!this.chatRooms.has(chatId)) {
        this.chatRooms.set(chatId, new Set());
      }
      this.chatRooms.get(chatId)!.add(user.id);
      
      // Notify other users in room
      socket.to(`chat:${chatId}`).emit('chat:user_joined', {
        userId: user.id,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        createdAt: new Date().toISOString()
      });
      
      console.log(`📱 User ${user.email} joined chat room: ${chatId}`);
    });

    socket.on('chat:leave_room', (chatId: string) => {
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

    socket.on('chat:send_message', async (data: {
      chatId: string;
      message: string;
      messageType?: string;
      metadata?: any;
    }) => {
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
      } catch (error) {
        console.error('Error sending chat message:', error);
        socket.emit('chat:error', { error: 'Failed to send message' });
      }
    });

    socket.on('chat:typing', (data: { chatId: string; isTyping: boolean }) => {
      if (!this.typingUsers.has(data.chatId)) {
        this.typingUsers.set(data.chatId, new Set());
      }
      
      if (data.isTyping) {
        this.typingUsers.get(data.chatId)!.add(user.id);
      } else {
        this.typingUsers.get(data.chatId)!.delete(user.id);
      }
      
      socket.to(`chat:${data.chatId}`).emit('chat:typing', {
        userId: user.id,
        isTyping: data.isTyping,
        createdAt: new Date().toISOString()
      });
    });

    // Enhanced Order tracking events
    socket.on('track', (orderId: string) => {
      socket.join(`${orderId}`);
      console.log(`📦 User ${user.email} tracking  ${orderId}`);
      
      // Send current order status
      this.sendCurrentOrderStatus(socket, orderId);
    });

    socket.on('stop_tracking', (orderId: string) => {
      socket.leave(`${orderId}`);
      console.log(`📦 User ${user.email} stopped tracking  ${orderId}`);
    });

    // Enhanced Delivery tracking events
    socket.on('delivery:track', (deliveryId: string) => {
      socket.join(`delivery:${deliveryId}`);
      console.log(`🚚 User ${user.email} tracking delivery: ${deliveryId}`);
      
      // Send current delivery status and location
      this.sendCurrentDeliveryStatus(socket, deliveryId);
    });

    socket.on('delivery:stop_tracking', (deliveryId: string) => {
      socket.leave(`delivery:${deliveryId}`);
      console.log(`🚚 User ${user.email} stopped tracking delivery: ${deliveryId}`);
    });

    // Enhanced Location updates (for delivery agents)
    socket.on('delivery:location_update', (data: DeliveryLocationUpdate) => {
      if (user.role === 'DELIVERY_AGENT') {
        const normalized: DeliveryLocationUpdate = {
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
    socket.on('agent:status_update', (data: {
      status: 'available' | 'busy' | 'offline';
      currentDelivery?: string;
    }) => {
      if (user.role === 'DELIVERY_AGENT') {
        this.broadcastAgentStatusUpdate(user.id, data);
      }
    });

    // Enhanced Presence updates
    socket.on('presence:update', (status: 'online' | 'away' | 'busy' | 'offline') => {
      this.broadcastUserPresence(user.id, status);
    });

    // Notification events
    socket.on('notification:mark_read', async (notificationId: string) => {
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
  public broadcastToUser(userId: string, event: WebSocketEvent) {
    this.io.to(`user:${userId}`).emit(event.type, event.data);
  }

  public broadcastToRoom(room: string, event: WebSocketEvent) {
    this.io.to(room).emit(event.type, event.data);
  }

  public broadcastOrderUpdate(orderId: string, data: any) {
    this.io.to(`${orderId}`).emit('status_update', {
      ...data,
      createdAt: new Date().toISOString()
    });
  }

  public broadcastDeliveryLocation(deliveryId: string, location: { lat: number; lng: number }) {
    this.io.to(`delivery:${deliveryId}`).emit('delivery:location_update', {
      deliveryId,
      location,
      createdAt: new Date().toISOString()
    });
  }

  public broadcastChatMessage(chatId: string, message: any) {
    this.io.to(`chat:${chatId}`).emit('chat:new_message', {
      chatId,
      message,
      createdAt: new Date().toISOString()
    });
  }

  public broadcastNotification(userId: string, notification: any) {
    this.io.to(`user:${userId}`).emit('notification:new', {
      ...notification,
      createdAt: new Date().toISOString()
    });
  }

  public broadcastInventoryUpdate(sellerId: string, data: any) {
    this.io.to(`inventory:${sellerId}`).emit('inventory:stock_update', {
      ...data,
      createdAt: new Date().toISOString()
    });
  }

  public broadcastAnalyticsUpdate(data: any) {
    this.io.to('admin:analytics').emit('analytics:real_time_update', {
      ...data,
      createdAt: new Date().toISOString()
    });
  }

  public broadcastUserPresence(userId: string, status: string) {
    this.io.emit('presence:user_status', {
      userId,
      status,
      createdAt: new Date().toISOString()
    });
  }

  public broadcastToRole(role: string, event: WebSocketEvent) {
    this.io.to(`role:${role}`).emit(event.type, event.data);
  }

  // Utility methods
  public getConnectedUsers(): SocketUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getUserSocketId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  public isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getConnectedUsersByRole(role: string): SocketUser[] {
    return Array.from(this.connectedUsers.values()).filter(user => user.role === role);
  }

  // Enhanced helper methods
  private async saveChatMessage(messageData: {
    chatId: string;
    senderId: string;
    message: string;
    messageType: string;
    metadata?: any;
  }): Promise<ChatMessage> {
    try {
      // Compute recipient from chat
      const chat = await prisma.chat.findUnique({ where: { id: messageData.chatId } });
      if (!chat) throw new Error('Chat not found');
      const recipientId = chat.customerId === messageData.senderId ? chat.artisanId : chat.customerId;

      // Save to database
      const chatMessage = await prisma.message.create({
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
        messageType: chatMessage.messageType as any,
        createdAt: chatMessage.createdAt.toISOString()
      };
    } catch (error) {
      console.error('Error saving chat message:', error);
      throw error;
    }
  }

  private async sendCurrentOrderStatus(socket: any, orderId: string) {
    try {
      const order = await prisma.order.findUnique({
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
    } catch (error) {
      console.error('Error sending current order status:', error);
    }
  }

  private async sendCurrentDeliveryStatus(socket: any, deliveryId: string) {
    try {
      const delivery = await prisma.shipment.findUnique({
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
    } catch (error) {
      console.error('Error sending current delivery status:', error);
    }
  }

  private broadcastEnhancedDeliveryLocation(data: DeliveryLocationUpdate) {
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

  private async updateDeliveryETA(deliveryId: string, eta: string) {
    try {
      await prisma.shipment.update({
        where: { id: deliveryId },
        data: { estimatedDelivery: new Date(eta) }
      });

      this.io.to(`delivery:${deliveryId}`).emit('delivery:eta_update', {
        deliveryId,
        eta,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating delivery ETA:', error);
    }
  }

  private broadcastAgentStatusUpdate(agentId: string, data: any) {
    this.io.to('admin:monitoring').emit('agent:status_update', {
      agentId,
      ...data,
      createdAt: new Date().toISOString()
    });
  }

  private async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      await prisma.notification.update({
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  private async markAllNotificationsAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
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
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  private startPeriodicCleanup() {
    // Clean up inactive connections and old data every 5 minutes
    setInterval(() => {
      this.cleanupInactiveConnections();
      this.cleanupOldTypingUsers();
    }, 5 * 60 * 1000);
  }

  private cleanupInactiveConnections() {
    // Remove inactive delivery locations older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    for (const [agentId, location] of this.deliveryAgentLocations.entries()) {
      if (new Date(location.createdAt) < tenMinutesAgo) {
        this.deliveryAgentLocations.delete(agentId);
      }
    }
  }

  private cleanupOldTypingUsers() {
    // This would be enhanced with actual typing timeout logic
    // For now, we'll clear all typing users periodically
    this.typingUsers.clear();
  }

  // Enhanced public methods
  public async broadcastEnhancedNotification(userId: string, notification: NotificationData) {
    // Send via WebSocket
    this.io.to(`user:${userId}`).emit('notification:new', notification);
    
    // Also send via other channels if configured
    if (notification.priority === 'critical' || notification.priority === 'high') {
      await this.notificationService.sendChatNotification(
        userId,
        'system',
        'System',
        `${notification.title}: ${notification.message}`
      );
    }
  }

  public broadcastSystemAlert(alert: {
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error';
    targetRoles?: string[];
  }) {
    const notification = {
      id: `system_${Date.now()}`,
      title: alert.title,
      message: alert.message,
      type: alert.type,
      category: 'system' as const,
      priority: alert.type === 'error' ? 'critical' as const : 'medium' as const,
      createdAt: new Date().toISOString()
    };

    if (alert.targetRoles) {
      alert.targetRoles.forEach(role => {
        this.io.to(`role:${role}`).emit('system:alert', notification);
      });
    } else {
      this.io.emit('system:alert', notification);
    }
  }

  public getRoomUsers(chatId: string): string[] {
    return Array.from(this.chatRooms.get(chatId) || new Set());
  }

  public getTypingUsers(chatId: string): string[] {
    return Array.from(this.typingUsers.get(chatId) || new Set());
  }

  public getActiveDeliveries(): Map<string, DeliveryLocationUpdate> {
    return new Map(this.activeDeliveries);
  }

  public getDeliveryAgentLocations(): Map<string, DeliveryLocationUpdate> {
    return new Map(this.deliveryAgentLocations);
  }

  // System monitoring
  public getSystemStats() {
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

// Singleton instance
let socketService: SocketService;

export const initializeSocketService = (server: HTTPServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(server);
    console.log('🚀 Socket.io service initialized');
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call initializeSocketService first.');
  }
  return socketService;
};
