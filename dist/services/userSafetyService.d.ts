import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
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
declare enum VerificationType {
    EMAIL = "email",
    PHONE = "phone",
    IDENTITY_DOCUMENT = "identity_document",
    ADDRESS = "address",
    BANK_ACCOUNT = "bank_account",
    BUSINESS_LICENSE = "business_license"
}
declare enum DocumentType {
    PASSPORT = "passport",
    DRIVERS_LICENSE = "drivers_license",
    NATIONAL_ID = "national_id",
    UTILITY_BILL = "utility_bill",
    BANK_STATEMENT = "bank_statement",
    BUSINESS_REGISTRATION = "business_registration"
}
declare enum VerificationStatus {
    PENDING = "pending",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    EXPIRED = "expired"
}
declare enum BackgroundCheckType {
    IDENTITY = "identity",
    CRIMINAL_RECORD = "criminal_record",
    FINANCIAL_HISTORY = "financial_history",
    EMPLOYMENT_HISTORY = "employment_history",
    REFERENCE_CHECK = "reference_check"
}
declare enum CheckStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    EXPIRED = "expired"
}
declare enum ReportType {
    USER_BEHAVIOR = "user_behavior",
    FRAUD = "fraud",
    SAFETY_CONCERN = "safety_concern",
    HARASSMENT = "harassment",
    SPAM = "spam",
    FAKE_PROFILE = "fake_profile",
    INAPPROPRIATE_CONTENT = "inappropriate_content"
}
declare enum ReportCategory {
    URGENT = "urgent",
    HIGH_PRIORITY = "high_priority",
    MEDIUM_PRIORITY = "medium_priority",
    LOW_PRIORITY = "low_priority",
    INFORMATIONAL = "informational"
}
declare enum ReportStatus {
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    INVESTIGATING = "investigating",
    RESOLVED = "resolved",
    CLOSED = "closed",
    DISMISSED = "dismissed"
}
declare enum ReportPriority {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
declare enum IncidentType {
    FRAUD = "fraud",
    HARASSMENT = "harassment",
    PHYSICAL_THREAT = "physical_threat",
    DATA_BREACH = "data_breach",
    SYSTEM_ABUSE = "system_abuse",
    POLICY_VIOLATION = "policy_violation"
}
declare enum IncidentSeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low"
}
declare enum IncidentStatus {
    REPORTED = "reported",
    INVESTIGATING = "investigating",
    CONTAINED = "contained",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
declare enum VisibilityLevel {
    PUBLIC = "public",
    VERIFIED_USERS = "verified_users",
    FRIENDS_ONLY = "friends_only",
    PRIVATE = "private"
}
export declare class UserSafetyService {
    private prisma;
    private logger;
    constructor(prisma: PrismaClient, logger: Logger);
    /**
     * Submit identity verification
     */
    submitIdentityVerification(verification: Omit<IdentityVerification, 'id' | 'submittedAt' | 'status'>): Promise<IdentityVerification>;
    /**
     * Review identity verification
     */
    reviewIdentityVerification(verificationId: string, reviewerId: string, status: VerificationStatus, rejectionReason?: string, verificationScore?: number): Promise<IdentityVerification>;
    /**
     * Update user verification status
     */
    private updateUserVerificationStatus;
    /**
     * Request background check
     */
    requestBackgroundCheck(userId: string, checkType: BackgroundCheckType, provider?: string): Promise<BackgroundCheck>;
    /**
     * Process background check (placeholder for third-party integration)
     */
    private processBackgroundCheck;
    /**
     * Submit user report
     */
    submitUserReport(report: Omit<UserReport, 'id' | 'createdAt' | 'status'>): Promise<UserReport>;
    /**
     * Calculate report priority
     */
    private calculateReportPriority;
    /**
     * Handle critical report
     */
    private handleCriticalReport;
    /**
     * Map report type to incident type
     */
    private mapReportTypeToIncidentType;
    /**
     * Create safety incident
     */
    createSafetyIncident(incident: Omit<SafetyIncident, 'id'>): Promise<SafetyIncident>;
    /**
     * Add emergency contact
     */
    addEmergencyContact(contact: Omit<EmergencyContact, 'id' | 'isActive'>): Promise<EmergencyContact>;
    /**
     * Get user safety settings
     */
    getSafetySettings(userId: string): Promise<SafetySettings | null>;
    /**
     * Update safety settings
     */
    updateSafetySettings(userId: string, settings: Partial<Omit<SafetySettings, 'id' | 'userId' | 'lastUpdated'>>): Promise<SafetySettings>;
    /**
     * Verify safe word
     */
    verifySafeWord(userId: string, providedSafeWord: string): Promise<boolean>;
    /**
     * Trigger emergency protocols
     */
    private triggerEmergencyProtocols;
    /**
     * Get user verification status
     */
    getUserVerificationStatus(userId: string): Promise<{
        emailVerified: boolean;
        phoneVerified: boolean;
        identityVerified: boolean;
        addressVerified: boolean;
        verificationScore: number;
        verifiedDate?: Date;
    }>;
    /**
     * Get safety profile
     */
    getSafetyProfile(userId: string): Promise<{
        userId: string;
        safetyScore: number;
        verificationStatus: any;
        emergencyContacts: EmergencyContact[];
        safetySettings: SafetySettings | null;
        recentIncidents: SafetyIncident[];
        backgroundChecks: BackgroundCheck[];
    }>;
    /**
     * Update safety profile
     */
    updateSafetyProfile(userId: string, updateData: {
        emergencyContacts?: EmergencyContact[];
        safetySettings?: Partial<SafetySettings>;
    }): Promise<any>;
    /**
     * Verify identity
     */
    verifyIdentity(userId: string, verificationData: {
        documentType: DocumentType;
        documentNumber: string;
        documentImages: string[];
    }): Promise<IdentityVerification>;
    /**
     * Report user
     */
    reportUser(reporterId: string, reportedUserId: string, reportData: {
        category: string;
        reason: string;
        evidence?: string[];
    }): Promise<UserReport>;
    /**
     * Calculate safety score
     */
    calculateSafetyScore(userId: string): Promise<number>;
    /**
     * Trigger emergency protocol
     */
    triggerEmergencyProtocol(userId: string, location?: string, situation?: string): Promise<{
        success: boolean;
        incidentId?: string;
        message: string;
    }>;
    /**
     * Set emergency contact (alias for addEmergencyContact)
     */
    setEmergencyContact(userId: string, contactData: Partial<EmergencyContact>): Promise<EmergencyContact>;
    /**
     * Report safety incident (alias for createSafetyIncident)
     */
    reportSafetyIncident(userId: string, incidentData: Partial<SafetyIncident>): Promise<SafetyIncident>;
}
export { VerificationType, DocumentType, VerificationStatus, BackgroundCheckType, CheckStatus, ReportType, ReportCategory, ReportStatus, ReportPriority, IncidentType, IncidentSeverity, IncidentStatus, VisibilityLevel };
export type { IdentityVerification, BackgroundCheck, UserReport, SafetyIncident, EmergencyContact, SafetySettings, MeetingGuidelines };
//# sourceMappingURL=userSafetyService.d.ts.map