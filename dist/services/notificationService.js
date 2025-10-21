"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
class NotificationService {
    async createNotification(notificationData) {
        try {
            // Since notification model doesn't exist, we'll store in memory or log
            // For now, return a mock notification structure
            const notification = {
                id: this.generateId(),
                userId: notificationData.userId,
                type: notificationData.type,
                title: notificationData.title,
                message: notificationData.message,
                data: notificationData.data || {},
                read: false,
                createdAt: new Date()
            };
            // Log the notification
            console.log('Notification created:', notification);
            // Send real-time notification
            this.sendRealTimeNotification(notification);
            return notification;
        }
        catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }
    async sendBulkNotifications(notifications) {
        const results = [];
        for (const notificationData of notifications) {
            try {
                const notification = await this.createNotification(notificationData);
                results.push({ success: true, notification });
            }
            catch (error) {
                results.push({ success: false, error: error.message, data: notificationData });
            }
        }
        return results;
    }
    sendRealTimeNotification(notification) {
        try {
            // Log real-time notification (in real implementation, would use WebSocket)
            console.log('Real-time notification sent:', notification);
        }
        catch (error) {
            console.error('Error sending real-time notification:', error);
        }
    }
    shouldSendNotification(type, preferences) {
        const categoryMap = {
            'order': 'orders',
            'delivery': 'delivery',
            'payment': 'payments',
            'chat': 'chat',
            'artisan': 'artisan',
            'admin': 'system',
            'system': 'system'
        };
        const category = categoryMap[type];
        return category ? preferences.categories[category] : true;
    }
    async getUserPreferences(userId) {
        try {
            // Since notification preferences model doesn't exist, return defaults
            return this.getDefaultPreferences();
        }
        catch (error) {
            console.error('Error getting user preferences:', error);
            return this.getDefaultPreferences();
        }
    }
    parsePreferences(prefs) {
        return {
            pushEnabled: prefs.pushEnabled ?? true,
            emailEnabled: prefs.emailEnabled ?? true,
            smsEnabled: prefs.smsEnabled ?? false,
            categories: prefs.categories || this.getDefaultPreferences().categories
        };
    }
    getDefaultPreferences() {
        return {
            pushEnabled: true,
            emailEnabled: true,
            smsEnabled: false,
            categories: {
                orders: true,
                delivery: true,
                payments: true,
                chat: true,
                artisan: true,
                marketing: false,
                system: true
            }
        };
    }
    async createDefaultPreferences(userId) {
        const defaultPrefs = this.getDefaultPreferences();
        // Since notification preferences model doesn't exist, just return defaults
        console.log('Creating default preferences for user:', userId);
        return defaultPrefs;
    }
    async updateUserPreferences(userId, preferences) {
        try {
            // Since notification preferences model doesn't exist, just log the update
            console.log('Updating user preferences:', userId, preferences);
            const updatedPrefs = { ...this.getDefaultPreferences(), ...preferences };
            return updatedPrefs;
        }
        catch (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
    }
    async getUserNotifications(userId, options = {}) {
        try {
            const { limit = 20, offset = 0, unreadOnly = false } = options;
            // Since notification model doesn't exist, return empty array
            console.log('Getting notifications for user:', userId, options);
            return {
                notifications: [],
                total: 0,
                unreadCount: 0,
                hasMore: false
            };
        }
        catch (error) {
            console.error('Error getting user notifications:', error);
            throw error;
        }
    }
    async markAsRead(notificationId, userId) {
        try {
            console.log('Marking notification as read:', notificationId, userId);
            return { count: 1 };
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }
    async markAllAsRead(userId) {
        try {
            console.log('Marking all notifications as read for user:', userId);
            return { count: 0 };
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }
    async deleteNotification(notificationId, userId) {
        try {
            console.log('Deleting notification:', notificationId, userId);
            return { count: 1 };
        }
        catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }
    // Specific notification methods for different types
    async sendOrderNotification(userId, orderId, status, message) {
        const title = `Order ${status}`;
        const defaultMessage = `Your order #${orderId} is now ${status.toLowerCase()}`;
        return this.createNotification({
            userId,
            type: 'order',
            title,
            message: message || defaultMessage,
            data: { orderId, status }
        });
    }
    async sendDeliveryNotification(userId, deliveryId, status, location) {
        const title = `Delivery Update`;
        const message = `Your delivery is ${status.toLowerCase()}`;
        return this.createNotification({
            userId,
            type: 'delivery',
            title,
            message,
            data: { deliveryId, status, location }
        });
    }
    async sendPaymentNotification(userId, paymentId, status, amount) {
        const title = `Payment ${status}`;
        const message = `Payment of ₦${amount.toLocaleString()} is ${status.toLowerCase()}`;
        return this.createNotification({
            userId,
            type: 'payment',
            title,
            message,
            data: { paymentId, status, amount }
        });
    }
    async sendChatNotification(userId, senderId, senderName, preview) {
        const title = `New message from ${senderName}`;
        const message = preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
        return this.createNotification({
            userId,
            type: 'chat',
            title,
            message,
            data: { senderId, senderName }
        });
    }
    async sendArtisanNotification(userId, type, data) {
        let title = '';
        let message = '';
        switch (type) {
            case 'request':
                title = 'New Service Request';
                message = `You have a new service request: ${data.serviceType}`;
                break;
            case 'appointment':
                title = 'Appointment Reminder';
                message = `You have an appointment scheduled for ${data.scheduledTime}`;
                break;
            case 'payment':
                title = 'Payment Released';
                message = `Payment of ₦${data.amount?.toLocaleString()} has been released`;
                break;
        }
        return this.createNotification({
            userId,
            type: 'artisan',
            title,
            message,
            data
        });
    }
    async sendSystemNotification(userId, title, message, data) {
        return this.createNotification({
            userId,
            type: 'system',
            title,
            message,
            data
        });
    }
    async sendBulkSystemNotification(userIds, title, message, data) {
        const notifications = userIds.map(userId => ({
            userId,
            type: 'system',
            title,
            message,
            data
        }));
        return this.sendBulkNotifications(notifications);
    }
    generateId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Analytics methods
    async getNotificationStats(dateRange) {
        try {
            // Since notification model doesn't exist, return zero stats
            console.log('Getting notification stats:', dateRange);
            return {
                total: 0,
                unread: 0,
                byType: {}
            };
        }
        catch (error) {
            console.error('Error getting notification stats:', error);
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
// Singleton instance
const notificationService = new NotificationService();
exports.notificationService = notificationService;
//# sourceMappingURL=notificationService.js.map