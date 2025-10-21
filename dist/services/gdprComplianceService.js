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
exports.CommunicationPreference = exports.RetentionPreference = exports.VisibilityLevel = exports.LegalBasis = exports.ConsentType = exports.DeletionMethod = exports.DeletionStatus = exports.ExportRequestType = exports.DataExportStatus = exports.GDPRComplianceService = void 0;
const logger_1 = require("../utils/logger");
const crypto = __importStar(require("crypto"));
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
var DataExportStatus;
(function (DataExportStatus) {
    DataExportStatus["PENDING"] = "pending";
    DataExportStatus["PROCESSING"] = "processing";
    DataExportStatus["COMPLETED"] = "completed";
    DataExportStatus["FAILED"] = "failed";
    DataExportStatus["EXPIRED"] = "expired";
})(DataExportStatus || (exports.DataExportStatus = DataExportStatus = {}));
var ExportRequestType;
(function (ExportRequestType) {
    ExportRequestType["FULL_EXPORT"] = "full_export";
    ExportRequestType["PARTIAL_EXPORT"] = "partial_export";
    ExportRequestType["CONSENT_HISTORY"] = "consent_history";
    ExportRequestType["TRANSACTION_DATA"] = "transaction_data";
})(ExportRequestType || (exports.ExportRequestType = ExportRequestType = {}));
var DeletionStatus;
(function (DeletionStatus) {
    DeletionStatus["REQUESTED"] = "requested";
    DeletionStatus["VERIFIED"] = "verified";
    DeletionStatus["SCHEDULED"] = "scheduled";
    DeletionStatus["IN_PROGRESS"] = "in_progress";
    DeletionStatus["COMPLETED"] = "completed";
    DeletionStatus["FAILED"] = "failed";
    DeletionStatus["CANCELLED"] = "cancelled";
})(DeletionStatus || (exports.DeletionStatus = DeletionStatus = {}));
var DeletionMethod;
(function (DeletionMethod) {
    DeletionMethod["SOFT_DELETE"] = "soft_delete";
    DeletionMethod["HARD_DELETE"] = "hard_delete";
    DeletionMethod["ANONYMIZATION"] = "anonymization";
    DeletionMethod["PSEUDONYMIZATION"] = "pseudonymization";
})(DeletionMethod || (exports.DeletionMethod = DeletionMethod = {}));
var ConsentType;
(function (ConsentType) {
    ConsentType["DATA_PROCESSING"] = "data_processing";
    ConsentType["MARKETING"] = "marketing";
    ConsentType["ANALYTICS"] = "analytics";
    ConsentType["THIRD_PARTY_SHARING"] = "third_party_sharing";
    ConsentType["COOKIES"] = "cookies";
    ConsentType["PROFILING"] = "profiling";
})(ConsentType || (exports.ConsentType = ConsentType = {}));
var LegalBasis;
(function (LegalBasis) {
    LegalBasis["CONSENT"] = "consent";
    LegalBasis["CONTRACT"] = "contract";
    LegalBasis["LEGAL_OBLIGATION"] = "legal_obligation";
    LegalBasis["VITAL_INTERESTS"] = "vital_interests";
    LegalBasis["PUBLIC_TASK"] = "public_task";
    LegalBasis["LEGITIMATE_INTERESTS"] = "legitimate_interests";
})(LegalBasis || (exports.LegalBasis = LegalBasis = {}));
var VisibilityLevel;
(function (VisibilityLevel) {
    VisibilityLevel["PUBLIC"] = "public";
    VisibilityLevel["USERS_ONLY"] = "users_only";
    VisibilityLevel["PRIVATE"] = "private";
})(VisibilityLevel || (exports.VisibilityLevel = VisibilityLevel = {}));
var RetentionPreference;
(function (RetentionPreference) {
    RetentionPreference["MINIMUM"] = "minimum";
    RetentionPreference["STANDARD"] = "standard";
    RetentionPreference["EXTENDED"] = "extended";
})(RetentionPreference || (exports.RetentionPreference = RetentionPreference = {}));
var CommunicationPreference;
(function (CommunicationPreference) {
    CommunicationPreference["EMAIL"] = "email";
    CommunicationPreference["SMS"] = "sms";
    CommunicationPreference["PUSH"] = "push";
    CommunicationPreference["IN_APP"] = "in_app";
})(CommunicationPreference || (exports.CommunicationPreference = CommunicationPreference = {}));
class GDPRComplianceService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
        this.exportPath = path.join(process.cwd(), 'temp', 'exports');
    }
    /**
     * Request data export for user
     */
    async requestDataExport(userId, requestType = ExportRequestType.FULL_EXPORT) {
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
                logger_1.logger.error('Error processing data export:', error);
            });
            logger_1.logger.info(`Data export requested for user: ${userId}`);
            // Transform to expected interface
            return {
                id: exportRequest.id,
                userId: exportRequest.userId,
                status: DataExportStatus.PENDING,
                requestType,
                requestedAt: exportRequest.createdAt
            };
        }
        catch (error) {
            logger_1.logger.error('Error requesting data export:', error);
            throw new Error('Failed to request data export');
        }
    }
    /**
     * Process data export
     */
    async processDataExport(requestId) {
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
                    dataTypes: JSON.stringify(['profile', 'orders', 'consents']),
                    format: 'json',
                    downloadUrl: exportFile,
                    expiresAt
                }
            });
            logger_1.logger.info(`Data export completed for request: ${requestId}`);
        }
        catch (error) {
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
    async collectUserData(userId, requestType) {
        const userData = {
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
    async generateExportFile(userData, userId) {
        try {
            await fs.mkdir(this.exportPath, { recursive: true });
            const filename = `user_data_export_${userId}_${Date.now()}.json`;
            const filepath = path.join(this.exportPath, filename);
            await fs.writeFile(filepath, JSON.stringify(userData, null, 2));
            return `/api/exports/${filename}`;
        }
        catch (error) {
            this.logger.error('Error generating export file:', error);
            throw new Error('Failed to generate export file');
        }
    }
    /**
     * Request data deletion
     */
    async requestDataDeletion(userId, reason, deletionMethod = DeletionMethod.SOFT_DELETE) {
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
            return deletionRequest;
        }
        catch (error) {
            this.logger.error('Error requesting data deletion:', error);
            throw new Error('Failed to request data deletion');
        }
    }
    /**
     * Verify data deletion request
     */
    async verifyDataDeletion(token) {
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
        }
        catch (error) {
            this.logger.error('Error verifying data deletion:', error);
            return false;
        }
    }
    /**
     * Process scheduled deletions
     */
    async processScheduledDeletions() {
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
                await this.executeDeletion(deletion);
            }
            this.logger.info(`Processed ${scheduledDeletions.length} scheduled deletions`);
        }
        catch (error) {
            this.logger.error('Error processing scheduled deletions:', error);
        }
    }
    /**
     * Execute data deletion
     */
    async executeDeletion(request) {
        try {
            await this.prisma.dataDeletionRequest.update({
                where: { id: request.id },
                data: { status: DeletionStatus.IN_PROGRESS }
            });
            const dataRetained = [];
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
        }
        catch (error) {
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
    async hardDeleteUserData(userId, dataRetained) {
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
    async softDeleteUserData(userId, dataRetained) {
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
    async anonymizeUserData(userId, dataRetained) {
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
    async pseudonymizeUserData(userId, dataRetained) {
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
    async recordConsent(consent) {
        try {
            const consentRecord = await this.prisma.consentRecord.create({
                data: consent
            });
            this.logger.info(`Consent recorded: ${consent.userId} - ${consent.consentType}`);
            return consentRecord;
        }
        catch (error) {
            this.logger.error('Error recording consent:', error);
            throw new Error('Failed to record consent');
        }
    }
    /**
     * Withdraw consent
     */
    async withdrawConsent(userId, consentType) {
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
        }
        catch (error) {
            this.logger.error('Error withdrawing consent:', error);
            return false;
        }
    }
    /**
     * Get user privacy settings
     */
    async getPrivacySettings(userId) {
        try {
            const settings = await this.prisma.userPrivacySettings.findUnique({
                where: { userId }
            });
            return settings;
        }
        catch (error) {
            this.logger.error('Error fetching privacy settings:', error);
            throw new Error('Failed to fetch privacy settings');
        }
    }
    /**
     * Update privacy settings
     */
    async updatePrivacySettings(userId, settings) {
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
                }
            });
            this.logger.info(`Privacy settings updated for user: ${userId}`);
            return updatedSettings;
        }
        catch (error) {
            this.logger.error('Error updating privacy settings:', error);
            throw new Error('Failed to update privacy settings');
        }
    }
    /**
     * Generate compliance report
     */
    async generateComplianceReport(startDate, endDate) {
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
        }
        catch (error) {
            this.logger.error('Error generating compliance report:', error);
            throw new Error('Failed to generate compliance report');
        }
    }
    /**
     * Cleanup expired export files
     */
    async cleanupExpiredExports() {
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
                    }
                    catch (error) {
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
        }
        catch (error) {
            this.logger.error('Error cleaning up expired exports:', error);
            return 0;
        }
    }
}
exports.GDPRComplianceService = GDPRComplianceService;
//# sourceMappingURL=gdprComplianceService.js.map