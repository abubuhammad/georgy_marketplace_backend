"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.disputeRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const disputeResolutionService_1 = require("../services/disputeResolutionService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.disputeRoutes = router;
const prisma = new client_1.PrismaClient();
const disputeService = new disputeResolutionService_1.DisputeResolutionService(prisma, logger_1.logger);
// Dispute Management Routes
router.post('/create', auth_1.authenticateToken, async (req, res) => {
    try {
        const claimantId = req.user?.id;
        if (!claimantId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const disputeData = {
            ...req.body,
            claimantId
        };
        const dispute = await disputeService.createDispute(disputeData);
        res.json({ success: true, data: dispute });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/list', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { page = 1, limit = 20, status, type } = req.query;
        const disputes = await disputeService.getUserDisputes(userId, {
            page: Number(page),
            limit: Number(limit),
            filters: { status: status, type: type }
        });
        res.json({ success: true, data: disputes });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/:disputeId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const disputeId = req.params.disputeId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const dispute = await disputeService.getDispute(disputeId);
        if (!dispute) {
            return res.status(404).json({ success: false, error: 'Dispute not found' });
        }
        // Check if user has access to this dispute
        const canAccess = dispute.claimantId === userId ||
            dispute.respondentId === userId ||
            req.user?.role === 'admin';
        if (!canAccess) {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        res.json({ success: true, data: dispute });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/:disputeId/evidence', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const disputeId = req.params.disputeId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const evidence = {
            ...req.body,
            submittedBy: userId
        };
        const result = await disputeService.addEvidence(disputeId, evidence);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/:disputeId/messages', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const disputeId = req.params.disputeId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const messageData = {
            ...req.body,
            senderId: userId
        };
        const message = await disputeService.sendMessage(disputeId, messageData);
        res.json({ success: true, data: message });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/:disputeId/messages', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const disputeId = req.params.disputeId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { page = 1, limit = 50 } = req.query;
        const messages = await disputeService.getDisputeMessages(disputeId, {
            page: Number(page),
            limit: Number(limit)
        });
        res.json({ success: true, data: messages });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/:disputeId/mediation', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const disputeId = req.params.disputeId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const mediationData = req.body;
        const mediation = await disputeService.scheduleMediation(disputeId, mediationData);
        res.json({ success: true, data: mediation });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/:disputeId/resolve', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const disputeId = req.params.disputeId;
        const resolution = req.body;
        const result = await disputeService.resolveDispute(disputeId, resolution);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/:disputeId/escalate', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const disputeId = req.params.disputeId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { reason } = req.body;
        const result = await disputeService.escalateDispute(disputeId, reason, userId);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Admin Routes
router.get('/admin/all', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { page = 1, limit = 20, status, priority, type } = req.query;
        const disputes = await disputeService.getAllDisputes({
            page: Number(page),
            limit: Number(limit),
            filters: {
                status: status,
                priority: priority,
                type: type
            }
        });
        res.json({ success: true, data: disputes });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/:disputeId/assign', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const disputeId = req.params.disputeId;
        const { assignedTo } = req.body;
        const result = await disputeService.assignDispute(disputeId, assignedTo);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/metrics/overview', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { startDate, endDate } = req.query;
        const startDateValue = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDateValue = endDate ? new Date(endDate) : new Date();
        const metrics = await disputeService.getDisputeMetrics(startDateValue, endDateValue);
        res.json({ success: true, data: metrics });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
//# sourceMappingURL=disputes.js.map