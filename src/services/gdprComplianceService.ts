import { PrismaClient } from '@prisma/client';
import { logger, Logger } from '../utils/logger';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

interface DataExportRequest {
  id?: string;
  userId: string;
  status: DataExportStatus;
  requestType: ExportRequestType;
  downloadUrl?: string;
  expiresAt?: Date;
  requestedAt?: Date;
  completedAt?: Date;
}

interface DataDeletionRequest {
  id?: string;
  userId: string;
  status: DeletionStatus;
  scheduledDate?: Date;
  completedAt?: Date;
  reason?: string;
  verificationToken?: string;
  deletionMethod: DeletionMethod;
}

interface ConsentRecord {
  id?: string;
  userId: string;
  consentType: ConsentType;
  consentGiven: boolean;
  consentDate: Date;
  ipAddress?: string;
  userAgent?: string;
  consentSource?: string;
  withdrawalDate?: Date;
  legalBasis?: LegalBasis;
  version?: string;
  consentMethod?: string;
}

interface DataProcessingActivity {
  id?: string;
  activityName: string;
  purpose: string;
  legalBasis: LegalBasis;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  transfers: string[];
  retentionPeriod: number;
  securityMeasures: string[];
  isActive: boolean;
}

interface PrivacySettings {
  id?: string;
  userId: string;
  profileVisible: boolean;
  emailVisible: boolean;
  phoneVisible: boolean;
  locationVisible: boolean;
  activityVisible: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  thirdPartySharing: boolean;
  dataRetentionConsent: boolean;
  updatedAt: Date;
}

enum DataExportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

enum ExportRequestType {
  FULL_EXPORT = 'full_export',
  PARTIAL_EXPORT = 'partial_export',
  CONSENT_HISTORY = 'consent_history',
  TRANSACTION_DATA = 'transaction_data'
}

enum DeletionStatus {
  REQUESTED = 'requested',
  VERIFIED = 'verified',
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

enum DeletionMethod {
  SOFT_DELETE = 'soft_delete',
  HARD_DELETE = 'hard_delete',
  ANONYMIZATION = 'anonymization',
  PSEUDONYMIZATION = 'pseudonymization'
}

enum ConsentType {
  DATA_PROCESSING = 'data_processing',
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  COOKIES = 'cookies',
  PROFILING = 'profiling'
}

enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests'
}

enum VisibilityLevel {
  PUBLIC = 'public',
  USERS_ONLY = 'users_only',
  PRIVATE = 'private'
}

enum RetentionPreference {
  MINIMUM = 'minimum',
  STANDARD = 'standard',
  EXTENDED = 'extended'
}

enum CommunicationPreference {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app'
}

export class GDPRComplianceService {
  private prisma: PrismaClient;
  private logger: Logger;
  private exportPath: string;

  constructor(prisma: PrismaClient, logger: Logger) {
    this.prisma = prisma;
    this.logger = logger;
    this.exportPath = path.join(process.cwd(), 'temp', 'exports');
  }

  /**
   * Request data export for user
   */
  async requestDataExport(
    userId: string, 
    requestType: ExportRequestType = ExportRequestType.FULL_EXPORT
  ): Promise<DataExportRequest> {
    try {
      // Check for existing pending requests using GDPRRequest model
      const existingRequest = await this.prisma.gDPRRequest.findFirst({
        where: {
          userId,
          requestType: 'export',
          status: {
            in: ['pending', 'processing']
          }
        }
      });

      if (existingRequest) {
        throw new Error('Data export request already in progress');
      }

      const exportRequest = await this.prisma.gDPRRequest.create({
        data: {
          userId,
          requestType: 'export',
          status: 'pending',
          requestData: JSON.stringify({ requestType })
        }
      });

      // Process export asynchronously
      this.processDataExport(exportRequest.id).catch(error => {
        logger.error('Error processing data export:', error);
      });

      logger.info(`Data export requested for user: ${userId}`);
      
      // Transform to expected interface
      return {
        id: exportRequest.id,
        userId: exportRequest.userId,
        status: DataExportStatus.PENDING,
        requestType,
        requestedAt: exportRequest.createdAt
      } as DataExportRequest;
    } catch (error) {
      logger.error('Error requesting data export:', error);
      throw new Error('Failed to request data export');
    }
  }

