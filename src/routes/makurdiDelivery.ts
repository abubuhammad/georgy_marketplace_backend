import { Router, Request, Response } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { MakurdiDeliveryService, MAKURDI_ZONES, DELIVERY_SETTINGS } from '../services/makurdiDeliveryService';
import { prisma } from '../lib/prisma';

const router = Router();

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get delivery quote for Makurdi
 * POST /api/makurdi-delivery/quote
 */
router.post('/quote', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      pickupLocation,
      deliveryLocation,
      weight,
      packageValue,
      deliveryType = 'standard'
    } = req.body;
    
    // Validate required fields
    if (!pickupLocation || !deliveryLocation || packageValue === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Pickup location, delivery location, and package value are required'
      });
    }
    
    // Validate locations have coordinates
    if (!pickupLocation.lat || !pickupLocation.lng || !deliveryLocation.lat || !deliveryLocation.lng) {
      return res.status(400).json({
        success: false,
        error: 'Location coordinates (lat, lng) are required'
      });
    }
    
    // Check if locations are within Makurdi coverage
    if (!MakurdiDeliveryService.isWithinCoverage(pickupLocation)) {
      return res.status(400).json({
        success: false,
        error: 'Pickup location is outside Makurdi delivery coverage area'
      });
    }
    
    if (!MakurdiDeliveryService.isWithinCoverage(deliveryLocation)) {
      return res.status(400).json({
        success: false,
        error: 'Delivery location is outside Makurdi delivery coverage area'
      });
    }
    
    const result = await MakurdiDeliveryService.calculateDeliveryQuote({
      pickupLocation,
      deliveryLocation,
      weight: weight ? parseFloat(weight) : undefined,
      packageValue: parseFloat(packageValue),
      deliveryType
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Error getting delivery quote:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate delivery quote'
    });
  }
});

/**
 * Get all Makurdi delivery zones
 * GET /api/makurdi-delivery/zones
 */
router.get('/zones', (req: Request, res: Response) => {
  res.json({
    success: true,
    zones: MAKURDI_ZONES.map(zone => ({
      code: zone.code,
      name: zone.name,
      areas: zone.areas,
      baseFee: zone.baseFee,
      minFee: zone.minFee,
      estimatedTime: zone.estimatedTime,
      center: zone.center
    }))
  });
});

/**
 * Check if location is within Makurdi coverage
 * POST /api/makurdi-delivery/check-coverage
 */
router.post('/check-coverage', (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates (lat, lng) are required'
      });
    }
    
    const isWithinCoverage = MakurdiDeliveryService.isWithinCoverage({ lat, lng });
    const zone = isWithinCoverage ? MakurdiDeliveryService.determineZone({ lat, lng }) : null;
    const zoneInfo = zone ? MakurdiDeliveryService.getZoneByCode(zone) : null;
    
    res.json({
      success: true,
      coverage: {
        isWithinCoverage,
        zone: zoneInfo ? {
          code: zoneInfo.code,
          name: zoneInfo.name,
          baseFee: zoneInfo.baseFee
        } : null
      }
    });
    
  } catch (error) {
    console.error('Error checking coverage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check coverage'
    });
  }
});

/**
 * Get delivery settings (public info only)
 * GET /api/makurdi-delivery/settings
 */
router.get('/settings', (req: Request, res: Response) => {
  res.json({
    success: true,
    settings: {
      minDeliveryFee: DELIVERY_SETTINGS.minDeliveryFee,
      maxDeliveryFee: DELIVERY_SETTINGS.maxDeliveryFee,
      weightFreeLimit: DELIVERY_SETTINGS.weightFreeLimit,
      weightSurchargePerKg: DELIVERY_SETTINGS.weightSurchargePerKg,
      operatingHours: DELIVERY_SETTINGS.operatingHours,
      deliveryTypes: [
        { type: 'standard', multiplier: 1, description: 'Standard delivery (45-90 mins)' },
        { type: 'express', multiplier: DELIVERY_SETTINGS.expressMultiplier, description: 'Express delivery (30-60 mins)' },
        { type: 'same_day', multiplier: DELIVERY_SETTINGS.sameDayMultiplier, description: 'Same day delivery' },
        { type: 'scheduled', multiplier: DELIVERY_SETTINGS.scheduledMultiplier, description: 'Scheduled delivery' }
      ]
    }
  });
});

// ==================== PROTECTED ENDPOINTS ====================

router.use(authenticateToken);

/**
 * Register as delivery agent in Makurdi
 * POST /api/makurdi-delivery/agent/register
 */
