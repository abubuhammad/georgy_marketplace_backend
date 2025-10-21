import express from 'express';
import { DeliveryAnalyticsService, AnalyticsTimeframe, AnalyticsFilters } from '../services/deliveryAnalyticsService';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleAuth';

const router = express.Router();

// Middleware - require admin or delivery manager roles
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'DELIVERY_MANAGER']));

/**
 * @route GET /api/delivery-analytics
 * @desc Get comprehensive delivery analytics data
 * @access Admin, Delivery Manager
 * @query timeframe.start - Start date (ISO string)
 * @query timeframe.end - End date (ISO string)
 * @query partnerId - Filter by partner ID
 * @query agentId - Filter by agent ID
 * @query zoneId - Filter by zone ID
 * @query deliveryType - Filter by delivery type
 * @query status - Filter by shipment status
 */
router.get('/', async (req, res) => {
  try {
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate,
      partnerId,
      agentId,
      zoneId,
      deliveryType,
      status
    } = req.query;

    // Default timeframe: last 30 days
    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = {};
    if (partnerId) filters.partnerId = partnerId as string;
    if (agentId) filters.agentId = agentId as string;
    if (zoneId) filters.zoneId = zoneId as string;
    if (deliveryType) filters.deliveryType = deliveryType as string;
    if (status) filters.status = status as any;

    const result = await DeliveryAnalyticsService.getDeliveryAnalytics(timeframe, filters);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to get analytics data'
      });
    }

    res.json({
      success: true,
      data: result.data,
      timeframe,
      filters
    });

  } catch (error) {
    console.error('Error in delivery analytics route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/metrics
 * @desc Get core delivery metrics only
 * @access Admin, Delivery Manager
 */
router.get('/metrics', async (req, res) => {
  try {
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate,
      partnerId,
      agentId,
      zoneId,
      deliveryType,
      status
    } = req.query;

    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = {};
    if (partnerId) filters.partnerId = partnerId as string;
    if (agentId) filters.agentId = agentId as string;
    if (zoneId) filters.zoneId = zoneId as string;
    if (deliveryType) filters.deliveryType = deliveryType as string;
    if (status) filters.status = status as any;

    const metrics = await DeliveryAnalyticsService.calculateDeliveryMetrics(timeframe, filters);

    res.json({
      success: true,
      data: metrics,
      timeframe,
      filters
    });

  } catch (error) {
    console.error('Error getting delivery metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/agents
 * @desc Get agent performance data
 * @access Admin, Delivery Manager
 */
router.get('/agents', async (req, res) => {
  try {
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate,
      agentId,
      limit = '20',
      sortBy = 'successRate',
      sortOrder = 'desc'
    } = req.query;

    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = {};
    if (agentId) filters.agentId = agentId as string;

    const agentPerformance = await DeliveryAnalyticsService.getAgentPerformanceData(timeframe, filters);

    // Sort agents
    const sortField = sortBy as keyof typeof agentPerformance[0];
    agentPerformance.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      
      return 0;
    });

    // Limit results
    const limitedResults = agentPerformance.slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: limitedResults,
      total: agentPerformance.length,
      timeframe,
      filters
    });

  } catch (error) {
    console.error('Error getting agent performance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/zones
 * @desc Get zone performance data
 * @access Admin, Delivery Manager
 */
router.get('/zones', async (req, res) => {
  try {
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate,
      zoneId,
      limit = '10',
      sortBy = 'successRate',
      sortOrder = 'desc'
    } = req.query;

    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = {};
    if (zoneId) filters.zoneId = zoneId as string;

    const zonePerformance = await DeliveryAnalyticsService.getZonePerformanceData(timeframe, filters);

    // Sort zones
    const sortField = sortBy as keyof typeof zonePerformance[0];
    zonePerformance.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      
      return 0;
    });

    // Limit results
    const limitedResults = zonePerformance.slice(0, parseInt(limit as string));

    res.json({
      success: true,
      data: limitedResults,
      total: zonePerformance.length,
      timeframe,
      filters
    });

  } catch (error) {
    console.error('Error getting zone performance:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/trends
 * @desc Get time series data for trends
 * @access Admin, Delivery Manager
 */
router.get('/trends', async (req, res) => {
  try {
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate,
      partnerId,
      agentId,
      zoneId,
      deliveryType,
      granularity = 'daily'
    } = req.query;

    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = {};
    if (partnerId) filters.partnerId = partnerId as string;
    if (agentId) filters.agentId = agentId as string;
    if (zoneId) filters.zoneId = zoneId as string;
    if (deliveryType) filters.deliveryType = deliveryType as string;

    const timeSeriesData = await DeliveryAnalyticsService.getTimeSeriesData(timeframe, filters);

    res.json({
      success: true,
      data: timeSeriesData,
      timeframe,
      filters,
      granularity
    });

  } catch (error) {
    console.error('Error getting trends data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/insights
 * @desc Get AI-powered delivery insights
 * @access Admin, Delivery Manager
 */
router.get('/insights', async (req, res) => {
  try {
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate,
      partnerId,
      agentId,
      zoneId,
      deliveryType,
      category,
      priority
    } = req.query;

    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = {};
    if (partnerId) filters.partnerId = partnerId as string;
    if (agentId) filters.agentId = agentId as string;
    if (zoneId) filters.zoneId = zoneId as string;
    if (deliveryType) filters.deliveryType = deliveryType as string;

    let insights = await DeliveryAnalyticsService.generateInsights(timeframe, filters);

    // Filter insights by category
    if (category) {
      insights = insights.filter(insight => insight.category === category);
    }

    // Filter insights by priority
    if (priority) {
      insights = insights.filter(insight => insight.priority === priority);
    }

    res.json({
      success: true,
      data: insights,
      timeframe,
      filters
    });

  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/realtime
 * @desc Get real-time delivery metrics
 * @access Admin, Delivery Manager
 */
router.get('/realtime', async (req, res) => {
  try {
    const realtimeMetrics = await DeliveryAnalyticsService.getRealtimeMetrics();

    res.json({
      success: true,
      data: realtimeMetrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting realtime metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/export
 * @desc Export analytics data
 * @access Admin, Delivery Manager
 */
router.get('/export', async (req, res) => {
  try {
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate,
      partnerId,
      agentId,
      zoneId,
      deliveryType,
      format = 'csv'
    } = req.query;

    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = {};
    if (partnerId) filters.partnerId = partnerId as string;
    if (agentId) filters.agentId = agentId as string;
    if (zoneId) filters.zoneId = zoneId as string;
    if (deliveryType) filters.deliveryType = deliveryType as string;

    const exportResult = await DeliveryAnalyticsService.exportAnalyticsData(
      timeframe, 
      filters, 
      format as 'csv' | 'excel'
    );

    if (!exportResult.success) {
      return res.status(400).json({
        success: false,
        message: exportResult.error || 'Failed to export data'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);

    res.send(exportResult.data);

  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/agent/:agentId
 * @desc Get detailed analytics for a specific agent
 * @access Admin, Delivery Manager, Agent (own data)
 */
router.get('/agent/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate
    } = req.query;

    // Check if user can access this agent's data
    const userRole = (req as any).user?.role;
    const userId = (req as any).user?.id;
    
    // Allow agents to view their own data
    if (userRole === 'DELIVERY_AGENT') {
      // Verify agent ID belongs to this user
      // This would typically involve checking the agent's userId
      // For now, we'll allow it if agentId matches some pattern
    }

    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = { agentId };

    const [agentPerformance, timeSeriesData] = await Promise.all([
      DeliveryAnalyticsService.getAgentPerformanceData(timeframe, filters),
      DeliveryAnalyticsService.getTimeSeriesData(timeframe, filters)
    ]);

    const agentData = agentPerformance.find(agent => agent.agentId === agentId);

    if (!agentData) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found or no data available'
      });
    }

    res.json({
      success: true,
      data: {
        agent: agentData,
        trends: timeSeriesData
      },
      timeframe,
      filters
    });

  } catch (error) {
    console.error('Error getting agent analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @route GET /api/delivery-analytics/zone/:zoneId
 * @desc Get detailed analytics for a specific zone
 * @access Admin, Delivery Manager
 */
router.get('/zone/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;
    const {
      'timeframe.start': startDate,
      'timeframe.end': endDate
    } = req.query;

    const timeframe: AnalyticsTimeframe = {
      start: startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: endDate ? new Date(endDate as string) : new Date()
    };

    const filters: AnalyticsFilters = { zoneId };

    const [zonePerformance, timeSeriesData, agentPerformance] = await Promise.all([
      DeliveryAnalyticsService.getZonePerformanceData(timeframe, filters),
      DeliveryAnalyticsService.getTimeSeriesData(timeframe, filters),
      DeliveryAnalyticsService.getAgentPerformanceData(timeframe, filters)
    ]);

    const zoneData = zonePerformance.find(zone => zone.zoneId === zoneId);

    if (!zoneData) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found or no data available'
      });
    }

    res.json({
      success: true,
      data: {
        zone: zoneData,
        trends: timeSeriesData,
        agents: agentPerformance
      },
      timeframe,
      filters
    });

  } catch (error) {
    console.error('Error getting zone analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
