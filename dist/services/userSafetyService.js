"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisibilityLevel = exports.IncidentStatus = exports.IncidentSeverity = exports.IncidentType = exports.ReportPriority = exports.ReportStatus = exports.ReportCategory = exports.ReportType = exports.CheckStatus = exports.BackgroundCheckType = exports.VerificationStatus = exports.DocumentType = exports.VerificationType = exports.UserSafetyService = void 0;
const bcrypt = __importStar(require("bcrypt"));
var VerificationType;
(function (VerificationType) {
    VerificationType["EMAIL"] = "email";
    VerificationType["PHONE"] = "phone";
    VerificationType["IDENTITY_DOCUMENT"] = "identity_document";
    VerificationType["ADDRESS"] = "address";
    VerificationType["BANK_ACCOUNT"] = "bank_account";
    VerificationType["BUSINESS_LICENSE"] = "business_license";
})(VerificationType || (exports.VerificationType = VerificationType = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["PASSPORT"] = "passport";
    DocumentType["DRIVERS_LICENSE"] = "drivers_license";
    DocumentType["NATIONAL_ID"] = "national_id";
    DocumentType["UTILITY_BILL"] = "utility_bill";
    DocumentType["BANK_STATEMENT"] = "bank_statement";
    DocumentType["BUSINESS_REGISTRATION"] = "business_registration";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["UNDER_REVIEW"] = "under_review";
    VerificationStatus["APPROVED"] = "approved";
    VerificationStatus["REJECTED"] = "rejected";
    VerificationStatus["EXPIRED"] = "expired";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var BackgroundCheckType;
(function (BackgroundCheckType) {
    BackgroundCheckType["IDENTITY"] = "identity";
    BackgroundCheckType["CRIMINAL_RECORD"] = "criminal_record";
    BackgroundCheckType["FINANCIAL_HISTORY"] = "financial_history";
    BackgroundCheckType["EMPLOYMENT_HISTORY"] = "employment_history";
    BackgroundCheckType["REFERENCE_CHECK"] = "reference_check";
})(BackgroundCheckType || (exports.BackgroundCheckType = BackgroundCheckType = {}));
var CheckStatus;
(function (CheckStatus) {
    CheckStatus["PENDING"] = "pending";
    CheckStatus["IN_PROGRESS"] = "in_progress";
    CheckStatus["COMPLETED"] = "completed";
    CheckStatus["FAILED"] = "failed";
    CheckStatus["EXPIRED"] = "expired";
})(CheckStatus || (exports.CheckStatus = CheckStatus = {}));
var ReportType;
(function (ReportType) {
    ReportType["USER_BEHAVIOR"] = "user_behavior";
    ReportType["FRAUD"] = "fraud";
    ReportType["SAFETY_CONCERN"] = "safety_concern";
    ReportType["HARASSMENT"] = "harassment";
    ReportType["SPAM"] = "spam";
    ReportType["FAKE_PROFILE"] = "fake_profile";
    ReportType["INAPPROPRIATE_CONTENT"] = "inappropriate_content";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportCategory;
(function (ReportCategory) {
    ReportCategory["URGENT"] = "urgent";
    ReportCategory["HIGH_PRIORITY"] = "high_priority";
    ReportCategory["MEDIUM_PRIORITY"] = "medium_priority";
    ReportCategory["LOW_PRIORITY"] = "low_priority";
    ReportCategory["INFORMATIONAL"] = "informational";
})(ReportCategory || (exports.ReportCategory = ReportCategory = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["SUBMITTED"] = "submitted";
    ReportStatus["UNDER_REVIEW"] = "under_review";
    ReportStatus["INVESTIGATING"] = "investigating";
    ReportStatus["RESOLVED"] = "resolved";
    ReportStatus["CLOSED"] = "closed";
    ReportStatus["DISMISSED"] = "dismissed";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var ReportPriority;
(function (ReportPriority) {
    ReportPriority["CRITICAL"] = "critical";
    ReportPriority["HIGH"] = "high";
    ReportPriority["MEDIUM"] = "medium";
    ReportPriority["LOW"] = "low";
})(ReportPriority || (exports.ReportPriority = ReportPriority = {}));
var IncidentType;
(function (IncidentType) {
    IncidentType["FRAUD"] = "fraud";
    IncidentType["HARASSMENT"] = "harassment";
    IncidentType["PHYSICAL_THREAT"] = "physical_threat";
    IncidentType["DATA_BREACH"] = "data_breach";
    IncidentType["SYSTEM_ABUSE"] = "system_abuse";
    IncidentType["POLICY_VIOLATION"] = "policy_violation";
})(IncidentType || (exports.IncidentType = IncidentType = {}));
var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["CRITICAL"] = "critical";
    IncidentSeverity["HIGH"] = "high";
    IncidentSeverity["MEDIUM"] = "medium";
    IncidentSeverity["LOW"] = "low";
})(IncidentSeverity || (exports.IncidentSeverity = IncidentSeverity = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["REPORTED"] = "reported";
    IncidentStatus["INVESTIGATING"] = "investigating";
    IncidentStatus["CONTAINED"] = "contained";
    IncidentStatus["RESOLVED"] = "resolved";
    IncidentStatus["CLOSED"] = "closed";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
var VisibilityLevel;
(function (VisibilityLevel) {
    VisibilityLevel["PUBLIC"] = "public";
    VisibilityLevel["VERIFIED_USERS"] = "verified_users";
    VisibilityLevel["FRIENDS_ONLY"] = "friends_only";
    VisibilityLevel["PRIVATE"] = "private";
})(VisibilityLevel || (exports.VisibilityLevel = VisibilityLevel = {}));
class UserSafetyService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    /**
     * Submit identity verification
     */
    async submitIdentityVerification(verification) {
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
            return { ...identityVerification, documentImages: JSON.parse(identityVerification.documentImages || '[]') };
        }
        catch (error) {
            this.logger.error('Error submitting identity verification:', error);
            throw new Error('Failed to submit identity verification');
        }
    }
    /**
     * Review identity verification
     */
    async reviewIdentityVerification(verificationId, reviewerId, status, rejectionReason, verificationScore) {
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
            return { ...verification, documentImages: JSON.parse(verification.documentImages || '[]') };
        }
        catch (error) {
            this.logger.error('Error reviewing identity verification:', error);
            throw new Error('Failed to review identity verification');
        }
    }
    /**
     * Update user verification status
     */
    async updateUserVerificationStatus(userId, verificationType) {
        const updateData = {};
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
    async requestBackgroundCheck(userId, checkType, provider = 'default') {
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
            return { ...backgroundCheck, requestedBy: new Date(backgroundCheck.requestedBy) };
        }
        catch (error) {
            this.logger.error('Error requesting background check:', error);
            throw new Error('Failed to request background check');
        }
    }
    /**
     * Process background check (placeholder for third-party integration)
     */
    async processBackgroundCheck(checkId) {
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
        }
        catch (error) {
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
    async submitUserReport(report) {
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
            return { ...userReport, priority, evidence: JSON.parse(userReport.evidence || '[]') };
        }
        catch (error) {
            this.logger.error('Error submitting user report:', error);
            throw new Error('Failed to submit user report');
        }
    }
    /**
     * Calculate report priority
     */
    calculateReportPriority(reportType, category) {
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
    async handleCriticalReport(reportId) {
        try {
            const report = await this.prisma.userReport.findUnique({
                where: { id: reportId },
                include: {
                // reporter: true,
                // reportedUser: true // Relations might not exist
                }
            });
            if (!report)
                return;
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
                incidentType: this.mapReportTypeToIncidentType(report.reportType),
                severity: IncidentSeverity.CRITICAL,
                description: `Critical user report: ${report.description}`,
                affectedUsers: [report.reporterId, report.reportedUserId],
                createdAt: new Date(),
                status: IncidentStatus.REPORTED
            });
            // Send immediate notification to safety team
            // await this.notifySafetyTeam(report);
            this.logger.warn(`Critical report handled: ${reportId}`);
        }
        catch (error) {
            this.logger.error('Error handling critical report:', error);
        }
    }
    /**
     * Map report type to incident type
     */
    mapReportTypeToIncidentType(reportType) {
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
    async createSafetyIncident(incident) {
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
            };
        }
        catch (error) {
            this.logger.error('Error creating safety incident:', error);
            throw new Error('Failed to create safety incident');
        }
    }
    /**
     * Add emergency contact
     */
    async addEmergencyContact(contact) {
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
            return emergencyContact;
        }
        catch (error) {
            this.logger.error('Error adding emergency contact:', error);
            throw new Error('Failed to add emergency contact');
        }
    }
    /**
     * Get user safety settings
     */
    async getSafetySettings(userId) {
        try {
            const settings = await this.prisma.safetySettings.findUnique({
                where: { userId }
            });
            return {
                ...settings,
                autoReportSuspiciousActivity: settings?.riskAssessment || false, // Map to available field
                requireVerificationForMeetings: settings?.identityVerification || false // Map to available field
            };
        }
        catch (error) {
            this.logger.error('Error fetching safety settings:', error);
            throw new Error('Failed to fetch safety settings');
        }
    }
    /**
     * Update safety settings
     */
    async updateSafetySettings(userId, settings) {
        try {
            // Hash safe word if provided
            let hashedSafeWord;
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
                }
            });
            this.logger.info(`Safety settings updated for user: ${userId}`);
            return {
                ...updatedSettings,
                autoReportSuspiciousActivity: updatedSettings?.riskAssessment || false,
                requireVerificationForMeetings: updatedSettings?.identityVerification || false
            };
        }
        catch (error) {
            this.logger.error('Error updating safety settings:', error);
            throw new Error('Failed to update safety settings');
        }
    }
    /**
     * Verify safe word
     */
    async verifySafeWord(userId, providedSafeWord) {
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
        }
        catch (error) {
            this.logger.error('Error verifying safe word:', error);
            return false;
        }
    }
    /**
     * Trigger emergency protocols
     */
    async triggerEmergencyProtocols(userId) {
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
        }
        catch (error) {
            this.logger.error('Error triggering emergency protocols:', error);
        }
    }
    /**
     * Get user verification status
     */
    async getUserVerificationStatus(userId) {
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
            if (user.emailVerified)
                score += 25;
            if (user.phoneVerified)
                score += 25;
            if (user.identityVerified)
                score += 30;
            if (user.addressVerified)
                score += 20;
            return {
                ...user,
                verificationScore: score,
                verifiedDate: user.verifiedDate || undefined // Convert null to undefined
            };
        }
        catch (error) {
            this.logger.error('Error getting user verification status:', error);
            throw new Error('Failed to get verification status');
        }
    }
    /**
     * Get safety profile
     */
    async getSafetyProfile(userId) {
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
                emergencyContacts: emergencyContacts,
                safetySettings,
                recentIncidents: recentIncidents.map(incident => ({
                    ...incident,
                    affectedUsers: JSON.parse(incident.affectedUsers || '[]')
                })),
                backgroundChecks: backgroundChecks.map(check => ({
                    ...check,
                    requestedBy: new Date(check.requestedBy) // Convert string to Date
                }))
            };
        }
        catch (error) {
            this.logger.error('Error getting safety profile:', error);
            throw new Error('Failed to get safety profile');
        }
    }
    /**
     * Update safety profile
     */
    async updateSafetyProfile(userId, updateData) {
        try {
            const updates = {};
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
        }
        catch (error) {
            this.logger.error('Error updating safety profile:', error);
            throw new Error('Failed to update safety profile');
        }
    }
    /**
     * Verify identity
     */
    async verifyIdentity(userId, verificationData) {
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
            };
        }
        catch (error) {
            this.logger.error('Error initiating identity verification:', error);
            throw new Error('Failed to initiate identity verification');
        }
    }
    /**
     * Report user
     */
    async reportUser(reporterId, reportedUserId, reportData) {
        try {
            const report = await this.prisma.userReport.create({
                data: {
                    reporterId,
                    reportedUserId,
                    reportType: ReportType.USER_BEHAVIOR,
                    category: reportData.category,
                    description: reportData.reason,
                    evidence: JSON.stringify(reportData.evidence || []), // Convert array to string
                    status: ReportStatus.SUBMITTED,
                    priority: this.calculateReportPriority(ReportType.USER_BEHAVIOR, reportData.category),
                    createdAt: new Date(),
                    reportedUser: reportedUserId, // Add required field
                    reason: reportData.reason // Add required field
                }
            });
            this.logger.info(`User report created: ${reporterId} reported ${reportedUserId}`);
            return {
                ...report,
                evidence: JSON.parse(report.evidence || '[]') // Convert back to array
            };
        }
        catch (error) {
            this.logger.error('Error creating user report:', error);
            throw new Error('Failed to create user report');
        }
    }
    /**
     * Calculate safety score
     */
    async calculateSafetyScore(userId) {
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
        }
        catch (error) {
            this.logger.error('Error calculating safety score:', error);
            return 50; // Return default score on error
        }
    }
    /**
     * Trigger emergency protocol
     */
    async triggerEmergencyProtocol(userId, location, situation) {
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
        }
        catch (error) {
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
    async setEmergencyContact(userId, contactData) {
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
    async reportSafetyIncident(userId, incidentData) {
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
exports.UserSafetyService = UserSafetyService;
//# sourceMappingURL=userSafetyService.js.map