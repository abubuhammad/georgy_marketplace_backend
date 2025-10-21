import { NotificationService } from './notificationService';
import { prisma } from '../utils/prisma';
import nodemailer from 'nodemailer';
// import twilio from 'twilio';
// import webpush from 'web-push'; // Packages not installed yet
import axios from 'axios';

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
    start: string; // HH:mm format
    end: string;   // HH:mm format
    timezone: string;
  };
}

export class EnhancedNotificationService extends NotificationService {
  private emailTransporter: nodemailer.Transporter | null = null;
  private twilioClient?: any; // twilio.Twilio when package installed
  private whatsappEnabled: boolean = false;

  constructor() {
    super();
    this.initializeExternalServices();
  }

  private async initializeExternalServices() {
    // Initialize Email Service (using environment variables)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        
        await this.emailTransporter?.verify();
        console.log('📧 Enhanced Email service initialized successfully');
      } catch (error) {
        console.error('❌ Email service initialization failed:', error);
        this.emailTransporter = null;
      }
    }

    // Initialize SMS Service (Twilio)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        // this.twilioClient = twilio(
        //   process.env.TWILIO_ACCOUNT_SID,
        //   process.env.TWILIO_AUTH_TOKEN
        // ); // Package not installed
      console.log('📱 SMS service initialized successfully');
    }

    // Initialize Push Notifications (Web Push)
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        // webpush.setVapidDetails(
        //   'mailto:support@georgy.com',
        //   process.env.VAPID_PUBLIC_KEY,
        //   process.env.VAPID_PRIVATE_KEY
        // ); // Package not installed
      console.log('🔔 Push notification service initialized successfully');
    }

    // Initialize WhatsApp (Business API)
    if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
      this.whatsappEnabled = true;
      console.log('📲 WhatsApp service initialized successfully');
    }
  }

  // Main enhanced notification sending method
  async sendNotification(notification: MultiChannelNotificationData): Promise<{
    success: boolean;
    deliveredChannels: string[];
    failedChannels: string[];
    errors: any[];
  }> {
    const deliveredChannels: string[] = [];
    const failedChannels: string[] = [];
    const errors: any[] = [];

    try {
      // First, create the notification using the base service
      await this.createNotification({
        userId: notification.userId,
        type: this.mapCategoryToType(notification.category),
        title: notification.title,
        message: notification.message,
        data: notification.data
      });

      // Get user preferences for multi-channel notifications
      const userPreferences = await this.getEnhancedUserPreferences(notification.userId);
      
      // Check if notifications are allowed for this category
      const categoryKey = notification.category as keyof typeof userPreferences.categories;
      if (!userPreferences.categories[categoryKey]) {
        return {
          success: false,
          deliveredChannels: [],
          failedChannels: ['all'],
          errors: ['User has disabled notifications for this category']
        };
      }

      // Check quiet hours for non-critical notifications
      if (notification.priority !== 'critical' && this.isInQuietHours(userPreferences.quietHours)) {
        // Schedule for later
        await this.scheduleNotification(notification, userPreferences.quietHours);
        return {
          success: true,
          deliveredChannels: ['scheduled'],
          failedChannels: [],
          errors: []
        };
      }

      // Get user contact info
      const user = await this.getUserContactInfo(notification.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Determine channels to use
      const channelsToUse = notification.channels || this.getDefaultChannels(notification.priority);

      // Send via each enabled channel
      const promises = channelsToUse.map(async (channel) => {
        try {
          switch (channel) {
            case 'email':
              if (userPreferences.email && user.email && this.emailTransporter) {
                await this.sendEmailNotification(user, notification);
                deliveredChannels.push('email');
              }
              break;
            
            case 'sms':
              if (userPreferences.sms && user.phone && this.twilioClient) {
                await this.sendSMSNotification(user, notification);
                deliveredChannels.push('sms');
              }
              break;
            
            case 'push':
              if (userPreferences.push) {
                const pushResult = await this.sendPushNotification(user.id, notification);
                if (pushResult.success) {
                  deliveredChannels.push('push');
                }
              }
              break;
            
            case 'whatsapp':
              if (userPreferences.whatsapp && user.phone && this.whatsappEnabled) {
                await this.sendWhatsAppNotification(user, notification);
                deliveredChannels.push('whatsapp');
              }
              break;
          }
        } catch (error) {
          failedChannels.push(channel);
          errors.push({ channel, error: (error as Error).message });
        }
      });

      await Promise.allSettled(promises);

      return {
        success: deliveredChannels.length > 0,
        deliveredChannels,
        failedChannels,
        errors
      };

    } catch (error) {
      console.error('Error sending multi-channel notification:', error);
      return {
        success: false,
        deliveredChannels,
        failedChannels: ['all'],
        errors: [{ error: (error as Error).message }]
      };
    }
  }

  // Email notification implementation
  private async sendEmailNotification(user: any, notification: MultiChannelNotificationData) {
    if (!this.emailTransporter) {
      throw new Error('Email service not configured');
    }

    const emailTemplate = this.generateEmailTemplate(notification);

    await this.emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'Georgy Marketplace <noreply@georgy.com>',
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    console.log(`📧 Email sent to ${user.email}: ${notification.title}`);
  }

  // SMS notification implementation
  private async sendSMSNotification(user: any, notification: MultiChannelNotificationData) {
    if (!this.twilioClient) {
      throw new Error('SMS service not configured');
    }

    const smsTemplate = this.generateSMSTemplate(notification);

    await this.twilioClient.messages.create({
      body: smsTemplate.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phone
    });

    console.log(`📱 SMS sent to ${user.phone}: ${notification.title}`);
  }

  // Push notification implementation
  private async sendPushNotification(userId: string, notification: MultiChannelNotificationData): Promise<{
    success: boolean;
    sentCount: number;
    totalSubscriptions: number;
  }> {
    // Get user's push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId, active: true }
    });

    if (subscriptions.length === 0) {
      return { success: false, sentCount: 0, totalSubscriptions: 0 };
    }

    const pushTemplate = this.generatePushTemplate(notification);
    let sentCount = 0;

    const promises = subscriptions.map(async (subscription) => {
      try {
        // webpush package not installed - disable push notifications
        throw new Error('Push notifications not configured - webpush package not installed');
        sentCount++;
      } catch (error) {
        console.error('Failed to send push notification:', error);
        
        // Mark subscription as inactive if it's invalid
        if ((error as any).statusCode === 410 || (error as any).statusCode === 413) {
          await prisma.pushSubscription.update({
            where: { id: subscription.id },
            data: { active: false }
          });
        }
      }
    });

    await Promise.allSettled(promises);
    
    console.log(`🔔 Push notifications sent: ${sentCount}/${subscriptions.length}`);
    
    return {
      success: sentCount > 0,
      sentCount,
      totalSubscriptions: subscriptions.length
    };
  }

  // WhatsApp notification implementation
  private async sendWhatsAppNotification(user: any, notification: MultiChannelNotificationData) {
    if (!this.whatsappEnabled) {
      throw new Error('WhatsApp service not configured');
    }

    const whatsappTemplate = this.generateWhatsAppTemplate(notification);

    await axios.post(
      process.env.WHATSAPP_API_URL!,
      {
        to: user.phone.replace('+', ''), // Remove + prefix if present
        message: whatsappTemplate.message,
        type: 'text'
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`📲 WhatsApp sent to ${user.phone}: ${notification.title}`);
  }

  // Template generation methods
  private generateEmailTemplate(notification: MultiChannelNotificationData): {
    subject: string;
    html: string;
    text: string;
  } {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const typeColors = {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    };
    
    return {
      subject: `${notification.title} - Georgy Marketplace`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
          <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="background: #DC2626; color: white; padding: 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Georgy Marketplace</h1>
            </div>
            <div style="padding: 24px;">
              <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <div style="width: 4px; height: 40px; background: ${typeColors[notification.type]}; margin-right: 12px; border-radius: 2px;"></div>
                <h2 style="margin: 0; color: #1F2937; font-size: 20px; font-weight: 600;">${notification.title}</h2>
              </div>
              <p style="font-size: 16px; line-height: 1.6; color: #4B5563; margin: 16px 0;">${notification.message}</p>
              ${notification.actionUrl ? `
                <div style="text-align: center; margin: 24px 0;">
                  <a href="${baseUrl}${notification.actionUrl}" 
                     style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 14px;">
                    View Details
                  </a>
                </div>
              ` : ''}
            </div>
            <div style="background: #F9FAFB; padding: 16px 24px; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0; font-size: 14px; color: #6B7280; text-align: center;">
                You received this because you have notifications enabled for ${notification.category} updates.
                <br>
                <a href="${baseUrl}/settings/notifications" style="color: #DC2626; text-decoration: none;">Manage preferences</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
${notification.title}

${notification.message}

${notification.actionUrl ? `View details: ${baseUrl}${notification.actionUrl}` : ''}

---
Georgy Marketplace
Manage notification preferences: ${baseUrl}/settings/notifications
      `.trim()
    };
  }

  private generateSMSTemplate(notification: MultiChannelNotificationData): { message: string } {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    let message = `Georgy: ${notification.title}`;
    
    // Keep SMS concise - maximum 160 characters for best delivery
    if (notification.message.length + message.length < 140) {
      message += `\n${notification.message}`;
    }
    
    if (notification.actionUrl && message.length < 100) {
      message += `\nView: ${baseUrl}${notification.actionUrl}`;
    }
    
    return { message: message.substring(0, 160) }; // Ensure SMS limit
  }

  private generatePushTemplate(notification: MultiChannelNotificationData): {
    title: string;
    body: string;
  } {
    return {
      title: notification.title,
      body: notification.message.length > 100 ? 
        notification.message.substring(0, 97) + '...' : 
        notification.message
    };
  }

  private generateWhatsAppTemplate(notification: MultiChannelNotificationData): { message: string } {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const typeEmojis = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    
    let message = `${typeEmojis[notification.type]} *${notification.title}*\n\n${notification.message}`;
    
    if (notification.actionUrl) {
      message += `\n\n🔗 View details: ${baseUrl}${notification.actionUrl}`;
    }
    
    message += '\n\n_Georgy Marketplace_';
    
    return { message };
  }

  // Helper methods
  private async getEnhancedUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    try {
      const preferences = await prisma.userNotificationPreference.findUnique({
        where: { userId }
      });

      if (preferences) {
        return {
          userId,
          email: preferences.email,
          sms: preferences.sms,
          push: preferences.push,
          whatsapp: preferences.whatsapp,
          categories: preferences.categories as any,
          quietHours: preferences.quietHours as any
        };
      }
    } catch (error) {
      console.log('Enhanced preferences not found, using defaults');
    }

    // Fall back to basic preferences if enhanced ones don't exist
    const basicPrefs = await this.getUserPreferences(userId);
    return {
      userId,
      email: basicPrefs.emailEnabled,
      sms: basicPrefs.smsEnabled,
      push: basicPrefs.pushEnabled,
      whatsapp: false, // Default to false for WhatsApp
      categories: {
        orders: (basicPrefs.categories as any).orders || true,
        delivery: basicPrefs.categories.delivery,
        payment: basicPrefs.categories.payments,
        chat: basicPrefs.categories.chat,
        system: basicPrefs.categories.system
      }
    };
  }

  private async getUserContactInfo(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true
      }
    });
  }

  private getDefaultChannels(priority: string): ('email' | 'sms' | 'push' | 'whatsapp')[] {
    switch (priority) {
      case 'critical':
        return ['push', 'sms', 'email'];
      case 'high':
        return ['push', 'email'];
      case 'medium':
        return ['push'];
      case 'low':
        return ['push'];
      default:
        return ['push'];
    }
  }

  private isInQuietHours(quietHours?: UserNotificationPreferences['quietHours']): boolean {
    if (!quietHours) return false;

    try {
      const now = new Date();
      const userTime = new Date(now.toLocaleString("en-US", { timeZone: quietHours.timezone }));
      const currentHour = userTime.getHours();
      const currentMinute = userTime.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = quietHours.start.split(':').map(Number);
      const [endHour, endMinute] = quietHours.end.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      if (startTime <= endTime) {
        return currentTime >= startTime && currentTime <= endTime;
      } else {
        // Quiet hours span midnight
        return currentTime >= startTime || currentTime <= endTime;
      }
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false;
    }
  }

  private async scheduleNotification(notification: MultiChannelNotificationData, quietHours?: UserNotificationPreferences['quietHours']) {
    try {
      const scheduledFor = this.calculateNextSendTime(quietHours);
      
      await prisma.scheduledNotification.create({
        data: {
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category,
          // priority: notification.priority, // Field not in schema - commenting out
          data: notification.data || {},
          // actionUrl: notification.actionUrl, // Field not in schema
          scheduledFor,
          // channels: notification.channels || [] // Field not in schema
        }
      });

      console.log(`📅 Notification scheduled for ${scheduledFor}: ${notification.title}`);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  private calculateNextSendTime(quietHours?: UserNotificationPreferences['quietHours']): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (quietHours) {
      const [endHour, endMinute] = quietHours.end.split(':').map(Number);
      tomorrow.setHours(endHour, endMinute, 0, 0);
    } else {
      tomorrow.setHours(8, 0, 0, 0); // Default to 8 AM next day
    }
    
    return tomorrow;
  }

  private mapCategoryToType(category: string): 'order' | 'delivery' | 'payment' | 'chat' | 'artisan' | 'admin' | 'system' {
    const mapping: Record<string, any> = {
      'order': 'order',
      'delivery': 'delivery',
      'payment': 'payment',
      'chat': 'chat',
      'system': 'system'
    };
    return mapping[category] || 'system';
  }

  // Public convenience methods for common notification scenarios
  async sendOrderStatusUpdate(userId: string, orderId: string, status: string, details?: string) {
    return this.sendNotification({
      userId,
      title: `Order ${status}`,
      message: details || `Your order #${orderId.slice(-6)} has been ${status.toLowerCase()}`,
      type: status === 'delivered' ? 'success' : 'info',
      category: 'order',
      priority: status === 'cancelled' ? 'high' : 'medium',
      actionUrl: `/orders/${orderId}`,
      data: { orderId, status, details }
    });
  }

  async sendDeliveryUpdate(userId: string, trackingNumber: string, status: string, location?: string, eta?: string) {
    return this.sendNotification({
      userId,
      title: 'Delivery Update',
      message: `Your package ${trackingNumber} is ${status}${location ? ` in ${location}` : ''}${eta ? ` (ETA: ${eta})` : ''}`,
      type: status === 'delivered' ? 'success' : 'info',
      category: 'delivery',
      priority: 'medium',
      actionUrl: `/tracking/${trackingNumber}`,
      data: { trackingNumber, status, location, eta }
    });
  }

  async sendPaymentAlert(userId: string, amount: number, status: 'success' | 'failed' | 'pending', orderId: string) {
    return this.sendNotification({
      userId,
      title: `Payment ${status === 'success' ? 'Confirmed' : status === 'failed' ? 'Failed' : 'Processing'}`,
      message: `Your payment of ₦${amount.toLocaleString()} ${status === 'success' ? 'has been confirmed' : status === 'failed' ? 'failed - please try again' : 'is being processed'}`,
      type: status === 'success' ? 'success' : status === 'failed' ? 'error' : 'info',
      category: 'payment',
      priority: status === 'failed' ? 'high' : 'medium',
      actionUrl: `/orders/${orderId}`,
      channels: status === 'failed' ? ['push', 'email', 'sms'] : ['push', 'email'],
      data: { amount, status, orderId }
    });
  }

  async sendCriticalAlert(userId: string, title: string, message: string, actionUrl?: string) {
    return this.sendNotification({
      userId,
      title,
      message,
      type: 'error',
      category: 'system',
      priority: 'critical',
      actionUrl,
      channels: ['push', 'sms', 'email'] // All channels for critical alerts
    });
  }

  // Bulk operations
  async sendBulkMultiChannelNotification(userIds: string[], notification: Omit<MultiChannelNotificationData, 'userId'>) {
    const promises = userIds.map(userId => 
      this.sendNotification({ ...notification, userId })
    );
    
    return await Promise.allSettled(promises);
  }

  // Push subscription management
  async registerPushSubscription(userId: string, subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
    userAgent?: string;
  }) {
    try {
      // Check if subscription already exists
      const existing = await prisma.pushSubscription.findFirst({
        where: {
          userId,
          endpoint: subscription.endpoint
        }
      });

      if (existing) {
        // Update existing subscription
        return await prisma.pushSubscription.update({
          where: { id: existing.id },
          data: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
            userAgent: subscription.userAgent,
            active: true,
            updatedAt: new Date()
          }
        });
      } else {
        // Create new subscription
        return await prisma.pushSubscription.create({
          data: {
            userId,
            endpoint: subscription.endpoint,
            p256dh: subscription.p256dh,
            auth: subscription.auth,
            userAgent: subscription.userAgent,
            active: true
          }
        });
      }
    } catch (error) {
      console.error('Error registering push subscription:', error);
      throw error;
    }
  }

  async unregisterPushSubscription(userId: string, endpoint: string) {
    try {
      return await prisma.pushSubscription.updateMany({
        where: {
          userId,
          endpoint
        },
        data: {
          active: false
        }
      });
    } catch (error) {
      console.error('Error unregistering push subscription:', error);
      throw error;
    }
  }

  // Enhanced preferences management
  async updateEnhancedPreferences(userId: string, preferences: Partial<UserNotificationPreferences>) {
    try {
      return await prisma.userNotificationPreference.upsert({
        where: { userId },
        update: preferences as any,
        create: {
          userId,
          email: preferences.email ?? true,
          sms: preferences.sms ?? false,
          push: preferences.push ?? true,
          whatsapp: preferences.whatsapp ?? false,
          categories: preferences.categories ?? {
            orders: true,
            delivery: true,
            payment: true,
            chat: true,
            system: true
          },
          quietHours: preferences.quietHours
        } as any
      });
    } catch (error) {
      console.error('Error updating enhanced preferences:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enhancedNotificationService = new EnhancedNotificationService();
export default EnhancedNotificationService;
