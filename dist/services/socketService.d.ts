import { Server as HTTPServer } from 'http';
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
export declare class SocketService {
    private io;
    private connectedUsers;
    private userSockets;
    private activeDeliveries;
    private chatRooms;
    private typingUsers;
    private deliveryAgentLocations;
    private notificationService;
    constructor(server: HTTPServer);
    private setupAuthentication;
    private setupEventHandlers;
    private joinUserRooms;
    private setupRealTimeEventHandlers;
    broadcastToUser(userId: string, event: WebSocketEvent): void;
    broadcastToRoom(room: string, event: WebSocketEvent): void;
    broadcastOrderUpdate(orderId: string, data: any): void;
    broadcastDeliveryLocation(deliveryId: string, location: {
        lat: number;
        lng: number;
    }): void;
    broadcastChatMessage(chatId: string, message: any): void;
    broadcastNotification(userId: string, notification: any): void;
    broadcastInventoryUpdate(sellerId: string, data: any): void;
    broadcastAnalyticsUpdate(data: any): void;
    broadcastUserPresence(userId: string, status: string): void;
    broadcastToRole(role: string, event: WebSocketEvent): void;
    getConnectedUsers(): SocketUser[];
    getUserSocketId(userId: string): string | undefined;
    isUserConnected(userId: string): boolean;
    getConnectedUsersCount(): number;
    getConnectedUsersByRole(role: string): SocketUser[];
    private saveChatMessage;
    private sendCurrentOrderStatus;
    private sendCurrentDeliveryStatus;
    private broadcastEnhancedDeliveryLocation;
    private updateDeliveryETA;
    private broadcastAgentStatusUpdate;
    private markNotificationAsRead;
    private markAllNotificationsAsRead;
    private startPeriodicCleanup;
    private cleanupInactiveConnections;
    private cleanupOldTypingUsers;
    broadcastEnhancedNotification(userId: string, notification: NotificationData): Promise<void>;
    broadcastSystemAlert(alert: {
        title: string;
        message: string;
        type: 'info' | 'warning' | 'error';
        targetRoles?: string[];
    }): void;
    getRoomUsers(chatId: string): string[];
    getTypingUsers(chatId: string): string[];
    getActiveDeliveries(): Map<string, DeliveryLocationUpdate>;
    getDeliveryAgentLocations(): Map<string, DeliveryLocationUpdate>;
    getSystemStats(): {
        connectedUsers: number;
        totalRooms: number;
        activeChatRooms: number;
        activeDeliveries: number;
        deliveryAgents: number;
        uptime: number;
        memoryUsage: NodeJS.MemoryUsage;
        createdAt: string;
    };
}
export declare const initializeSocketService: (server: HTTPServer) => SocketService;
export declare const getSocketService: () => SocketService;
//# sourceMappingURL=socketService.d.ts.map