router.post('/agent/register', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const {
      // Personal Info
      dateOfBirth,
      gender,
      address,
      alternatePhone,
      
      // Vehicle Info
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      licensePlate,
      vehicleColor,
      
      // Documents
      ninNumber,
      licenseNumber,
      licenseExpiry,
      
      // Guarantor
      guarantorName,
      guarantorPhone,
      guarantorAddress,
      guarantorRelationship,
      
      // Banking
      bankName,
      accountNumber,
      accountName,
      
      // Service Config
      serviceAreas,
      maxDeliveryRadius,
      
      // Contact
      phoneNumber
    } = req.body;
    
    // Validate required fields
    if (!phoneNumber || !vehicleType || !ninNumber) {
      return res.status(400).json({
        success: false,
        error: 'Phone number, vehicle type, and NIN are required'
      });
    }
    
    // Validate vehicle type
    const validVehicleTypes = ['bike', 'tricycle', 'car', 'van'];
    if (!validVehicleTypes.includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle type. Must be one of: bike, tricycle, car, van'
      });
    }
    
    // Validate service areas are valid Makurdi zones
    if (serviceAreas && serviceAreas.length > 0) {
      const validZoneCodes = MAKURDI_ZONES.map(z => z.code);
      const invalidZones = serviceAreas.filter((z: string) => !validZoneCodes.includes(z));
      if (invalidZones.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid zone codes: ${invalidZones.join(', ')}`
        });
      }
    }
    
    // Check if user already has an agent profile
    const existingAgent = await prisma.deliveryAgent.findUnique({
      where: { userId }
    });
    
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        error: 'You already have a delivery agent profile'
      });
    }
    
    // Create agent profile
    const agent = await prisma.deliveryAgent.create({
      data: {
        userId,
        phoneNumber,
        vehicleType,
        licensePlate,
        licenseNumber,
        businessName: `${vehicleMake || ''} ${vehicleModel || ''}`.trim() || null,
        bankDetails: JSON.stringify({
          bankName,
          accountNumber,
          accountName
        }),
        emergencyContact: guarantorPhone,
        isVerified: false,
        isAvailable: false,
        status: 'pending'
      }
    });
    
    // Update user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'delivery_agent' }
    });
    
    res.status(201).json({
      success: true,
      message: 'Agent registration submitted successfully. Your application is pending verification.',
      agent: {
        id: agent.id,
        status: agent.status,
        vehicleType: agent.vehicleType,
        isVerified: agent.isVerified
      }
    });
    
  } catch (error) {
    console.error('Error registering agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register as delivery agent'
    });
  }
});

/**
 * Get agent's assigned deliveries
 * GET /api/makurdi-delivery/agent/deliveries
 */
router.get('/agent/deliveries', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const { status, page = 1, limit = 20 } = req.query;
    
    // Get agent profile
    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId }
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Delivery agent profile not found'
      });
    }
    
    // Build query
    const whereClause: any = { agentId: agent.id };
    if (status) {
      whereClause.status = status;
    }
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [deliveries, total] = await Promise.all([
      prisma.shipment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.shipment.count({ where: whereClause })
    ]);
    
    res.json({
      success: true,
      deliveries: deliveries.map(d => ({
        id: d.id,
        trackingNumber: d.trackingNumber,
        status: d.status,
        pickupAddress: d.pickupAddress ? JSON.parse(d.pickupAddress) : null,
        deliveryAddress: d.deliveryAddress ? JSON.parse(d.deliveryAddress) : null,
        recipientName: d.recipientName,
        recipientPhone: d.recipientPhone,
        deliveryFee: d.deliveryFee,
        estimatedDelivery: d.estimatedDelivery,
        deliveryNotes: d.deliveryNotes,
        createdAt: d.createdAt
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
    
  } catch (error) {
    console.error('Error getting agent deliveries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deliveries'
    });
  }
});

/**
 * Update delivery status
 * PUT /api/makurdi-delivery/agent/deliveries/:id/status
 */
router.put('/agent/deliveries/:id/status', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { status, location, notes, proofOfDelivery, failedReason } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    // Valid status transitions
    const validStatuses = ['assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Get agent
    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId }
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Delivery agent profile not found'
      });
    }
    
    // Get shipment
    const shipment = await prisma.shipment.findUnique({
      where: { id }
    });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }
    
    // Verify agent is assigned to this shipment
    if (shipment.agentId !== agent.id) {
      return res.status(403).json({
        success: false,
        error: 'You are not assigned to this delivery'
      });
    }
    
    // Update shipment
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    if (status === 'picked_up') {
      updateData.pickedUpAt = new Date();
    }
    
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData.actualDelivery = new Date();
      if (proofOfDelivery) {
        updateData.deliveryProof = JSON.stringify(proofOfDelivery);
      }
      
      // Credit agent earning
      const agentEarning = Math.round(shipment.deliveryFee * DELIVERY_SETTINGS.agentCommission);
      await MakurdiDeliveryService.creditAgentEarning(agent.id, shipment.id, agentEarning);
    }
    
    if (status === 'failed' && failedReason) {
      updateData.deliveryNotes = failedReason;
    }
    
    if (location) {
      updateData.currentLocation = JSON.stringify(location);
    }
    
    await prisma.shipment.update({
      where: { id },
      data: updateData
    });
    
    res.json({
      success: true,
      message: `Delivery status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Error updating delivery status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update delivery status'
    });
  }
});

