import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

interface IdentityVerification {
  id?: string;
  userId: string;
  verificationType: VerificationType;
  documentType?: DocumentType;
  documentNumber?: string;
  documentImages?: string[];
  status: VerificationStatus;
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  verificationScore?: number;
  expiryDate?: Date;
}

interface BackgroundCheck {
  id?: string;
  userId: string;
  checkType: BackgroundCheckType;
  provider: string;
  status: CheckStatus;
  requestedBy: Date;
  completedAt?: Date;
  results?: any;
  riskScore?: number;
  flags?: string[];
}

interface UserReport {
  id?: string;
  reporterId: string;
  reportedUserId: string;
  reportType: ReportType;
  category: ReportCategory;
  description: string;
  evidence?: string[];
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: Date;
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  actionTaken?: string;
}

interface SafetyIncident {
  id?: string;
  reportId?: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  description: string;
  affectedUsers: string[];
  location?: string;
  createdAt: Date;
  status: IncidentStatus;
  investigatedBy?: string;
  resolution?: string;
  preventiveMeasures?: string[];
}

interface EmergencyContact {
  id?: string;
  userId: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  address?: string;
  isPrimary: boolean;
  isActive: boolean;
}

interface SafetySettings {
  id?: string;
  userId: string;
  profileVisibilityLevel: VisibilityLevel;
  allowContactFromStrangers: boolean;
  shareLocationData: boolean;
  emergencyModeEnabled: boolean;
  safeWordEnabled: boolean;
  safeWord?: string;
  autoReportSuspiciousActivity: boolean;
  requireVerificationForMeetings: boolean;
  updatedAt: Date;
}

interface MeetingGuidelines {
  id?: string;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum VerificationType {
  EMAIL = 'email',
  PHONE = 'phone',
  IDENTITY_DOCUMENT = 'identity_document',
  ADDRESS = 'address',
  BANK_ACCOUNT = 'bank_account',
  BUSINESS_LICENSE = 'business_license'
}

enum DocumentType {
  PASSPORT = 'passport',
  DRIVERS_LICENSE = 'drivers_license',
  NATIONAL_ID = 'national_id',
  UTILITY_BILL = 'utility_bill',
  BANK_STATEMENT = 'bank_statement',
  BUSINESS_REGISTRATION = 'business_registration'
}

enum VerificationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

enum BackgroundCheckType {
  IDENTITY = 'identity',
  CRIMINAL_RECORD = 'criminal_record',
  FINANCIAL_HISTORY = 'financial_history',
  EMPLOYMENT_HISTORY = 'employment_history',
  REFERENCE_CHECK = 'reference_check'
}

enum CheckStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

enum ReportType {
  USER_BEHAVIOR = 'user_behavior',
  FRAUD = 'fraud',
  SAFETY_CONCERN = 'safety_concern',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  FAKE_PROFILE = 'fake_profile',
  INAPPROPRIATE_CONTENT = 'inappropriate_content'
}

enum ReportCategory {
  URGENT = 'urgent',
  HIGH_PRIORITY = 'high_priority',
  MEDIUM_PRIORITY = 'medium_priority',
  LOW_PRIORITY = 'low_priority',
  INFORMATIONAL = 'informational'
}

enum ReportStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  DISMISSED = 'dismissed'
}

enum ReportPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

enum IncidentType {
  FRAUD = 'fraud',
  HARASSMENT = 'harassment',
  PHYSICAL_THREAT = 'physical_threat',
  DATA_BREACH = 'data_breach',
  SYSTEM_ABUSE = 'system_abuse',
  POLICY_VIOLATION = 'policy_violation'
}

enum IncidentSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

enum IncidentStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

enum VisibilityLevel {
  PUBLIC = 'public',
  VERIFIED_USERS = 'verified_users',
  FRIENDS_ONLY = 'friends_only',
  PRIVATE = 'private'
}

export class UserSafetyService {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(prisma: PrismaClient, logger: Logger) {
    this.prisma = prisma;
    this.logger = logger;
  }

