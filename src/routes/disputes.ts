import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { DisputeResolutionService } from '../services/disputeResolutionService';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const disputeService = new DisputeResolutionService(prisma, logger);

// Dispute Management Routes
router.post('/create', authenticateToken, async (req, res) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { page = 1, limit = 20, status, type } = req.query;
    const disputes = await disputeService.getUserDisputes(userId, {
      page: Number(page),
      limit: Number(limit),
      filters: { status: status as string, type: type as string }
    });
    
    res.json({ success: true, data: disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:disputeId', authenticateToken, async (req, res) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:disputeId/evidence', authenticateToken, async (req, res) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:disputeId/messages', authenticateToken, async (req, res) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:disputeId/messages', authenticateToken, async (req, res) => {
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:disputeId/mediation', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const disputeId = req.params.disputeId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const mediationData = req.body;
    const mediation = await disputeService.scheduleMediation(disputeId, mediationData);
    res.json({ success: true, data: mediation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:disputeId/resolve', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const disputeId = req.params.disputeId;
    const resolution = req.body;
    
    const result = await disputeService.resolveDispute(disputeId, resolution);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:disputeId/escalate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const disputeId = req.params.disputeId;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { reason } = req.body;
    const result = await disputeService.escalateDispute(disputeId, reason, userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Routes
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { page = 1, limit = 20, status, priority, type } = req.query;
    const disputes = await disputeService.getAllDisputes({
      page: Number(page),
      limit: Number(limit),
      filters: { 
        status: status as string, 
        priority: priority as string,
        type: type as string
      }
    });
    
    res.json({ success: true, data: disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:disputeId/assign', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const disputeId = req.params.disputeId;
    const { assignedTo } = req.body;
    
    const result = await disputeService.assignDispute(disputeId, assignedTo);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/metrics/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;
    const startDateValue = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDateValue = endDate ? new Date(endDate as string) : new Date();
    const metrics = await disputeService.getDisputeMetrics(startDateValue, endDateValue);
    
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as disputeRoutes };
