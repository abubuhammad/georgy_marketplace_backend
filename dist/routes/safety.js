"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyRoutes = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const userSafetyService_1 = require("../services/userSafetyService");
const platformSecurityService_1 = require("../services/platformSecurityService");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
exports.safetyRoutes = router;
const prisma = new client_1.PrismaClient();
const safetyService = new userSafetyService_1.UserSafetyService(prisma, logger_1.logger);
const securityService = new platformSecurityService_1.PlatformSecurityService(prisma, logger_1.logger);
// User Safety Routes
router.get('/profile/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Check if user can access this data (admin or own data)
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const profile = await safetyService.getSafetyProfile(userId);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.put('/profile/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Check if user can update this data (admin or own data)
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const profile = await safetyService.updateSafetyProfile(userId, req.body);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/verification/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Check if user can access this data (admin or own data)
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const verification = await safetyService.getUserVerificationStatus(userId);
        res.json({ success: true, data: verification });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/verify-identity', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { verificationData } = req.body;
        const result = await safetyService.verifyIdentity(userId, verificationData);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/background-check', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { requestData } = req.body;
        const result = await safetyService.requestBackgroundCheck(userId, requestData);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/report-user', auth_1.authenticateToken, async (req, res) => {
    try {
        const reporterId = req.user?.id;
        if (!reporterId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { reportedUserId, category, reason, evidence } = req.body;
        const report = await safetyService.reportUser(reporterId, reportedUserId, {
            category,
            reason,
            evidence
        });
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/safety-incident', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const incidentData = req.body;
        const incident = await safetyService.reportSafetyIncident(userId, incidentData);
        res.json({ success: true, data: incident });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/emergency-contact', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { contactData } = req.body;
        const result = await safetyService.setEmergencyContact(userId, contactData);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/safety-score/:userId', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;
        // Check if user can access this data (admin or own data)
        if (req.user?.id !== userId && req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        const score = await safetyService.calculateSafetyScore(userId);
        res.json({ success: true, data: { safetyScore: score } });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/trigger-emergency', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'User not authenticated' });
        }
        const { location, situation } = req.body;
        const result = await safetyService.triggerEmergencyProtocol(userId, location, situation);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Security Routes (Admin only)
router.get('/security/audits', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { page = 1, limit = 20, type, status } = req.query;
        const audits = await securityService.getSecurityAudits({
            page: Number(page),
            limit: Number(limit),
            filters: { type: type, status: status }
        });
        res.json({ success: true, data: audits });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/security/audit', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const auditData = req.body;
        const audit = await securityService.createSecurityAudit(auditData);
        res.json({ success: true, data: audit });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/security/incidents', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { page = 1, limit = 20, severity, status } = req.query;
        const incidents = await securityService.getSecurityIncidents({
            page: Number(page),
            limit: Number(limit),
            filters: { severity: severity, type: status }
        });
        res.json({ success: true, data: incidents });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.post('/security/incident', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const incidentData = req.body;
        const incident = await securityService.reportSecurityIncident(incidentData);
        res.json({ success: true, data: incident });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
router.get('/security/report', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Admin access required' });
        }
        const { startDate, endDate, type } = req.query;
        const startDateValue = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const endDateValue = endDate ? new Date(endDate) : new Date();
        const report = await securityService.generateSecurityReport(startDateValue, endDateValue);
        res.json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
//# sourceMappingURL=safety.js.map