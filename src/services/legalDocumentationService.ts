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

enum LegalDocumentType {
  TERMS_OF_SERVICE = 'terms_of_service',
  PRIVACY_POLICY = 'privacy_policy',
  COOKIE_POLICY = 'cookie_policy',
  REFUND_POLICY = 'refund_policy',
  USER_AGREEMENT = 'user_agreement',
  SELLER_AGREEMENT = 'seller_agreement',
  DELIVERY_TERMS = 'delivery_terms',
  DATA_PROCESSING_AGREEMENT = 'data_processing_agreement'
}

enum ConsentMethod {
  CHECKBOX = 'checkbox',
  BUTTON_CLICK = 'button_click',
  ELECTRONIC_SIGNATURE = 'electronic_signature',
  EMAIL_CONFIRMATION = 'email_confirmation'
}

export class LegalDocumentationService {
  private prisma: PrismaClient;
  private logger: Logger;

  constructor(prisma: PrismaClient, logger: Logger) {
    this.prisma = prisma;
    this.logger = logger;
  }

  /**
   * Create or update a legal document
   */
  async createOrUpdateDocument(document: Omit<LegalDocument, 'id' | 'lastModified'>): Promise<LegalDocument> {
    // No LegalDocument model in current Prisma schema; persist not supported.
    this.logger.warn('createOrUpdateDocument called but LegalDocument model is not available in schema');
    return { ...document, lastModified: new Date() } as LegalDocument;
  }

  /**
   * Get active legal document
   */
  async getActiveDocument(
    type: LegalDocumentType, 
    language = 'en', 
    jurisdiction = 'default'
  ): Promise<LegalDocument | null> {
    // Not backed by DB; return null to indicate not found in current schema
    return null;
  }

  /**
   * Get all active documents for user consent check
   */
  async getAllActiveDocuments(language = 'en', jurisdiction = 'default'): Promise<LegalDocument[]> {
    // Not backed by DB; return empty list
    return [];
  }

  /**
   * Create document version history
   */
  async createDocumentVersion(version: Omit<DocumentVersion, 'id'>): Promise<DocumentVersion> {
    // Not backed by DB; return the payload
    return version as DocumentVersion;
  }

  /**
   * Record user consent
   */
  async recordUserConsent(consent: Omit<UserConsent, 'id'>): Promise<UserConsent> {
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
      } as UserConsent;
    } catch (error) {
      this.logger.error('Error recording user consent:', error);
      throw new Error('Failed to record user consent');
    }
  }

  /**
   * Check if user has given consent for required documents
   */
  async checkUserConsent(userId: string): Promise<{
    hasAllRequiredConsents: boolean;
    missingConsents: LegalDocumentType[];
    consentDetails: UserConsent[];
  }> {
    try {
      const requiredDocuments = [
        LegalDocumentType.TERMS_OF_SERVICE,
        LegalDocumentType.PRIVACY_POLICY
      ];

      const records = await this.prisma.consentRecord.findMany({
        where: { userId, consentGiven: true }
      });

      const consentedDocuments = records.map(r => r.consentType as LegalDocumentType);
      const missingConsents = requiredDocuments.filter(
        doc => !consentedDocuments.includes(doc)
      );

      const consentDetails: UserConsent[] = records.map(r => ({
        userId: r.userId,
        documentType: r.consentType as LegalDocumentType,
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
    } catch (error) {
      this.logger.error('Error checking user consent:', error);
      throw new Error('Failed to check user consent');
    }
  }

  /**
   * Get user consent history
   */
  async getUserConsentHistory(userId: string): Promise<UserConsent[]> {
    try {
      const consents = await this.prisma.consentRecord.findMany({
        where: { userId },
        orderBy: { consentDate: 'desc' }
      });

      return consents.map(r => ({
        userId: r.userId,
        documentType: r.consentType as LegalDocumentType,
        documentVersion: r.version,
        consentGiven: r.consentGiven,
        consentDate: r.consentDate,
        ipAddress: r.ipAddress || '',
        userAgent: r.userAgent || '',
        consentMethod: ConsentMethod.BUTTON_CLICK
      }));
    } catch (error) {
      this.logger.error('Error fetching user consent history:', error);
      throw new Error('Failed to fetch user consent history');
    }
  }

  /**
   * Revoke user consent (for GDPR compliance)
   */
  async revokeUserConsent(userId: string, documentType: LegalDocumentType): Promise<boolean> {
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
    } catch (error) {
      this.logger.error('Error revoking user consent:', error);
      return false;
    }
  }

  /**
   * Generate consent summary for user export (GDPR)
   */
  async generateConsentSummary(userId: string): Promise<{
    userId: string;
    exportDate: Date;
    consents: {
      documentType: string;
      currentConsent: boolean;
      lastConsentDate: Date;
      consentHistory: UserConsent[];
    }[];
  }> {
    try {
      const allConsents = await this.getUserConsentHistory(userId);
      const consentsByType = new Map<LegalDocumentType, UserConsent[]>();

      allConsents.forEach(consent => {
        if (!consentsByType.has(consent.documentType)) {
          consentsByType.set(consent.documentType, []);
        }
        consentsByType.get(consent.documentType)!.push(consent);
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
    } catch (error) {
      this.logger.error('Error generating consent summary:', error);
      throw new Error('Failed to generate consent summary');
    }
  }

  /**
   * Get document version history
   */
  async getDocumentVersionHistory(documentId: string): Promise<DocumentVersion[]> {
    // DocumentVersion is not persisted in current schema; return empty history
    return [];
  }

  /**
   * Cleanup old document versions (retention policy)
   */
  async cleanupOldVersions(retentionDays: number = 2555): Promise<number> { // 7 years default
    // No-op: DocumentVersion not stored in DB in current schema
    return 0;
  }
}

export { LegalDocumentType, ConsentMethod };
export type { LegalDocument, DocumentVersion, UserConsent };