/**
 * Update agent location
 * POST /api/makurdi-delivery/agent/location
 */
router.post('/agent/location', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { lat, lng, accuracy, heading, speed } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Coordinates (lat, lng) are required'
      });
    }
    
    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId }
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Delivery agent profile not found'
      });
    }
    
    // Update agent location
    await prisma.deliveryAgent.update({
      where: { id: agent.id },
      data: {
        currentLocation: JSON.stringify({
          lat,
          lng,
          accuracy,
          heading,
          speed,
          timestamp: new Date().toISOString()
        }),
        lastActiveAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Location updated'
    });
    
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

/**
 * Toggle agent availability
 * PUT /api/makurdi-delivery/agent/availability
 */
router.put('/agent/availability', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { isOnline, isAvailable } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId }
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Delivery agent profile not found'
      });
    }
    
    // Check if agent is verified
    if (!agent.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Your account must be verified before you can go online'
      });
    }
    
    // Update availability
    const updateData: any = {
      lastActiveAt: new Date()
    };
    
    if (typeof isOnline === 'boolean') {
      updateData.isAvailable = isOnline; // Using isAvailable as online status
    }
    
    if (typeof isAvailable === 'boolean') {
      updateData.isAvailable = isAvailable;
    }
    
    await prisma.deliveryAgent.update({
      where: { id: agent.id },
      data: updateData
    });
    
    res.json({
      success: true,
      message: `You are now ${updateData.isAvailable ? 'online and available' : 'offline'}`
    });
    
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update availability'
    });
  }
});

/**
 * Get agent earnings summary
 * GET /api/makurdi-delivery/agent/earnings
 */
router.get('/agent/earnings', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { period = 'week' } = req.query;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId }
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Delivery agent profile not found'
      });
    }
    
    // Calculate period start date
    const now = new Date();
    let periodStart = new Date();
    switch (period) {
      case 'today':
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      default:
        periodStart.setDate(now.getDate() - 7);
    }
    
    // Get completed deliveries in period
    const deliveries = await prisma.shipment.findMany({
      where: {
        agentId: agent.id,
        status: 'delivered',
        deliveredAt: {
          gte: periodStart
        }
      }
    });
    
    const periodEarnings = deliveries.reduce((sum, d) => {
      return sum + Math.round(d.deliveryFee * DELIVERY_SETTINGS.agentCommission);
    }, 0);
    
    res.json({
      success: true,
      earnings: {
        period,
        totalEarnings: agent.earnings,
        periodEarnings,
        deliveriesInPeriod: deliveries.length,
        avgEarningPerDelivery: deliveries.length > 0 
          ? Math.round(periodEarnings / deliveries.length) 
          : 0
      }
    });
    
  } catch (error) {
    console.error('Error getting earnings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get earnings'
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

/**
 * Admin: Get all delivery agents
 * GET /api/makurdi-delivery/admin/agents
 */
router.get('/admin/agents', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const { status, isVerified, page = 1, limit = 20 } = req.query;
    
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (isVerified !== undefined) whereClause.isVerified = isVerified === 'true';
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [agents, total] = await Promise.all([
      prisma.deliveryAgent.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.deliveryAgent.count({ where: whereClause })
    ]);
    
    res.json({
      success: true,
      agents: agents.map(a => ({
        id: a.id,
        userId: a.userId,
        user: a.user,
        businessName: a.businessName,
        vehicleType: a.vehicleType,
        licensePlate: a.licensePlate,
        phoneNumber: a.phoneNumber,
        isVerified: a.isVerified,
        isAvailable: a.isAvailable,
        status: a.status,
        rating: a.rating,
        totalDeliveries: a.totalDeliveries,
        earnings: a.earnings,
        createdAt: a.createdAt
      })),
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
    
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agents'
    });
  }
});

/**
 * Admin: Verify/Approve delivery agent
 * POST /api/makurdi-delivery/admin/agents/:id/verify
 */
router.post('/admin/agents/:id/verify', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { approved, notes } = req.body;
    
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const agent = await prisma.deliveryAgent.findUnique({
      where: { id }
    });
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }
    
    await prisma.deliveryAgent.update({
      where: { id },
      data: {
        isVerified: approved,
        status: approved ? 'active' : 'inactive'
      }
    });
    
    res.json({
      success: true,
      message: approved 
        ? 'Agent verified and approved successfully' 
        : 'Agent verification rejected'
    });
    
  } catch (error) {
    console.error('Error verifying agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify agent'
    });
  }
});

