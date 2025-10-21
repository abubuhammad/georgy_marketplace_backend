export interface CreateNotificationData {
    userId: string;
    type: 'order' | 'delivery' | 'payment' | 'chat' | 'artisan' | 'admin' | 'system';
    title: string;
    message: string;
    data?: any;
}
export interface NotificationPreferences {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    categories: {
        orders: boolean;
        delivery: boolean;
        payments: boolean;
        chat: boolean;
        artisan: boolean;
        marketing: boolean;
        system: boolean;
    };
}
interface NotificationRecord {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data: any;
    read: boolean;
    createdAt: Date;
}
export declare class NotificationService {
    createNotification(notificationData: CreateNotificationData): Promise<NotificationRecord>;
    sendBulkNotifications(notifications: CreateNotificationData[]): Promise<({
        success: boolean;
        notification: NotificationRecord;
        error?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        error: any;
        data: CreateNotificationData;
        notification?: undefined;
    })[]>;
    private sendRealTimeNotification;
    private shouldSendNotification;
    getUserPreferences(userId: string): Promise<NotificationPreferences>;
    private parsePreferences;
    private getDefaultPreferences;
    private createDefaultPreferences;
    updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<{
        pushEnabled: boolean;
        emailEnabled: boolean;
        smsEnabled: boolean;
        categories: {
            orders: boolean;
            delivery: boolean;
            payments: boolean;
            chat: boolean;
            artisan: boolean;
            marketing: boolean;
            system: boolean;
        };
    }>;
    getUserNotifications(userId: string, options?: {
        limit?: number;
        offset?: number;
        unreadOnly?: boolean;
    }): Promise<{
        notifications: never[];
        total: number;
        unreadCount: number;
        hasMore: boolean;
    }>;
    markAsRead(notificationId: string, userId: string): Promise<{
        count: number;
    }>;
    markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        count: number;
    }>;
    sendOrderNotification(userId: string, orderId: string, status: string, message?: string): Promise<NotificationRecord>;
    sendDeliveryNotification(userId: string, deliveryId: string, status: string, location?: any): Promise<NotificationRecord>;
    sendPaymentNotification(userId: string, paymentId: string, status: string, amount: number): Promise<NotificationRecord>;
    sendChatNotification(userId: string, senderId: string, senderName: string, preview: string): Promise<NotificationRecord>;
    sendArtisanNotification(userId: string, type: 'request' | 'appointment' | 'payment', data: any): Promise<NotificationRecord>;
    sendSystemNotification(userId: string, title: string, message: string, data?: any): Promise<NotificationRecord>;
    sendBulkSystemNotification(userIds: string[], title: string, message: string, data?: any): Promise<({
        success: boolean;
        notification: NotificationRecord;
        error?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        error: any;
        data: CreateNotificationData;
        notification?: undefined;
    })[]>;
    private generateId;
    getNotificationStats(dateRange?: {
        start: Date;
        end: Date;
    }): Promise<{
        total: number;
        unread: number;
        byType: Record<string, number>;
    }>;
}
declare const notificationService: NotificationService;
export { notificationService };
//# sourceMappingURL=notificationService.d.ts.map