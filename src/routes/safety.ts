import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { UserSafetyService } from '../services/userSafetyService';
import { PlatformSecurityService } from '../services/platformSecurityService';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const safetyService = new UserSafetyService(prisma, logger);
const securityService = new PlatformSecurityService(prisma, logger);

// User Safety Routes
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user can access this data (admin or own data)
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const profile = await safetyService.getSafetyProfile(userId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user can update this data (admin or own data)
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const profile = await safetyService.updateSafetyProfile(userId, req.body);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/verification/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user can access this data (admin or own data)
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const verification = await safetyService.getUserVerificationStatus(userId);
    res.json({ success: true, data: verification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/verify-identity', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { verificationData } = req.body;
    const result = await safetyService.verifyIdentity(userId, verificationData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/background-check', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { requestData } = req.body;
    const result = await safetyService.requestBackgroundCheck(userId, requestData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/report-user', authenticateToken, async (req, res) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/safety-incident', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const incidentData = req.body;
    const incident = await safetyService.reportSafetyIncident(userId, incidentData);
    res.json({ success: true, data: incident });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/emergency-contact', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { contactData } = req.body;
    const result = await safetyService.setEmergencyContact(userId, contactData);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/safety-score/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user can access this data (admin or own data)
    if (req.user?.id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const score = await safetyService.calculateSafetyScore(userId);
    res.json({ success: true, data: { safetyScore: score } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/trigger-emergency', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { location, situation } = req.body;
    const result = await safetyService.triggerEmergencyProtocol(userId, location, situation);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Security Routes (Admin only)
router.get('/security/audits', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { page = 1, limit = 20, type, status } = req.query;
    const audits = await securityService.getSecurityAudits({
      page: Number(page),
      limit: Number(limit),
      filters: { type: type as string, status: status as string }
    });
    
    res.json({ success: true, data: audits });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/security/audit', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const auditData = req.body;
    const audit = await securityService.createSecurityAudit(auditData);
    res.json({ success: true, data: audit });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/security/incidents', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { page = 1, limit = 20, severity, status } = req.query;
    const incidents = await securityService.getSecurityIncidents({
      page: Number(page),
      limit: Number(limit),
      filters: { severity: severity as string, type: status as string }
    });
    
    res.json({ success: true, data: incidents });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/security/incident', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const incidentData = req.body;
    const incident = await securityService.reportSecurityIncident(incidentData);
    res.json({ success: true, data: incident });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/security/report', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { startDate, endDate, type } = req.query;
    const startDateValue = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDateValue = endDate ? new Date(endDate as string) : new Date();
    const report = await securityService.generateSecurityReport(
      startDateValue,
      endDateValue
    );
    
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as safetyRoutes };