/**
 * Admin: Suspend delivery agent
 * PUT /api/makurdi-delivery/admin/agents/:id/suspend
 */
router.put('/admin/agents/:id/suspend', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { reason, duration } = req.body;
    
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    if (!reason) {
      return res.status(400).json({
        success: false,
        error: 'Suspension reason is required'
      });
    }
    
    await prisma.deliveryAgent.update({
      where: { id },
      data: {
        status: 'suspended',
        isAvailable: false
      }
    });
    
    res.json({
      success: true,
      message: 'Agent suspended successfully'
    });
    
  } catch (error) {
    console.error('Error suspending agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suspend agent'
    });
  }
});

/**
 * Admin: Reassign delivery to different agent
 * PUT /api/makurdi-delivery/admin/shipments/:id/reassign
 */
router.put('/admin/shipments/:id/reassign', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    const { newAgentId, reason } = req.body;
    
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    if (!newAgentId) {
      return res.status(400).json({
        success: false,
        error: 'New agent ID is required'
      });
    }
    
    // Verify new agent exists and is available
    const newAgent = await prisma.deliveryAgent.findUnique({
      where: { id: newAgentId }
    });
    
    if (!newAgent) {
      return res.status(404).json({
        success: false,
        error: 'New agent not found'
      });
    }
    
    if (!newAgent.isVerified || newAgent.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'New agent is not verified or active'
      });
    }
    
    // Get shipment
    const shipment = await prisma.shipment.findUnique({
      where: { id }
    });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        error: 'Shipment not found'
      });
    }
    
    // Reassign
    await prisma.shipment.update({
      where: { id },
      data: {
        agentId: newAgentId,
        assignedAt: new Date()
      }
    });
    
    res.json({
      success: true,
      message: 'Shipment reassigned successfully'
    });
    
  } catch (error) {
    console.error('Error reassigning shipment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reassign shipment'
    });
  }
});

/**
 * Admin: Get delivery analytics
 * GET /api/makurdi-delivery/admin/analytics
 */
router.get('/admin/analytics', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    const { period = 'week' } = req.query;
    
    // Calculate period start date
    const now = new Date();
    let periodStart = new Date();
    switch (period) {
      case 'today':
        periodStart.setHours(0, 0, 0, 0);
        break;
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      default:
        periodStart.setDate(now.getDate() - 7);
    }
    
    const [
      totalAgents,
      activeAgents,
      totalShipments,
      deliveredShipments,
      failedShipments
    ] = await Promise.all([
      prisma.deliveryAgent.count(),
      prisma.deliveryAgent.count({ where: { isAvailable: true, isVerified: true } }),
      prisma.shipment.count({ where: { createdAt: { gte: periodStart } } }),
      prisma.shipment.count({ where: { status: 'delivered', createdAt: { gte: periodStart } } }),
      prisma.shipment.count({ where: { status: 'failed', createdAt: { gte: periodStart } } })
    ]);
    
    // Calculate revenue
    const deliveredOrders = await prisma.shipment.findMany({
      where: {
        status: 'delivered',
        createdAt: { gte: periodStart }
      },
      select: { deliveryFee: true }
    });
    
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.deliveryFee, 0);
    const platformRevenue = Math.round(totalRevenue * DELIVERY_SETTINGS.platformCommission);
    const agentPayouts = Math.round(totalRevenue * DELIVERY_SETTINGS.agentCommission);
    
    res.json({
      success: true,
      analytics: {
        period,
        agents: {
          total: totalAgents,
          active: activeAgents,
          inactive: totalAgents - activeAgents
        },
        deliveries: {
          total: totalShipments,
          delivered: deliveredShipments,
          failed: failedShipments,
          deliveryRate: totalShipments > 0 
            ? Math.round((deliveredShipments / totalShipments) * 100) 
            : 0
        },
        revenue: {
          total: totalRevenue,
          platformRevenue,
          agentPayouts,
          avgDeliveryFee: deliveredShipments > 0 
            ? Math.round(totalRevenue / deliveredShipments) 
            : 0
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

/**
 * Admin: Update pricing settings
 * PUT /api/makurdi-delivery/admin/pricing
 */
router.put('/admin/pricing', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    // Check admin role
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    // Note: In production, these would be stored in database
    // For now, just return success with the current settings
    res.json({
      success: true,
      message: 'Pricing settings can be updated in the environment configuration',
      currentSettings: DELIVERY_SETTINGS
    });
    
  } catch (error) {
    console.error('Error updating pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update pricing'
    });
  }
});

export { router as makurdiDeliveryRoutes };
