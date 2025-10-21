import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
interface LegalDocument {
    id?: string;
    type: LegalDocumentType;
    title: string;
    content: string;
    version: string;
    isActive: boolean;
    effectiveDate: Date;
    lastModified: Date;
    modifiedBy: string;
    language: string;
    jurisdiction: string;
}
interface DocumentVersion {
    id?: string;
    documentId: string;
    version: string;
    content: string;
    changes: string;
    createdAt: Date;
    createdBy: string;
}
interface UserConsent {
    id?: string;
    userId: string;
    documentType: LegalDocumentType;
    documentVersion: string;
    consentGiven: boolean;
    consentDate: Date;
    ipAddress: string;
    userAgent: string;
    consentMethod: ConsentMethod;
}
declare enum LegalDocumentType {
    TERMS_OF_SERVICE = "terms_of_service",
    PRIVACY_POLICY = "privacy_policy",
    COOKIE_POLICY = "cookie_policy",
    REFUND_POLICY = "refund_policy",
    USER_AGREEMENT = "user_agreement",
    SELLER_AGREEMENT = "seller_agreement",
    DELIVERY_TERMS = "delivery_terms",
    DATA_PROCESSING_AGREEMENT = "data_processing_agreement"
}
declare enum ConsentMethod {
    CHECKBOX = "checkbox",
    BUTTON_CLICK = "button_click",
    ELECTRONIC_SIGNATURE = "electronic_signature",
    EMAIL_CONFIRMATION = "email_confirmation"
}
export declare class LegalDocumentationService {
    private prisma;
    private logger;
    constructor(prisma: PrismaClient, logger: Logger);
    /**
     * Create or update a legal document
     */
    createOrUpdateDocument(document: Omit<LegalDocument, 'id' | 'lastModified'>): Promise<LegalDocument>;
    /**
     * Get active legal document
     */
    getActiveDocument(type: LegalDocumentType, language?: string, jurisdiction?: string): Promise<LegalDocument | null>;
    /**
     * Get all active documents for user consent check
     */
    getAllActiveDocuments(language?: string, jurisdiction?: string): Promise<LegalDocument[]>;
    /**
     * Create document version history
     */
    createDocumentVersion(version: Omit<DocumentVersion, 'id'>): Promise<DocumentVersion>;
    /**
     * Record user consent
     */
    recordUserConsent(consent: Omit<UserConsent, 'id'>): Promise<UserConsent>;
    /**
     * Check if user has given consent for required documents
     */
    checkUserConsent(userId: string): Promise<{
        hasAllRequiredConsents: boolean;
        missingConsents: LegalDocumentType[];
        consentDetails: UserConsent[];
    }>;
    /**
     * Get user consent history
     */
    getUserConsentHistory(userId: string): Promise<UserConsent[]>;
    /**
     * Revoke user consent (for GDPR compliance)
     */
    revokeUserConsent(userId: string, documentType: LegalDocumentType): Promise<boolean>;
    /**
     * Generate consent summary for user export (GDPR)
     */
    generateConsentSummary(userId: string): Promise<{
        userId: string;
        exportDate: Date;
        consents: {
            documentType: string;
            currentConsent: boolean;
            lastConsentDate: Date;
            consentHistory: UserConsent[];
        }[];
    }>;
    /**
     * Get document version history
     */
    getDocumentVersionHistory(documentId: string): Promise<DocumentVersion[]>;
    /**
     * Cleanup old document versions (retention policy)
     */
    cleanupOldVersions(retentionDays?: number): Promise<number>;
}
export { LegalDocumentType, ConsentMethod };
export type { LegalDocument, DocumentVersion, UserConsent };
//# sourceMappingURL=legalDocumentationService.d.ts.map