  /**
   * Process data export
   */
  private async processDataExport(requestId: string): Promise<void> {
    try {
      await this.prisma.gDPRRequest.update({
        where: { id: requestId },
        data: { status: 'processing' }
      });

      const request = await this.prisma.gDPRRequest.findUnique({
        where: { id: requestId }
      });

      if (!request) {
        throw new Error('Export request not found');
      }

      const requestData = request.requestData ? JSON.parse(request.requestData) : {};
      const userData = await this.collectUserData(request.userId, requestData.requestType);
      const exportFile = await this.generateExportFile(userData, request.userId);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      await this.prisma.gDPRRequest.update({
        where: { id: requestId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          expiresAt,
          notes: `Export file: ${exportFile}`
        }
      });

      // Also create a DataExportRequest record for tracking download/expiry
      await this.prisma.dataExportRequest.create({
        data: {
          userId: request.userId,
          requestType: (JSON.parse(request.requestData || '{}').requestType) || 'full_export',
          status: 'completed',
          dataTypes: JSON.stringify(['profile','orders','consents']),
          format: 'json',
          downloadUrl: exportFile,
          expiresAt
        }
      });

      logger.info(`Data export completed for request: ${requestId}`);
    } catch (error) {
      await this.prisma.gDPRRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' }
      });
      throw error;
    }
  }

  /**
   * Collect user data for export
   */
  private async collectUserData(userId: string, requestType: ExportRequestType): Promise<any> {
    const userData: any = {
      userId,
      exportDate: new Date().toISOString(),
      requestType
    };

    if (requestType === ExportRequestType.FULL_EXPORT || requestType === ExportRequestType.PARTIAL_EXPORT) {
      // User profile data
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });
      userData.profile = user;

      // Orders and transactions
      const orders = await this.prisma.order.findMany({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      });
      userData.orders = orders;

      // Reviews and ratings
      const reviews = await this.prisma.review.findMany({
        where: { userId }
      });
      userData.reviews = reviews;

      // Messages and communications
      const messages = await this.prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId },
            { recipientId: userId }
          ]
        }
      });
      userData.messages = messages;
    }

    if (requestType === ExportRequestType.CONSENT_HISTORY || requestType === ExportRequestType.FULL_EXPORT) {
      const consents = await this.prisma.userConsent.findMany({
        where: { userId }
      });
      userData.consents = consents;
    }

    return userData;
  }

  /**
   * Generate export file
   */
  private async generateExportFile(userData: any, userId: string): Promise<string> {
    try {
      await fs.mkdir(this.exportPath, { recursive: true });
      
      const filename = `user_data_export_${userId}_${Date.now()}.json`;
      const filepath = path.join(this.exportPath, filename);
      
      await fs.writeFile(filepath, JSON.stringify(userData, null, 2));
      
      return `/api/exports/${filename}`;
    } catch (error) {
      this.logger.error('Error generating export file:', error);
      throw new Error('Failed to generate export file');
    }
  }

  /**
   * Request data deletion
   */
  async requestDataDeletion(
    userId: string, 
    reason: string,
    deletionMethod: DeletionMethod = DeletionMethod.SOFT_DELETE
  ): Promise<DataDeletionRequest> {
    try {
      const verificationToken = crypto.randomBytes(32).toString('hex');
      
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 30); // 30-day grace period

      const deletionRequest = await this.prisma.dataDeletionRequest.create({
        data: {
          userId,
          status: DeletionStatus.REQUESTED,
          scheduledDate,
          reason,
          verificationToken,
          deletionMethod
        }
      });

      // Send verification email (implementation depends on email service)
      // await this.sendDeletionVerificationEmail(userId, verificationToken);

      this.logger.info(`Data deletion requested for user: ${userId}`);
      return deletionRequest as any;
    } catch (error) {
      this.logger.error('Error requesting data deletion:', error);
      throw new Error('Failed to request data deletion');
    }
  }

  /**
   * Verify data deletion request
   */
  async verifyDataDeletion(token: string): Promise<boolean> {
    try {
      const request = await this.prisma.dataDeletionRequest.findFirst({
        where: {
          verificationToken: token,
          status: DeletionStatus.REQUESTED
        }
      });

      if (!request) {
        return false;
      }

      await this.prisma.dataDeletionRequest.update({
        where: { id: request.id },
        data: { status: DeletionStatus.VERIFIED }
      });

      this.logger.info(`Data deletion verified for request: ${request.id}`);
      return true;
    } catch (error) {
      this.logger.error('Error verifying data deletion:', error);
      return false;
    }
  }

  /**
   * Process scheduled deletions
   */
  async processScheduledDeletions(): Promise<void> {
    try {
      const scheduledDeletions = await this.prisma.dataDeletionRequest.findMany({
        where: {
          status: DeletionStatus.VERIFIED,
          scheduledDate: {
            lte: new Date()
          }
        }
      });

      for (const deletion of scheduledDeletions) {
        await this.executeDeletion(deletion as any);
      }

      this.logger.info(`Processed ${scheduledDeletions.length} scheduled deletions`);
    } catch (error) {
      this.logger.error('Error processing scheduled deletions:', error);
    }
  }

  /**
   * Execute data deletion
   */
  private async executeDeletion(request: DataDeletionRequest): Promise<void> {
    try {
      await this.prisma.dataDeletionRequest.update({
        where: { id: request.id },
        data: { status: DeletionStatus.IN_PROGRESS }
      });

      const dataRetained: string[] = [];

      switch (request.deletionMethod) {
        case DeletionMethod.HARD_DELETE:
          await this.hardDeleteUserData(request.userId, dataRetained);
          break;
        case DeletionMethod.SOFT_DELETE:
          await this.softDeleteUserData(request.userId, dataRetained);
          break;
        case DeletionMethod.ANONYMIZATION:
          await this.anonymizeUserData(request.userId, dataRetained);
          break;
        case DeletionMethod.PSEUDONYMIZATION:
          await this.pseudonymizeUserData(request.userId, dataRetained);
          break;
      }

      await this.prisma.dataDeletionRequest.update({
        where: { id: request.id },
        data: {
          status: DeletionStatus.COMPLETED,
          completedAt: new Date()
        }
      });

      this.logger.info(`Data deletion completed for user: ${request.userId}`);
    } catch (error) {
      await this.prisma.dataDeletionRequest.update({
        where: { id: request.id },
        data: { status: DeletionStatus.FAILED }
      });
      throw error;
    }
  }

  /**
   * Hard delete user data
   */
  private async hardDeleteUserData(userId: string, dataRetained: string[]): Promise<void> {
    // Delete user-related data while preserving necessary business records
    const preservedTables = ['orders', 'payments', 'reviews']; // Keep for legal/business purposes
    
    // Delete personal data but keep transaction records
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${Date.now()}@example.com`,
        firstName: '[DELETED]',
        lastName: '[DELETED]',
        phone: null,
        avatar: null,
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    dataRetained.push(...preservedTables);
  }

  /**
   * Soft delete user data
   */
  private async softDeleteUserData(userId: string, dataRetained: string[]): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        email: `deleted_${Date.now()}@example.com`
      }
    });

    dataRetained.push('all data marked as deleted');
  }

  /**
   * Anonymize user data
   */
  private async anonymizeUserData(userId: string, dataRetained: string[]): Promise<void> {
    const anonymousId = `anon_${crypto.randomBytes(16).toString('hex')}`;
    
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `${anonymousId}@anonymous.com`,
        firstName: 'Anonymous',
        lastName: 'User',
        phone: null,
        avatar: null
      }
    });

    dataRetained.push('anonymized transaction data', 'anonymized reviews');
  }

  /**
   * Pseudonymize user data
   */
  private async pseudonymizeUserData(userId: string, dataRetained: string[]): Promise<void> {
    const pseudoId = `pseudo_${crypto.randomBytes(16).toString('hex')}`;
    
    // Replace identifiers with pseudonyms
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: `${pseudoId}@pseudo.com`,
        firstName: `User${pseudoId.slice(-8)}`,
        lastName: 'Pseudonym',
        phone: null
      }
    });

    dataRetained.push('pseudonymized data for analytics');
  }

  /**
   * Record consent
   */
  async recordConsent(consent: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord> {
    try {
      const consentRecord = await this.prisma.consentRecord.create({
        data: consent as any
      });

      this.logger.info(`Consent recorded: ${consent.userId} - ${consent.consentType}`);
      return consentRecord as ConsentRecord;
    } catch (error) {
      this.logger.error('Error recording consent:', error);
      throw new Error('Failed to record consent');
    }
  }

  /**
   * Withdraw consent
   */
  async withdrawConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    try {
      await this.prisma.consentRecord.updateMany({
        where: {
          userId,
          consentType,
          consentGiven: true
        },
        data: {
          consentGiven: false,
          withdrawnAt: new Date()
        }
      });

      this.logger.info(`Consent withdrawn: ${userId} - ${consentType}`);
      return true;
    } catch (error) {
      this.logger.error('Error withdrawing consent:', error);
      return false;
    }
  }

  /**
   * Get user privacy settings
   */
  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const settings = await this.prisma.userPrivacySettings.findUnique({
        where: { userId }
      });

      return settings as PrivacySettings;
    } catch (error) {
      this.logger.error('Error fetching privacy settings:', error);
      throw new Error('Failed to fetch privacy settings');
    }
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string, 
    settings: Partial<Omit<PrivacySettings, 'id' | 'userId' | 'lastUpdated'>>
  ): Promise<PrivacySettings> {
    try {
      const updatedSettings = await this.prisma.userPrivacySettings.upsert({
        where: { userId },
        update: {
          ...settings,
          updatedAt: new Date()
        },
        create: {
          userId,
          ...settings,
          updatedAt: new Date()
        } as any
      });

      this.logger.info(`Privacy settings updated for user: ${userId}`);
      return updatedSettings as PrivacySettings;
    } catch (error) {
      this.logger.error('Error updating privacy settings:', error);
      throw new Error('Failed to update privacy settings');
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(startDate: Date, endDate: Date): Promise<{
    period: { start: Date; end: Date };
    dataExports: number;
    dataDeletions: number;
    consentWithdrawals: number;
    activeConsents: number;
    complianceScore: number;
  }> {
    try {
      const [exports, deletions, withdrawals, activeConsents] = await Promise.all([
        this.prisma.dataExportRequest.count({
          where: {
            requestedAt: { gte: startDate, lte: endDate }
          }
        }),
        this.prisma.dataDeletionRequest.count({
          where: {
            requestDate: { gte: startDate, lte: endDate }
          }
        }),
        this.prisma.consentRecord.count({
          where: {
            withdrawnAt: { gte: startDate, lte: endDate }
          }
        }),
        this.prisma.consentRecord.count({
          where: {
            consentGiven: true,
            withdrawnAt: null
          }
        })
      ]);

      // Simple compliance score calculation (can be enhanced)
      const totalRequests = exports + deletions + withdrawals;
      const complianceScore = totalRequests > 0 ? Math.min(100, (totalRequests / 10) * 100) : 100;

      return {
        period: { start: startDate, end: endDate },
        dataExports: exports,
        dataDeletions: deletions,
        consentWithdrawals: withdrawals,
        activeConsents,
        complianceScore
      };
    } catch (error) {
      this.logger.error('Error generating compliance report:', error);
      throw new Error('Failed to generate compliance report');
    }
  }

  /**
   * Cleanup expired export files
   */
  async cleanupExpiredExports(): Promise<number> {
    try {
      const expiredExports = await this.prisma.dataExportRequest.findMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          status: DataExportStatus.COMPLETED
        }
      });

      let cleanedCount = 0;
      for (const exportRequest of expiredExports) {
        if (exportRequest.downloadUrl) {
          try {
            const filename = path.basename(exportRequest.downloadUrl);
            const filepath = path.join(this.exportPath, filename);
            await fs.unlink(filepath);
            cleanedCount++;
          } catch (error) {
            this.logger.warn(`Failed to delete export file: ${exportRequest.downloadUrl}`);
          }
        }

        await this.prisma.dataExportRequest.update({
          where: { id: exportRequest.id },
          data: { status: DataExportStatus.EXPIRED }
        });
      }

      this.logger.info(`Cleaned up ${cleanedCount} expired export files`);
      return cleanedCount;
    } catch (error) {
      this.logger.error('Error cleaning up expired exports:', error);
      return 0;
    }
  }
}

export {
  DataExportStatus,
  ExportRequestType,
  DeletionStatus,
  DeletionMethod,
  ConsentType,
  LegalBasis,
  VisibilityLevel,
  RetentionPreference,
  CommunicationPreference
};

export type {
  DataExportRequest,
  DataDeletionRequest,
  ConsentRecord,
  DataProcessingActivity,
  PrivacySettings
};