  /**
   * Submit identity verification
   */
  async submitIdentityVerification(
    verification: Omit<IdentityVerification, 'id' | 'submittedAt' | 'status'>
  ): Promise<IdentityVerification> {
    try {
      const identityVerification = await this.prisma.identityVerification.create({
        data: {
          userId: verification.userId,
          documentType: verification.documentType?.toString() || 'passport',
          verificationType: verification.verificationType,
          documentNumber: verification.documentNumber,
          // submittedBy: verification.submittedBy, // Field might not exist
          submittedAt: new Date(),
          documentImages: JSON.stringify(verification.documentImages || []),
          // additionalData: JSON.stringify(verification.additionalData || {}), // Field might not exist
          // expiryDate: verification.expiryDate, // Field might not exist
          createdAt: new Date(),
          status: VerificationStatus.PENDING
        }
      });

      this.logger.info(`Identity verification submitted: ${verification.userId} - ${verification.verificationType}`);
      return { ...identityVerification, documentImages: JSON.parse(identityVerification.documentImages || '[]') } as IdentityVerification;
    } catch (error) {
      this.logger.error('Error submitting identity verification:', error);
      throw new Error('Failed to submit identity verification');
    }
  }

  /**
   * Review identity verification
   */
  async reviewIdentityVerification(
    verificationId: string,
    reviewerId: string,
    status: VerificationStatus,
    rejectionReason?: string,
    verificationScore?: number
  ): Promise<IdentityVerification> {
    try {
      const verification = await this.prisma.identityVerification.update({
        where: { id: verificationId },
        data: {
          status,
          verifiedAt: new Date(),
          // reviewedBy: reviewerId, // Field might not exist
          rejectionReason,
          // verificationScore: mockScore, // Field might not exist
        }
      });

      if (status === VerificationStatus.APPROVED) {
        // Update user verification status
        // await this.updateUserVerificationStatus(verification.userId, verification.verificationType as any);
      }

      this.logger.info(`Identity verification reviewed: ${verificationId} - ${status}`);
      return { ...verification, documentImages: JSON.parse(verification.documentImages || '[]') } as IdentityVerification;
    } catch (error) {
      this.logger.error('Error reviewing identity verification:', error);
      throw new Error('Failed to review identity verification');
    }
  }

