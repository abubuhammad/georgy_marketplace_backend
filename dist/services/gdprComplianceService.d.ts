import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
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
declare enum DataExportStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    EXPIRED = "expired"
}
declare enum ExportRequestType {
    FULL_EXPORT = "full_export",
    PARTIAL_EXPORT = "partial_export",
    CONSENT_HISTORY = "consent_history",
    TRANSACTION_DATA = "transaction_data"
}
declare enum DeletionStatus {
    REQUESTED = "requested",
    VERIFIED = "verified",
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
declare enum DeletionMethod {
    SOFT_DELETE = "soft_delete",
    HARD_DELETE = "hard_delete",
    ANONYMIZATION = "anonymization",
    PSEUDONYMIZATION = "pseudonymization"
}
declare enum ConsentType {
    DATA_PROCESSING = "data_processing",
    MARKETING = "marketing",
    ANALYTICS = "analytics",
    THIRD_PARTY_SHARING = "third_party_sharing",
    COOKIES = "cookies",
    PROFILING = "profiling"
}
declare enum LegalBasis {
    CONSENT = "consent",
    CONTRACT = "contract",
    LEGAL_OBLIGATION = "legal_obligation",
    VITAL_INTERESTS = "vital_interests",
    PUBLIC_TASK = "public_task",
    LEGITIMATE_INTERESTS = "legitimate_interests"
}
declare enum VisibilityLevel {
    PUBLIC = "public",
    USERS_ONLY = "users_only",
    PRIVATE = "private"
}
declare enum RetentionPreference {
    MINIMUM = "minimum",
    STANDARD = "standard",
    EXTENDED = "extended"
}
declare enum CommunicationPreference {
    EMAIL = "email",
    SMS = "sms",
    PUSH = "push",
    IN_APP = "in_app"
}
export declare class GDPRComplianceService {
    private prisma;
    private logger;
    private exportPath;
    constructor(prisma: PrismaClient, logger: Logger);
    /**
     * Request data export for user
     */
    requestDataExport(userId: string, requestType?: ExportRequestType): Promise<DataExportRequest>;
    /**
     * Process data export
     */
    private processDataExport;
    /**
     * Collect user data for export
     */
    private collectUserData;
    /**
     * Generate export file
     */
    private generateExportFile;
    /**
     * Request data deletion
     */
    requestDataDeletion(userId: string, reason: string, deletionMethod?: DeletionMethod): Promise<DataDeletionRequest>;
    /**
     * Verify data deletion request
     */
    verifyDataDeletion(token: string): Promise<boolean>;
    /**
     * Process scheduled deletions
     */
    processScheduledDeletions(): Promise<void>;
    /**
     * Execute data deletion
     */
    private executeDeletion;
    /**
     * Hard delete user data
     */
    private hardDeleteUserData;
    /**
     * Soft delete user data
     */
    private softDeleteUserData;
    /**
     * Anonymize user data
     */
    private anonymizeUserData;
    /**
     * Pseudonymize user data
     */
    private pseudonymizeUserData;
    /**
     * Record consent
     */
    recordConsent(consent: Omit<ConsentRecord, 'id'>): Promise<ConsentRecord>;
    /**
     * Withdraw consent
     */
    withdrawConsent(userId: string, consentType: ConsentType): Promise<boolean>;
    /**
     * Get user privacy settings
     */
    getPrivacySettings(userId: string): Promise<PrivacySettings | null>;
    /**
     * Update privacy settings
     */
    updatePrivacySettings(userId: string, settings: Partial<Omit<PrivacySettings, 'id' | 'userId' | 'lastUpdated'>>): Promise<PrivacySettings>;
    /**
     * Generate compliance report
     */
    generateComplianceReport(startDate: Date, endDate: Date): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        dataExports: number;
        dataDeletions: number;
        consentWithdrawals: number;
        activeConsents: number;
        complianceScore: number;
    }>;
    /**
     * Cleanup expired export files
     */
    cleanupExpiredExports(): Promise<number>;
}
export { DataExportStatus, ExportRequestType, DeletionStatus, DeletionMethod, ConsentType, LegalBasis, VisibilityLevel, RetentionPreference, CommunicationPreference };
export type { DataExportRequest, DataDeletionRequest, ConsentRecord, DataProcessingActivity, PrivacySettings };
//# sourceMappingURL=gdprComplianceService.d.ts.map