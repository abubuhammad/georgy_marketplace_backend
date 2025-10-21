"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsentMethod = exports.LegalDocumentType = exports.LegalDocumentationService = void 0;
var LegalDocumentType;
(function (LegalDocumentType) {
    LegalDocumentType["TERMS_OF_SERVICE"] = "terms_of_service";
    LegalDocumentType["PRIVACY_POLICY"] = "privacy_policy";
    LegalDocumentType["COOKIE_POLICY"] = "cookie_policy";
    LegalDocumentType["REFUND_POLICY"] = "refund_policy";
    LegalDocumentType["USER_AGREEMENT"] = "user_agreement";
    LegalDocumentType["SELLER_AGREEMENT"] = "seller_agreement";
    LegalDocumentType["DELIVERY_TERMS"] = "delivery_terms";
    LegalDocumentType["DATA_PROCESSING_AGREEMENT"] = "data_processing_agreement";
})(LegalDocumentType || (exports.LegalDocumentType = LegalDocumentType = {}));
var ConsentMethod;
(function (ConsentMethod) {
    ConsentMethod["CHECKBOX"] = "checkbox";
    ConsentMethod["BUTTON_CLICK"] = "button_click";
    ConsentMethod["ELECTRONIC_SIGNATURE"] = "electronic_signature";
    ConsentMethod["EMAIL_CONFIRMATION"] = "email_confirmation";
})(ConsentMethod || (exports.ConsentMethod = ConsentMethod = {}));
class LegalDocumentationService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    /**
     * Create or update a legal document
     */
    async createOrUpdateDocument(document) {
        // No LegalDocument model in current Prisma schema; persist not supported.
        this.logger.warn('createOrUpdateDocument called but LegalDocument model is not available in schema');
        return { ...document, lastModified: new Date() };
    }
    /**
     * Get active legal document
     */
    async getActiveDocument(type, language = 'en', jurisdiction = 'default') {
        // Not backed by DB; return null to indicate not found in current schema
        return null;
    }
    /**
     * Get all active documents for user consent check
     */
    async getAllActiveDocuments(language = 'en', jurisdiction = 'default') {
        // Not backed by DB; return empty list
        return [];
    }
    /**
     * Create document version history
     */
    async createDocumentVersion(version) {
        // Not backed by DB; return the payload
        return version;
    }
    /**
     * Record user consent
     */
    async recordUserConsent(consent) {
        try {
            // Map to ConsentRecord model in schema
            const record = await this.prisma.consentRecord.create({
                data: {
                    userId: consent.userId,
                    consentType: consent.documentType,
                    consentGiven: consent.consentGiven,
                    consentDate: consent.consentDate,
                    ipAddress: consent.ipAddress,
                    userAgent: consent.userAgent,
                    version: consent.documentVersion,
                    consentMethod: String(consent.consentMethod)
                }
            });
            this.logger.info(`User consent recorded: ${consent.userId} - ${consent.documentType}`);
            return {
                ...consent
            };
        }
        catch (error) {
            this.logger.error('Error recording user consent:', error);
            throw new Error('Failed to record user consent');
        }
    }
    /**
     * Check if user has given consent for required documents
     */
    async checkUserConsent(userId) {
        try {
            const requiredDocuments = [
                LegalDocumentType.TERMS_OF_SERVICE,
                LegalDocumentType.PRIVACY_POLICY
            ];
            const records = await this.prisma.consentRecord.findMany({
                where: { userId, consentGiven: true }
            });
            const consentedDocuments = records.map(r => r.consentType);
            const missingConsents = requiredDocuments.filter(doc => !consentedDocuments.includes(doc));
            const consentDetails = records.map(r => ({
                userId: r.userId,
                documentType: r.consentType,
                documentVersion: r.version,
                consentGiven: r.consentGiven,
                consentDate: r.consentDate,
                ipAddress: r.ipAddress || '',
                userAgent: r.userAgent || '',
                consentMethod: ConsentMethod.BUTTON_CLICK
            }));
            return {
                hasAllRequiredConsents: missingConsents.length === 0,
                missingConsents,
                consentDetails
            };
        }
        catch (error) {
            this.logger.error('Error checking user consent:', error);
            throw new Error('Failed to check user consent');
        }
    }
    /**
     * Get user consent history
     */
    async getUserConsentHistory(userId) {
        try {
            const consents = await this.prisma.consentRecord.findMany({
                where: { userId },
                orderBy: { consentDate: 'desc' }
            });
            return consents.map(r => ({
                userId: r.userId,
                documentType: r.consentType,
                documentVersion: r.version,
                consentGiven: r.consentGiven,
                consentDate: r.consentDate,
                ipAddress: r.ipAddress || '',
                userAgent: r.userAgent || '',
                consentMethod: ConsentMethod.BUTTON_CLICK
            }));
        }
        catch (error) {
            this.logger.error('Error fetching user consent history:', error);
            throw new Error('Failed to fetch user consent history');
        }
    }
    /**
     * Revoke user consent (for GDPR compliance)
     */
    async revokeUserConsent(userId, documentType) {
        try {
            await this.prisma.userConsent.updateMany({
                where: {
                    userId,
                    documentType
                },
                data: {
                    consentGiven: false,
                    consentDate: new Date()
                }
            });
            this.logger.info(`User consent revoked: ${userId} - ${documentType}`);
            return true;
        }
        catch (error) {
            this.logger.error('Error revoking user consent:', error);
            return false;
        }
    }
    /**
     * Generate consent summary for user export (GDPR)
     */
    async generateConsentSummary(userId) {
        try {
            const allConsents = await this.getUserConsentHistory(userId);
            const consentsByType = new Map();
            allConsents.forEach(consent => {
                if (!consentsByType.has(consent.documentType)) {
                    consentsByType.set(consent.documentType, []);
                }
                consentsByType.get(consent.documentType).push(consent);
            });
            const consents = Array.from(consentsByType.entries()).map(([type, history]) => ({
                documentType: type,
                currentConsent: history[0]?.consentGiven || false,
                lastConsentDate: history[0]?.consentDate || new Date(),
                consentHistory: history
            }));
            return {
                userId,
                exportDate: new Date(),
                consents
            };
        }
        catch (error) {
            this.logger.error('Error generating consent summary:', error);
            throw new Error('Failed to generate consent summary');
        }
    }
    /**
     * Get document version history
     */
    async getDocumentVersionHistory(documentId) {
        // DocumentVersion is not persisted in current schema; return empty history
        return [];
    }
    /**
     * Cleanup old document versions (retention policy)
     */
    async cleanupOldVersions(retentionDays = 2555) {
        // No-op: DocumentVersion not stored in DB in current schema
        return 0;
    }
}
exports.LegalDocumentationService = LegalDocumentationService;
//# sourceMappingURL=legalDocumentationService.js.map