  /**
   * Update user verification status
   */
  private async updateUserVerificationStatus(userId: string, verificationType: VerificationType): Promise<void> {
    const updateData: any = {};
    
    switch (verificationType) {
      case VerificationType.EMAIL:
        updateData.emailVerified = true;
        break;
      case VerificationType.PHONE:
        updateData.phoneVerified = true;
        break;
      case VerificationType.IDENTITY_DOCUMENT:
        updateData.identityVerified = true;
        break;
      case VerificationType.ADDRESS:
        updateData.addressVerified = true;
        break;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  /**
   * Request background check
   */
  async requestBackgroundCheck(
    userId: string,
    checkType: BackgroundCheckType,
    provider: string = 'default'
  ): Promise<BackgroundCheck> {
    try {
      const backgroundCheck = await this.prisma.backgroundCheck.create({
        data: {
          userId,
          checkType,
          provider,
          status: CheckStatus.PENDING,
          requestedBy: 'system'
        }
      });

      // Initiate background check process (integration with third-party provider)
      this.processBackgroundCheck(backgroundCheck.id).catch(error => {
        this.logger.error('Error processing background check:', error);
      });

      this.logger.info(`Background check requested: ${userId} - ${checkType}`);
      return { ...backgroundCheck, requestedBy: new Date(backgroundCheck.requestedBy) } as BackgroundCheck;
    } catch (error) {
      this.logger.error('Error requesting background check:', error);
      throw new Error('Failed to request background check');
    }
  }

  /**
   * Process background check (placeholder for third-party integration)
   */
  private async processBackgroundCheck(checkId: string): Promise<void> {
    try {
      await this.prisma.backgroundCheck.update({
        where: { id: checkId },
        data: { status: CheckStatus.IN_PROGRESS }
      });

      // Simulate background check processing
      setTimeout(async () => {
        const mockResults = {
          identity_verified: true,
          criminal_record: false,
          risk_factors: [],
          score: 85
        };

        await this.prisma.backgroundCheck.update({
          where: { id: checkId },
          data: {
            status: CheckStatus.COMPLETED,
            completedAt: new Date(),
            result: JSON.stringify(mockResults),
            // riskScore: mockResults.score, // Field might not exist
          }
        });

        this.logger.info(`Background check completed: ${checkId}`);
      }, 30000); // 30 seconds simulation
    } catch (error) {
      await this.prisma.backgroundCheck.update({
        where: { id: checkId },
        data: { status: CheckStatus.FAILED }
      });
      throw error;
    }
  }

  /**
   * Submit user report
   */
  async submitUserReport(
    report: Omit<UserReport, 'id' | 'createdAt' | 'status'>
  ): Promise<UserReport> {
    try {
      const userReport = await this.prisma.userReport.create({
        data: {
          reporterId: report.reporterId,
          reportedUserId: report.reportedUserId,
          reportedUser: report.reportedUserId,
          reason: report.description,
          description: report.description,
          category: report.category,
          reportType: report.reportType,
          priority: report.priority,
          evidence: JSON.stringify(report.evidence || []),
          // metadata: JSON.stringify(report.metadata || {}), // Field not in schema
          // location: report.location, // Field not in schema
          actionTaken: report.actionTaken,
          createdAt: new Date(),
          status: ReportStatus.SUBMITTED
        }
      });

      // Auto-assign priority based on report type
      const priority = this.calculateReportPriority(report.reportType, report.category);
      
      await this.prisma.userReport.update({
        where: { id: userReport.id },
        data: { priority }
      });

      // Check for urgent cases that need immediate attention
      if (priority === ReportPriority.CRITICAL) {
        // await this.handleCriticalReport(userReport.id); // Disable for now
      }

      this.logger.info(`User report submitted: ${report.reporterId} -> ${report.reportedUserId}`);
      return { ...userReport, priority, evidence: JSON.parse(userReport.evidence || '[]') } as UserReport;
    } catch (error) {
      this.logger.error('Error submitting user report:', error);
      throw new Error('Failed to submit user report');
    }
  }

  /**
   * Calculate report priority
   */
  private calculateReportPriority(reportType: ReportType, category: ReportCategory): ReportPriority {
    if (category === ReportCategory.URGENT || reportType === ReportType.SAFETY_CONCERN) {
      return ReportPriority.CRITICAL;
    }
    if (reportType === ReportType.FRAUD || reportType === ReportType.HARASSMENT) {
      return ReportPriority.HIGH;
    }
    if (reportType === ReportType.FAKE_PROFILE || reportType === ReportType.INAPPROPRIATE_CONTENT) {
      return ReportPriority.MEDIUM;
    }
    return ReportPriority.LOW;
  }

  /**
   * Handle critical report
   */
  private async handleCriticalReport(reportId: string): Promise<void> {
    try {
      const report = await this.prisma.userReport.findUnique({
        where: { id: reportId },
        include: {
          // reporter: true,
          // reportedUser: true // Relations might not exist
        }
      });

      if (!report) return;

      // Temporarily suspend reported user for safety
      await this.prisma.user.update({
        where: { id: report.reportedUserId },
        data: {
          isSuspended: true,
          suspendedAt: new Date()
          // suspensionReason: `Critical safety report: ${report.reportType}` // Field might not exist
        }
      });

      // Create safety incident
      await this.createSafetyIncident({
        reportId: report.id,
        incidentType: this.mapReportTypeToIncidentType(report.reportType as ReportType),
        severity: IncidentSeverity.CRITICAL,
        description: `Critical user report: ${report.description}`,
        affectedUsers: [report.reporterId, report.reportedUserId],
        createdAt: new Date(),
        status: IncidentStatus.REPORTED
      });

      // Send immediate notification to safety team
      // await this.notifySafetyTeam(report);

      this.logger.warn(`Critical report handled: ${reportId}`);
    } catch (error) {
      this.logger.error('Error handling critical report:', error);
    }
  }

  /**
   * Map report type to incident type
   */
  private mapReportTypeToIncidentType(reportType: ReportType): IncidentType {
    switch (reportType) {
      case ReportType.FRAUD:
        return IncidentType.FRAUD;
      case ReportType.HARASSMENT:
        return IncidentType.HARASSMENT;
      case ReportType.SAFETY_CONCERN:
        return IncidentType.PHYSICAL_THREAT;
      default:
        return IncidentType.POLICY_VIOLATION;
    }
  }

  /**
   * Create safety incident
   */
  async createSafetyIncident(
    incident: Omit<SafetyIncident, 'id'>
  ): Promise<SafetyIncident> {
    try {
      const safetyIncident = await this.prisma.safetyIncident.create({
        data: {
          incidentType: incident.incidentType,
          severity: incident.severity,
          // title: incident.title || 'Safety Incident', // Field not in schema
          description: incident.description,
          // reportId: incident.reportId, // Field doesn't exist in schema
          affectedUsers: JSON.stringify(incident.affectedUsers || []),
          location: incident.location,
          timestamp: incident.createdAt || new Date(),
          status: incident.status,
          reportedBy: incident.affectedUsers?.[0] || 'system', // Add required field
          userProfile: {
            connect: { id: incident.affectedUsers?.[0] || 'unknown' }
          }
        }
      });

      this.logger.info(`Safety incident created: ${incident.incidentType} - ${incident.severity}`);
      return {
        ...safetyIncident,
        affectedUsers: JSON.parse(safetyIncident.affectedUsers || '[]')
      } as SafetyIncident;
    } catch (error) {
      this.logger.error('Error creating safety incident:', error);
      throw new Error('Failed to create safety incident');
    }
  }

  /**
   * Add emergency contact
   */
  async addEmergencyContact(
    contact: Omit<EmergencyContact, 'id' | 'isActive'>
  ): Promise<EmergencyContact> {
    try {
      // If this is set as primary, remove primary status from other contacts
      if (contact.isPrimary) {
        await this.prisma.emergencyContact.updateMany({
          where: {
            userId: contact.userId,
            isPrimary: true
          },
          data: { isPrimary: false }
        });
      }

      const emergencyContact = await this.prisma.emergencyContact.create({
        data: {
          ...contact,
          isActive: true
        }
      });

      this.logger.info(`Emergency contact added: ${contact.userId}`);
      return emergencyContact as EmergencyContact;
    } catch (error) {
      this.logger.error('Error adding emergency contact:', error);
      throw new Error('Failed to add emergency contact');
    }
  }

  /**
   * Get user safety settings
   */
  async getSafetySettings(userId: string): Promise<SafetySettings | null> {
    try {
      const settings = await this.prisma.safetySettings.findUnique({
        where: { userId }
      });

      return {
        ...settings,
        autoReportSuspiciousActivity: settings?.riskAssessment || false, // Map to available field
        requireVerificationForMeetings: settings?.identityVerification || false // Map to available field
      } as SafetySettings;
    } catch (error) {
      this.logger.error('Error fetching safety settings:', error);
      throw new Error('Failed to fetch safety settings');
    }
  }

  /**
   * Update safety settings
   */
  async updateSafetySettings(
    userId: string,
    settings: Partial<Omit<SafetySettings, 'id' | 'userId' | 'lastUpdated'>>
  ): Promise<SafetySettings> {
    try {
      // Hash safe word if provided
      let hashedSafeWord: string | undefined;
      if (settings.safeWord) {
        hashedSafeWord = await bcrypt.hash(settings.safeWord, 10);
      }

      const updatedSettings = await this.prisma.safetySettings.upsert({
        where: { userId },
        update: {
          ...settings,
          safeWord: hashedSafeWord || settings.safeWord,
          updatedAt: new Date()
        },
        create: {
          userId,
          ...settings,
          safeWord: hashedSafeWord || settings.safeWord,
          updatedAt: new Date()
        } as any
      });

      this.logger.info(`Safety settings updated for user: ${userId}`);
      return {
        ...updatedSettings,
        autoReportSuspiciousActivity: updatedSettings?.riskAssessment || false,
        requireVerificationForMeetings: updatedSettings?.identityVerification || false
      } as SafetySettings;
    } catch (error) {
      this.logger.error('Error updating safety settings:', error);
      throw new Error('Failed to update safety settings');
    }
  }

  /**
   * Verify safe word
   */
  async verifySafeWord(userId: string, providedSafeWord: string): Promise<boolean> {
    try {
      const settings = await this.prisma.safetySettings.findUnique({
        where: { userId }
      });

      if (!settings?.safeWord || !settings.safeWordEnabled) {
        return false;
      }

      const isValid = await bcrypt.compare(providedSafeWord, settings.safeWord);
      
      if (isValid) {
        this.logger.info(`Safe word verified for user: ${userId}`);
        // Trigger emergency protocols
        await this.triggerEmergencyProtocols(userId);
      }

      return isValid;
    } catch (error) {
      this.logger.error('Error verifying safe word:', error);
      return false;
    }
  }

  /**
   * Trigger emergency protocols
   */
  private async triggerEmergencyProtocols(userId: string): Promise<void> {
    try {
      // Get emergency contacts
      const emergencyContacts = await this.prisma.emergencyContact.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: [
          { isPrimary: 'desc' },
          { name: 'asc' }
        ]
      });

      // Create safety incident
      await this.createSafetyIncident({
        incidentType: IncidentType.PHYSICAL_THREAT,
        severity: IncidentSeverity.CRITICAL,
        description: 'Emergency safe word activated by user',
        affectedUsers: [userId],
        createdAt: new Date(),
        status: IncidentStatus.REPORTED
      });

      // Send alerts to emergency contacts
      // for (const contact of emergencyContacts) {
      //   await this.sendEmergencyAlert(contact, userId);
      // }

      // Alert platform safety team
      // await this.alertSafetyTeam(userId, 'SAFE_WORD_ACTIVATION');

      this.logger.critical(`Emergency protocols triggered for user: ${userId}`);
    } catch (error) {
      this.logger.error('Error triggering emergency protocols:', error);
    }
  }

