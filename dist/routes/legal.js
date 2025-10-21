"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.legalRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const legalDocumentationService_1 = require("../services/legalDocumentationService");
const gdprComplianceService_1 = require("../services/gdprComplianceService");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const router = (0, express_1.Router)();
exports.legalRoutes = router;
const legalService = new legalDocumentationService_1.LegalDocumentationService(prisma_1.default, logger_1.default);
const gdprService = new gdprComplianceService_1.GDPRComplianceService(prisma_1.default, logger_1.default);
// Legal Documentation Routes
router.get('/documents', async (req, res) => {
    try {
        const { type, language = 'en', jurisdiction = 'default' } = req.query;
        let documents;
        if (type) {
            const doc = await legalService.getActiveDocument(type, language, jurisdiction);
            documents = doc ? [doc] : [];
        }
        else {
            documents = await legalService.getAllActiveDocuments(language, jurisdiction);
        }
        res.json({ success: true, data: documents });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/documents/:id', async (req, res) => {
    try {
        const document = await prisma_1.default.legalDocument.findUnique({ where: { id: req.params.id } });
        if (!document) {
            return res.status(404).json({ success: false, error: 'Document not found' });
        }
        res.json({ success: true, data: document });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/consent', auth_1.authenticateToken, async (req, res) => {
    try {
        const { documentType, documentVersion, consentGiven, consentMethod = legalDocumentationService_1.ConsentMethod.BUTTON_CLICK } = req.body;
        const userId = req.user?.id;
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
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/consent/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const authUser = req.user;
        // Check if user can access this data (admin or own data)
        if (authUser?.id !== userId && authUser?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const consents = await legalService.getUserConsentHistory(userId);
        res.json({ success: true, data: consents });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// GDPR Routes
router.post('/gdpr/export-request', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const request = await gdprService.requestDataExport(userId, req.body.requestType);
        res.json({ success: true, data: request });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/gdpr/deletion-request', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { reason, deletionMethod = gdprComplianceService_1.DeletionMethod.SOFT_DELETE } = req.body;
        const request = await gdprService.requestDataDeletion(userId, reason, deletionMethod);
        res.json({ success: true, data: request });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/gdpr/requests/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const authUser = req.user;
        // Check if user can access this data (admin or own data)
        if (authUser?.id !== userId && authUser?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        // Fetch requests from GDPRRequest table
        const requests = await prisma_1.default.gDPRRequest.findMany({ where: { userId } });
        res.json({ success: true, data: requests });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/privacy-settings/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const authUser = req.user;
        // Check if user can access this data (admin or own data)
        if (authUser?.id !== userId && authUser?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const settings = await prisma_1.default.userPrivacySettings.findUnique({ where: { userId } });
        res.json({ success: true, data: settings });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/privacy-settings/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        const authUser = req.user;
        // Check if user can update this data (admin or own data)
        if (authUser?.id !== userId && authUser?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const settings = await prisma_1.default.userPrivacySettings.upsert({
            where: { userId },
            create: { userId, ...req.body },
            update: { ...req.body }
        });
        res.json({ success: true, data: settings });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
//# sourceMappingURL=legal.js.map