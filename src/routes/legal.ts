import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { LegalDocumentationService, LegalDocumentType, ConsentMethod } from '../services/legalDocumentationService';
import { GDPRComplianceService, ExportRequestType, DeletionMethod } from '../services/gdprComplianceService';
import logger from '../utils/logger';
import prisma from '../utils/prisma';

const router = Router();

const legalService = new LegalDocumentationService(prisma, logger);
const gdprService = new GDPRComplianceService(prisma, logger);

// Legal Documentation Routes
router.get('/documents', async (req, res) => {
  try {
    const { type, language = 'en', jurisdiction = 'default' } = req.query as any;
    let documents;
    if (type) {
      const doc = await legalService.getActiveDocument(type as LegalDocumentType, language, jurisdiction);
      documents = doc ? [doc] : [];
    } else {
      documents = await legalService.getAllActiveDocuments(language, jurisdiction);
    }
    res.json({ success: true, data: documents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/documents/:id', async (req, res) => {
  try {
    const document = await prisma.legalDocument.findUnique({ where: { id: req.params.id } });
    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    res.json({ success: true, data: document });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/consent', authenticateToken, async (req, res) => {
  try {
    const { documentType, documentVersion, consentGiven, consentMethod = ConsentMethod.BUTTON_CLICK } = req.body;
    const userId = (req as any).user?.id as string | undefined;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const consent = await legalService.recordUserConsent({
      userId,
      documentType,
      documentVersion,
      consentGiven,
      consentDate: new Date(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || '',
      consentMethod
    });
    
    res.json({ success: true, data: consent });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/consent/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const authUser = (req as any).user;
    
    // Check if user can access this data (admin or own data)
    if (authUser?.id !== userId && authUser?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const consents = await legalService.getUserConsentHistory(userId);
    res.json({ success: true, data: consents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GDPR Routes
router.post('/gdpr/export-request', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const request = await gdprService.requestDataExport(userId, req.body.requestType as ExportRequestType);
    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/gdpr/deletion-request', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { reason, deletionMethod = DeletionMethod.SOFT_DELETE } = req.body;
    const request = await gdprService.requestDataDeletion(userId, reason, deletionMethod);
    res.json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/gdpr/requests/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const authUser = (req as any).user;
    
    // Check if user can access this data (admin or own data)
    if (authUser?.id !== userId && authUser?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Fetch requests from GDPRRequest table
    const requests = await prisma.gDPRRequest.findMany({ where: { userId } });
    res.json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/privacy-settings/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const authUser = (req as any).user;
    
    // Check if user can access this data (admin or own data)
    if (authUser?.id !== userId && authUser?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const settings = await prisma.userPrivacySettings.findUnique({ where: { userId } });
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/privacy-settings/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    const authUser = (req as any).user;
    
    // Check if user can update this data (admin or own data)
    if (authUser?.id !== userId && authUser?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const settings = await prisma.userPrivacySettings.upsert({
      where: { userId },
      create: { userId, ...req.body },
      update: { ...req.body }
    });
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as legalRoutes };