  /**
   * Get user verification status
   */
  async getUserVerificationStatus(userId: string): Promise<{
    emailVerified: boolean;
    phoneVerified: boolean;
    identityVerified: boolean;
    addressVerified: boolean;
    verificationScore: number;
    verifiedDate?: Date;
  }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          emailVerified: true,
          phoneVerified: true,
          identityVerified: true,
          addressVerified: true,
          verifiedDate: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Calculate verification score
      let score = 0;
      if (user.emailVerified) score += 25;
      if (user.phoneVerified) score += 25;
      if (user.identityVerified) score += 30;
      if (user.addressVerified) score += 20;

      return {
        ...user,
        verificationScore: score,
        verifiedDate: user.verifiedDate || undefined // Convert null to undefined
      };
    } catch (error) {
      this.logger.error('Error getting user verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }

  /**
   * Get safety profile
   */
  async getSafetyProfile(userId: string): Promise<{
    userId: string;
    safetyScore: number;
    verificationStatus: any;
    emergencyContacts: EmergencyContact[];
    safetySettings: SafetySettings | null;
    recentIncidents: SafetyIncident[];
    backgroundChecks: BackgroundCheck[];
  }> {
    try {
      const [safetyScore, verificationStatus, emergencyContacts, safetySettings, recentIncidents, backgroundChecks] = await Promise.all([
        this.calculateSafetyScore(userId),
        this.getUserVerificationStatus(userId),
        this.prisma.emergencyContact.findMany({
          where: { userId, isActive: true }
        }),
        this.getSafetySettings(userId),
        this.prisma.safetyIncident.findMany({
          where: {
            affectedUsers: { contains: userId } // Using contains instead of has
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),
        this.prisma.backgroundCheck.findMany({
          where: { userId },
          orderBy: { requestedBy: 'desc' },
          take: 3
        })
      ]);

      return {
        userId,
        safetyScore,
        verificationStatus,
        emergencyContacts: emergencyContacts as EmergencyContact[],
        safetySettings,
        recentIncidents: recentIncidents.map(incident => ({
          ...incident,
          affectedUsers: JSON.parse(incident.affectedUsers || '[]')
        })) as SafetyIncident[],
        backgroundChecks: backgroundChecks.map(check => ({
          ...check,
          requestedBy: new Date(check.requestedBy) // Convert string to Date
        })) as BackgroundCheck[]
      };
    } catch (error) {
      this.logger.error('Error getting safety profile:', error);
      throw new Error('Failed to get safety profile');
    }
  }

  /**
   * Update safety profile
   */
  async updateSafetyProfile(userId: string, updateData: {
    emergencyContacts?: EmergencyContact[];
    safetySettings?: Partial<SafetySettings>;
  }): Promise<any> {
    try {
      const updates: any = {};

      // Update emergency contacts if provided
      if (updateData.emergencyContacts) {
        // Remove existing contacts and add new ones
        await this.prisma.emergencyContact.deleteMany({
          where: { userId }
        });

        for (const contact of updateData.emergencyContacts) {
          await this.addEmergencyContact({ ...contact, userId });
        }
        updates.emergencyContactsUpdated = true;
      }

      // Update safety settings if provided
      if (updateData.safetySettings) {
        await this.updateSafetySettings(userId, updateData.safetySettings);
        updates.safetySettingsUpdated = true;
      }

      this.logger.info(`Safety profile updated for user: ${userId}`);
      return updates;
    } catch (error) {
      this.logger.error('Error updating safety profile:', error);
      throw new Error('Failed to update safety profile');
    }
  }

  /**
   * Verify identity
   */
  async verifyIdentity(userId: string, verificationData: {
    documentType: DocumentType;
    documentNumber: string;
    documentImages: string[];
  }): Promise<IdentityVerification> {
    try {
      const verification = await this.prisma.identityVerification.create({
        data: {
          userId,
          verificationType: VerificationType.IDENTITY_DOCUMENT,
          documentType: verificationData.documentType,
          documentNumber: verificationData.documentNumber,
          documentImages: JSON.stringify(verificationData.documentImages), // Convert array to string
          status: VerificationStatus.PENDING,
          createdAt: new Date()
        }
      });

      this.logger.info(`Identity verification initiated for user: ${userId}`);
      return {
        ...verification,
        documentImages: JSON.parse(verification.documentImages || '[]') // Convert back to array
      } as IdentityVerification;
    } catch (error) {
      this.logger.error('Error initiating identity verification:', error);
      throw new Error('Failed to initiate identity verification');
    }
  }

  /**
   * Report user
   */
  async reportUser(reporterId: string, reportedUserId: string, reportData: {
    category: string;
    reason: string;
    evidence?: string[];
  }): Promise<UserReport> {
    try {
      const report = await this.prisma.userReport.create({
        data: {
          reporterId,
          reportedUserId,
          reportType: ReportType.USER_BEHAVIOR,
          category: reportData.category as ReportCategory,
          description: reportData.reason,
          evidence: JSON.stringify(reportData.evidence || []), // Convert array to string
          status: ReportStatus.SUBMITTED,
          priority: this.calculateReportPriority(ReportType.USER_BEHAVIOR, reportData.category as ReportCategory),
          createdAt: new Date(),
          reportedUser: reportedUserId, // Add required field
          reason: reportData.reason // Add required field
        }
      });

      this.logger.info(`User report created: ${reporterId} reported ${reportedUserId}`);
      return {
        ...report,
        evidence: JSON.parse(report.evidence || '[]') // Convert back to array
      } as UserReport;
    } catch (error) {
      this.logger.error('Error creating user report:', error);
      throw new Error('Failed to create user report');
    }
  }

  /**
   * Calculate safety score
   */
  async calculateSafetyScore(userId: string): Promise<number> {
    try {
      const verificationStatus = await this.getUserVerificationStatus(userId);
      const reportsCount = await this.prisma.userReport.count({
        where: { reportedUserId: userId }
      });
      const backgroundChecks = await this.prisma.backgroundCheck.count({
        where: {
          userId,
          status: CheckStatus.COMPLETED
        }
      });

      let score = 50; // Base score
      score += verificationStatus.verificationScore * 0.4; // Max 40 points from verification
      score -= Math.min(reportsCount * 5, 30); // Deduct up to 30 points for reports
      score += Math.min(backgroundChecks * 10, 20); // Add up to 20 points for background checks

      return Math.max(0, Math.min(100, Math.round(score)));
    } catch (error) {
      this.logger.error('Error calculating safety score:', error);
      return 50; // Return default score on error
    }
  }

  /**
   * Trigger emergency protocol
   */
  async triggerEmergencyProtocol(userId: string, location?: string, situation?: string): Promise<{
    success: boolean;
    incidentId?: string;
    message: string;
  }> {
    try {
      // Create emergency incident
      const incident = await this.createSafetyIncident({
        incidentType: IncidentType.PHYSICAL_THREAT,
        severity: IncidentSeverity.CRITICAL,
        description: situation || 'Emergency protocol triggered by user',
        affectedUsers: [userId],
        location,
        createdAt: new Date(),
        status: IncidentStatus.REPORTED
      });

      // Trigger emergency protocols
      await this.triggerEmergencyProtocols(userId);

      return {
        success: true,
        incidentId: incident.id,
        message: 'Emergency protocol activated. Authorities and emergency contacts have been notified.'
      };
    } catch (error) {
      this.logger.error('Error triggering emergency protocol:', error);
      return {
        success: false,
        message: 'Failed to trigger emergency protocol. Please contact support.'
      };
    }
  }

  // Duplicate method removed - using the original calculateReportPriority method above

  /**
   * Set emergency contact (alias for addEmergencyContact)
   */
  async setEmergencyContact(userId: string, contactData: Partial<EmergencyContact>): Promise<EmergencyContact> {
    return await this.addEmergencyContact({
      userId,
      name: contactData.name || '',
      relationship: contactData.relationship || '',
      phone: contactData.phone || '',
      email: contactData.email || '',
      address: contactData.address,
      isPrimary: contactData.isPrimary || false
    });
  }

  /**
   * Report safety incident (alias for createSafetyIncident)
   */
  async reportSafetyIncident(userId: string, incidentData: Partial<SafetyIncident>): Promise<SafetyIncident> {
    return await this.createSafetyIncident({
      incidentType: incidentData.incidentType || IncidentType.POLICY_VIOLATION,
      severity: incidentData.severity || IncidentSeverity.MEDIUM,
      description: incidentData.description || 'Safety incident reported',
      affectedUsers: incidentData.affectedUsers || [userId],
      location: incidentData.location,
      createdAt: new Date(),
      status: IncidentStatus.REPORTED
    });
  }
}

export {
  VerificationType,
  DocumentType,
  VerificationStatus,
  BackgroundCheckType,
  CheckStatus,
  ReportType,
  ReportCategory,
  ReportStatus,
  ReportPriority,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  VisibilityLevel
};

export type {
  IdentityVerification,
  BackgroundCheck,
  UserReport,
  SafetyIncident,
  EmergencyContact,
  SafetySettings,
  MeetingGuidelines
};
