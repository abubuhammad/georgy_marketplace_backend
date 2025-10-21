"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moderationRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const contentModerationService_1 = require("../services/contentModerationService");
const userTrustService_1 = require("../services/userTrustService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.moderationRoutes = router;
const prisma = new client_1.PrismaClient();
const moderationService = new contentModerationService_1.ContentModerationService(prisma, logger_1.logger);
const trustService = new userTrustService_1.UserTrustService(prisma, logger_1.logger);
// Content Moderation Routes
router.post('/content/flag', auth_1.authenticateToken, async (req, res) => {
    try {
        const { contentType, contentId, reason, flaggedBy } = req.body;
        const userId = req.user?.id || flaggedBy;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        // First ensure content item exists or create it
        let contentItem = await prisma.contentItem.findFirst({
            where: { itemId: contentId }
        });
        if (!contentItem) {
            contentItem = await prisma.contentItem.create({
                data: {
                    itemId: contentId,
                    contentType: contentType,
                    content: reason || 'Flagged content',
                    authorId: userId,
                    status: 'pending',
                    createdAt: new Date()
                }
            });
        }
        const result = await moderationService.flagContent({
            contentItemId: contentItem.id,
            flagType: 'INAPPROPRIATE_CONTENT',
            reason,
            severity: 'MEDIUM',
            flaggedBy: userId
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/content/:contentId/status', async (req, res) => {
    try {
        const contentId = req.params.contentId;
        const status = await moderationService.getContentModerationStatus(contentId);
        res.json({ success: true, data: status });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/content/moderate', auth_1.authenticateToken, async (req, res) => {
    try {
        const { contentType, contentId, content, authorId } = req.body;
        const result = await moderationService.moderateContent({
            contentType,
            contentId,
            content,
            authorId
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Admin Moderation Routes
router.get('/admin/queue', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { page = 1, limit = 20, priority, status } = req.query;
        const queue = await moderationService.getModerationQueue({
            page: Number(page),
            limit: Number(limit),
            filters: {
                priority: priority,
                status: status
            }
        });
        res.json({ success: true, data: queue });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/admin/queue/:queueId/assign', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const queueId = req.params.queueId;
        const { assignedTo } = req.body;
        const result = await moderationService.assignModerationTask(queueId, assignedTo);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/admin/review', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const reviewerId = req.user?.id;
        if (!reviewerId) {
            return res.status(401).json({ success: false, error: 'Reviewer not authenticated' });
        }
        const { contentId, decision, reason, actionType } = req.body;
        const result = await moderationService.reviewContent({
            reviewerId,
            contentItemId: contentId,
            decision,
            confidence: 'HIGH',
            reasoning: reason,
            actionsTaken: [actionType || 'approve'],
            reviewTime: 60, // Default 60 seconds
            verifiedAt: new Date()
        });
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/admin/rules', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { category, active } = req.query;
        const rules = await moderationService.getModerationRules({
            category: category,
            active: active === 'true'
        });
        res.json({ success: true, data: rules });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/admin/rules', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const createdBy = req.user?.id;
        if (!createdBy) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const ruleData = { ...req.body, createdBy };
        const rule = await moderationService.createModerationRule(ruleData);
        res.json({ success: true, data: rule });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/admin/rules/:ruleId', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const ruleId = req.params.ruleId;
        const updates = req.body;
        const rule = await moderationService.updateModerationRule(ruleId, updates);
        res.json({ success: true, data: rule });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/admin/reports', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { startDate, endDate, type } = req.query;
        const startDateValue = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDateValue = endDate ? new Date(endDate) : new Date();
        const report = await moderationService.generateModerationReport(startDateValue, endDateValue);
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// User Trust Routes
router.get('/trust/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const profile = await trustService.getTrustProfile(userId);
        if (!profile) {
            return res.status(404).json({ success: false, error: 'Trust profile not found' });
        }
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/trust/:userId/score', async (req, res) => {
    try {
        const userId = req.params.userId;
        const score = await trustService.calculateTrustScore(userId);
        res.json({ success: true, data: { trustScore: score } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/trust/:userId/endorse', auth_1.authenticateToken, async (req, res) => {
    try {
        const endorserId = req.user?.id;
        const endorseeId = req.params.userId;
        if (!endorserId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        if (endorserId === endorseeId) {
            return res.status(400).json({ success: false, error: 'Cannot endorse yourself' });
        }
        const { category, rating, comment, relatedOrder } = req.body;
        const endorsement = await trustService.addEndorsement({
            endorserId,
            endorseeId,
            category,
            rating,
            comment,
            relatedOrder
        });
        res.json({ success: true, data: endorsement });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/trust/:userId/endorsements', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { page = 1, limit = 20, category } = req.query;
        const endorsements = await trustService.getUserEndorsements(userId, {
            page: Number(page),
            limit: Number(limit),
            filters: { category: category }
        });
        res.json({ success: true, data: endorsements });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/trust/:userId/risk-assessment', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const userId = req.params.userId;
        const assessment = await trustService.assessUserRisk(userId);
        res.json({ success: true, data: assessment });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/trust/:userId/verify-authenticity', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const userId = req.params.userId;
        const { contentType, contentId } = req.body;
        const result = await trustService.verifyContentAuthenticity(userId, contentType, contentId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/trust/reports/overview', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { startDate, endDate } = req.query;
        const report = await trustService.generatePlatformTrustReport({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
//# sourceMappingURL=moderation.js.map