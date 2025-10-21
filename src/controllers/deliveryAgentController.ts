import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Dashboard Analytics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    if (!agentId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get delivery agent profile
    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Delivery agent profile not found' });
    }

    // Get total deliveries
    const totalDeliveries = await prisma.shipment.count({
      where: { agentId: agent.id }
    });

    // Get completed deliveries
    const completedDeliveries = await prisma.shipment.count({
      where: { 
        agentId: agent.id,
        status: 'delivered'
      }
    });

    // Get pending deliveries
    const pendingDeliveries = await prisma.shipment.count({
      where: { 
        agentId: agent.id,
        status: { in: ['assigned', 'picked_up', 'in_transit'] }
      }
    });

    // Get total earnings
    const totalEarnings = await prisma.$queryRaw`
      SELECT COALESCE(SUM(deliveryFee * 0.8), 0) as earnings
      FROM shipments 
      WHERE agentId = ${agent.id} AND status = 'delivered'
    `;

    // Get today's deliveries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayDeliveries = await prisma.shipment.count({
      where: {
        agentId: agent.id,
        deliveredAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    // Get recent shipments
    const recentShipments = await prisma.shipment.findMany({
      where: { agentId: agent.id },
      include: {
        order: {
          include: {
            product: {
              select: { title: true, images: true }
            },
            buyer: {
              select: { firstName: true, lastName: true, phone: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get weekly performance (last 7 days)
    const weeklyStats = await prisma.$queryRaw`
      SELECT 
        DATE(deliveredAt) as date,
        COUNT(*) as deliveries,
        SUM(deliveryFee * 0.8) as earnings
      FROM shipments 
      WHERE agentId = ${agent.id} 
        AND status = 'delivered'
        AND deliveredAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(deliveredAt)
      ORDER BY date ASC
    `;

    res.json({
      stats: {
        totalDeliveries,
        completedDeliveries,
        pendingDeliveries,
        totalEarnings: (totalEarnings as any)[0]?.earnings || 0,
        todayDeliveries,
        rating: agent.rating || 0,
        completionRate: totalDeliveries > 0 ? (completedDeliveries / totalDeliveries) * 100 : 0
      },
      recentShipments,
      weeklyStats,
      agentInfo: {
        isVerified: agent.isVerified,
        isAvailable: agent.isAvailable,
        vehicleType: agent.vehicleType,
        currentLocation: agent.currentLocation ? JSON.parse(agent.currentLocation) : null
      }
    });
  } catch (error) {
    console.error('Delivery agent dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Shipment Management
export const getAssignedShipments = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    const { page = 1, limit = 20, status, priority } = req.query;

    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Delivery agent profile not found' });
    }

    const where: any = {
      agentId: agent.id
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    // Priority filter based on estimated delivery time
    if (priority === 'urgent') {
      where.estimatedDelivery = {
        lte: new Date(Date.now() + 2 * 60 * 60 * 1000) // Next 2 hours
      };
    }

    const shipments = await prisma.shipment.findMany({
      where,
      include: {
        order: {
          include: {
            product: {
              select: { title: true, images: true, price: true }
            },
            buyer: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            }
          }
        },
        zone: {
          select: { name: true, baseFee: true }
        }
      },
      orderBy: [
        { estimatedDelivery: 'asc' },
        { createdAt: 'desc' }
      ],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const totalCount = await prisma.shipment.count({ where });

    res.json({
      shipments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get assigned shipments error:', error);
    res.status(500).json({ error: 'Failed to fetch assigned shipments' });
  }
};

export const updateShipmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, location, notes, deliveryProof } = req.body;
    const agentId = req.user?.id;

    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Delivery agent profile not found' });
    }

    // Verify agent owns this shipment
    const shipment = await prisma.shipment.findFirst({
      where: { id, agentId: agent.id }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'assigned': ['picked_up', 'cancelled'],
      'picked_up': ['in_transit', 'cancelled'],
      'in_transit': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[shipment.status]?.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${shipment.status} to ${status}` 
      });
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    // Update timestamps based on status
    if (status === 'picked_up') {
      updateData.pickedUpAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
      updateData.actualDelivery = new Date();
      if (deliveryProof) {
        updateData.deliveryProof = JSON.stringify(deliveryProof);
      }
    }

    // Update current location
    if (location) {
      updateData.currentLocation = JSON.stringify(location);
      
      // Also update agent's current location
      await prisma.deliveryAgent.update({
        where: { id: agent.id },
        data: {
          currentLocation: JSON.stringify(location),
          lastActiveAt: new Date()
        }
      });
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        order: {
          include: {
            buyer: {
              select: { firstName: true, lastName: true, email: true, phone: true }
            },
            product: {
              select: { title: true }
            }
          }
        }
      }
    });

    // Update agent stats if delivered
    if (status === 'delivered') {
      await prisma.deliveryAgent.update({
        where: { id: agent.id },
        data: {
          totalDeliveries: { increment: 1 },
          earnings: { increment: shipment.deliveryFee * 0.8 } // 80% commission
        }
      });
    }

    // TODO: Send real-time notification to customer
    // await notificationService.sendDeliveryStatusUpdate(updatedShipment);

    res.json(updatedShipment);
  } catch (error) {
    console.error('Update shipment status error:', error);
    res.status(500).json({ error: 'Failed to update shipment status' });
  }
};

// Route Optimization
export const getOptimizedRoute = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Delivery agent profile not found' });
    }

    // Get pending shipments for the agent
    const pendingShipments = await prisma.shipment.findMany({
      where: {
        agentId: agent.id,
        status: { in: ['assigned', 'picked_up'] }
      },
      include: {
        order: {
          select: {
            buyer: {
              select: { firstName: true, lastName: true, phone: true }
            }
          }
        }
      },
      orderBy: { estimatedDelivery: 'asc' }
    });

    // Simple route optimization - sort by proximity and delivery time
    // TODO: Implement proper route optimization algorithm
    const optimizedRoute = pendingShipments.map((shipment, index) => ({
      ...shipment,
      sequence: index + 1,
      estimatedDuration: 30 + (index * 15), // Simple estimation
      deliveryCoordinates: shipment.deliveryCoordinates ? 
        JSON.parse(shipment.deliveryCoordinates) : null
    }));

    // Calculate route summary
    const totalDistance = optimizedRoute.length * 5; // Simplified calculation
    const estimatedDuration = optimizedRoute.reduce((sum, stop) => sum + stop.estimatedDuration, 0);
    const totalEarnings = optimizedRoute.reduce((sum, shipment) => 
      sum + (shipment.deliveryFee * 0.8), 0
    );

    res.json({
      route: optimizedRoute,
      summary: {
        totalStops: optimizedRoute.length,
        totalDistance: totalDistance,
        estimatedDuration: estimatedDuration,
        totalEarnings: totalEarnings
      },
      currentLocation: agent.currentLocation ? JSON.parse(agent.currentLocation) : null
    });
  } catch (error) {
    console.error('Get optimized route error:', error);
    res.status(500).json({ error: 'Failed to get optimized route' });
  }
};

// Earnings Management
export const getEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    const { period = 'all', startDate, endDate } = req.query;

    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Delivery agent profile not found' });
    }

    let dateFilter: any = {};
    
    if (period === 'week') {
      dateFilter = {
        deliveredAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      };
    } else if (period === 'month') {
      dateFilter = {
        deliveredAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      };
    } else if (startDate && endDate) {
      dateFilter = {
        deliveredAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      };
    }

    // Get earnings summary
    const earningsData = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as totalDeliveries,
        SUM(deliveryFee) as totalRevenue,
        SUM(deliveryFee * 0.8) as totalEarnings,
        AVG(deliveryFee) as avgDeliveryFee
      FROM shipments 
      WHERE agentId = ${agent.id} 
        AND status = 'delivered'
        ${period !== 'all' ? 'AND deliveredAt >= ?' : ''}
    `;

    // Get daily earnings (last 30 days)
    const dailyEarnings = await prisma.$queryRaw`
      SELECT 
        DATE(deliveredAt) as date,
        COUNT(*) as deliveries,
        SUM(deliveryFee * 0.8) as earnings
      FROM shipments 
      WHERE agentId = ${agent.id} 
        AND status = 'delivered'
        AND deliveredAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(deliveredAt)
      ORDER BY date ASC
    `;

    // Get top performing zones
    const topZones = await prisma.$queryRaw`
      SELECT 
        dz.name as zoneName,
        COUNT(s.id) as deliveries,
        SUM(s.deliveryFee * 0.8) as earnings,
        AVG(s.deliveryFee) as avgFee
      FROM shipments s
      LEFT JOIN delivery_zones dz ON s.zoneId = dz.id
      WHERE s.agentId = ${agent.id} 
        AND s.status = 'delivered'
      GROUP BY s.zoneId
      ORDER BY earnings DESC
      LIMIT 5
    `;

    const earnings = (earningsData as any)[0];

    res.json({
      summary: {
        totalDeliveries: Number(earnings?.totalDeliveries || 0),
        totalRevenue: Number(earnings?.totalRevenue || 0),
        totalEarnings: Number(earnings?.totalEarnings || 0),
        avgDeliveryFee: Number(earnings?.avgDeliveryFee || 0),
        availableBalance: agent.earnings || 0
      },
      dailyEarnings,
      topZones,
      period
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
};

// Profile Management
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;

    const profile = await prisma.user.findUnique({
      where: { id: agentId },
      include: {
        deliveryAgent: true,
        profile: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      user: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar,
        emailVerified: profile.emailVerified,
        phoneVerified: profile.phoneVerified
      },
      deliveryAgent: profile.deliveryAgent,
      profile: profile.profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    const {
      firstName,
      lastName,
      phone,
      avatar,
      vehicleType,
      licensePlate,
      licenseNumber,
      emergencyContact,
      bankDetails,
      isAvailable
    } = req.body;

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: agentId },
      data: {
        firstName,
        lastName,
        phone,
        avatar
      }
    });

    // Update delivery agent profile
    const agentData = {
      vehicleType,
      licensePlate,
      licenseNumber,
      emergencyContact,
      isAvailable,
      bankDetails: bankDetails ? JSON.stringify(bankDetails) : undefined
    };

    const updatedAgent = await prisma.deliveryAgent.upsert({
      where: { userId: agentId },
      create: {
        userId: agentId!,
        ...agentData,
        phoneNumber: phone
      },
      update: agentData
    });

    res.json({
      user: updatedUser,
      deliveryAgent: updatedAgent
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Location Services
export const updateLocation = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    const { latitude, longitude, accuracy } = req.body;

    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Delivery agent profile not found' });
    }

    const location = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      accuracy: Number(accuracy),
      timestamp: new Date().toISOString()
    };

    await prisma.deliveryAgent.update({
      where: { id: agent.id },
      data: {
        currentLocation: JSON.stringify(location),
        lastActiveAt: new Date()
      }
    });

    res.json({ message: 'Location updated successfully', location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

export const toggleAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    const { isAvailable } = req.body;

    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Delivery agent profile not found' });
    }

    const updatedAgent = await prisma.deliveryAgent.update({
      where: { id: agent.id },
      data: {
        isAvailable: Boolean(isAvailable),
        lastActiveAt: new Date()
      }
    });

    res.json({
      message: `Availability ${isAvailable ? 'enabled' : 'disabled'}`,
      isAvailable: updatedAgent.isAvailable
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ error: 'Failed to toggle availability' });
  }
};

// Performance Analytics
export const getPerformanceMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const agentId = req.user?.id;
    const { period = '30d' } = req.query;

    const agent = await prisma.deliveryAgent.findUnique({
      where: { userId: agentId }
    });

    if (!agent) {
      return res.status(404).json({ error: 'Delivery agent profile not found' });
    }

    let dateFilter: Date;
    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Performance metrics
    const metrics = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as totalDeliveries,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completedDeliveries,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledDeliveries,
        AVG(CASE 
          WHEN status = 'delivered' AND estimatedDelivery IS NOT NULL AND actualDelivery IS NOT NULL
          THEN TIMESTAMPDIFF(MINUTE, estimatedDelivery, actualDelivery)
        END) as avgDelayMinutes,
        AVG(rating) as avgRating,
        AVG(deliveryFee) as avgDeliveryFee
      FROM shipments 
      WHERE agentId = ${agent.id} 
        AND createdAt >= ${dateFilter}
    `;

    // On-time delivery rate
    const onTimeDeliveries = await prisma.$queryRaw`
      SELECT 
        COUNT(CASE WHEN actualDelivery <= estimatedDelivery THEN 1 END) as onTime,
        COUNT(*) as total
      FROM shipments 
      WHERE agentId = ${agent.id} 
        AND status = 'delivered'
        AND createdAt >= ${dateFilter}
        AND estimatedDelivery IS NOT NULL
        AND actualDelivery IS NOT NULL
    `;

    // Daily performance trends
    const dailyTrends = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as deliveries,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed,
        AVG(rating) as avgRating
      FROM shipments 
      WHERE agentId = ${agent.id} 
        AND createdAt >= ${dateFilter}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    const performanceData = (metrics as any)[0];
    const onTimeData = (onTimeDeliveries as any)[0];

    const completionRate = performanceData.totalDeliveries > 0 ? 
      (performanceData.completedDeliveries / performanceData.totalDeliveries) * 100 : 0;

    const onTimeRate = onTimeData.total > 0 ? 
      (onTimeData.onTime / onTimeData.total) * 100 : 0;

    res.json({
      metrics: {
        totalDeliveries: Number(performanceData.totalDeliveries || 0),
        completedDeliveries: Number(performanceData.completedDeliveries || 0),
        cancelledDeliveries: Number(performanceData.cancelledDeliveries || 0),
        completionRate: completionRate,
        onTimeRate: onTimeRate,
        avgRating: Number(performanceData.avgRating || 0),
        avgDelayMinutes: Number(performanceData.avgDelayMinutes || 0),
        avgDeliveryFee: Number(performanceData.avgDeliveryFee || 0)
      },
      dailyTrends,
      period
    });
  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch performance metrics' });
  }
};