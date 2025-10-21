import { NotificationService } from './notificationService';
export interface MultiChannelNotificationData {
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    category: 'order' | 'delivery' | 'payment' | 'chat' | 'system';
    priority: 'low' | 'medium' | 'high' | 'critical';
    data?: any;
    actionUrl?: string;
    expiresAt?: Date;
    channels?: ('email' | 'sms' | 'push' | 'whatsapp')[];
}
export interface UserNotificationPreferences {
    userId: string;
    email: boolean;
    sms: boolean;
    push: boolean;
    whatsapp: boolean;
    categories: {
        orders: boolean;
        delivery: boolean;
        payment: boolean;
        chat: boolean;
        system: boolean;
    };
    quietHours?: {
        start: string;
        end: string;
        timezone: string;
    };
}
export declare class EnhancedNotificationService extends NotificationService {
    private emailTransporter;
    private twilioClient?;
    private whatsappEnabled;
    constructor();
    private initializeExternalServices;
    sendNotification(notification: MultiChannelNotificationData): Promise<{
        success: boolean;
        deliveredChannels: string[];
        failedChannels: string[];
        errors: any[];
    }>;
    private sendEmailNotification;
    private sendSMSNotification;
    private sendPushNotification;
    private sendWhatsAppNotification;
    private generateEmailTemplate;
    private generateSMSTemplate;
    private generatePushTemplate;
    private generateWhatsAppTemplate;
    private getEnhancedUserPreferences;
    private getUserContactInfo;
    private getDefaultChannels;
    private isInQuietHours;
    private scheduleNotification;
    private calculateNextSendTime;
    private mapCategoryToType;
    sendOrderStatusUpdate(userId: string, orderId: string, status: string, details?: string): Promise<{
        success: boolean;
        deliveredChannels: string[];
        failedChannels: string[];
        errors: any[];
    }>;
    sendDeliveryUpdate(userId: string, trackingNumber: string, status: string, location?: string, eta?: string): Promise<{
        success: boolean;
        deliveredChannels: string[];
        failedChannels: string[];
        errors: any[];
    }>;
    sendPaymentAlert(userId: string, amount: number, status: 'success' | 'failed' | 'pending', orderId: string): Promise<{
        success: boolean;
        deliveredChannels: string[];
        failedChannels: string[];
        errors: any[];
    }>;
    sendCriticalAlert(userId: string, title: string, message: string, actionUrl?: string): Promise<{
        success: boolean;
        deliveredChannels: string[];
        failedChannels: string[];
        errors: any[];
    }>;
    sendBulkMultiChannelNotification(userIds: string[], notification: Omit<MultiChannelNotificationData, 'userId'>): Promise<PromiseSettledResult<{
        success: boolean;
        deliveredChannels: string[];
        failedChannels: string[];
        errors: any[];
    }>[]>;
    registerPushSubscription(userId: string, subscription: {
        endpoint: string;
        p256dh: string;
        auth: string;
        userAgent?: string;
    }): Promise<{
        id: string;
        userId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        active: boolean;
        userAgent: string | null;
        auth: string | null;
        endpoint: string;
        p256dh: string | null;
        deviceInfo: string | null;
    }>;
    unregisterPushSubscription(userId: string, endpoint: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    updateEnhancedPreferences(userId: string, preferences: Partial<UserNotificationPreferences>): Promise<{
        push: boolean;
        id: string;
        userId: string;
        email: boolean;
        createdAt: Date;
        updatedAt: Date;
        categories: string | null;
        sms: boolean;
        whatsapp: boolean;
        quietHours: string | null;
        inApp: boolean;
    }>;
}
export declare const enhancedNotificationService: EnhancedNotificationService;
export default EnhancedNotificationService;
//# sourceMappingURL=enhancedNotificationService.d.ts.map