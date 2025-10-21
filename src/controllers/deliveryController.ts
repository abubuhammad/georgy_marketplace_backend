import { Request, Response } from 'express';
import { DeliveryService } from '../services/deliveryService';
import { asyncHandler } from '../middleware/errorHandler';
import '../types'; // Import type definitions
// Define missing enums locally
enum ShipmentStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

enum ShippingOption {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  SCHEDULED = 'scheduled'
}

enum VehicleType {
  BIKE = 'bike',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck'
}

// Get delivery quote/rates
export const getDeliveryQuote = asyncHandler(async (req: Request, res: Response) => {
  const {
    pickupAddress,
    deliveryAddress,
    weight,
    packageValue,
    deliveryType,
    cod
  } = req.body;

  // Validate required fields
  if (!pickupAddress || !deliveryAddress || !packageValue) {
    return res.status(400).json({
      success: false,
      error: 'Pickup address, delivery address, and package value are required'
    });
  }

  const result = await DeliveryService.getDeliveryQuote({
    pickupAddress,
    deliveryAddress,
    weight,
    packageValue: parseFloat(packageValue),
    deliveryType,
    cod
  });

  res.json(result);
});

// Create shipment
export const createShipment = asyncHandler(async (req: Request, res: Response) => {
  const {
    orderId,
    partnerId,
    deliveryType = ShippingOption.STANDARD,
    pickupAddress,
    deliveryAddress,
    weight,
    dimensions,
    fragile = false,
    packageValue,
    description,
    codAmount,
    scheduledAt,
    instructions
  } = req.body;

  // Validate required fields
  if (!orderId || !pickupAddress || !deliveryAddress || !packageValue || !description) {
    return res.status(400).json({
      success: false,
      error: 'Order ID, addresses, package value, and description are required'
    });
  }

  // TODO: Verify user has permission for this order

  const result = await DeliveryService.createShipment({
    orderId,
    partnerId,
    deliveryType,
    pickupAddress,
    deliveryAddress,
    weight,
    dimensions,
    fragile,
    packageValue: parseFloat(packageValue),
    description,
    codAmount: codAmount ? parseFloat(codAmount) : undefined,
    scheduledAt,
    instructions
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

// Get shipment tracking (for customers)
export const getShipmentTracking = asyncHandler(async (req: Request, res: Response) => {
  const { shipmentId } = req.params;

  if (!shipmentId) {
    return res.status(400).json({
      success: false,
      error: 'Shipment ID is required'
    });
  }

  const result = await DeliveryService.getShipmentTracking(shipmentId);

  if (!result.success) {
    return res.status(404).json(result);
  }

  res.json(result);
});

// Get shipment by tracking number (public endpoint for customer tracking)
export const trackByNumber = asyncHandler(async (req: Request, res: Response) => {
  const { trackingNumber } = req.params;

  if (!trackingNumber) {
    return res.status(400).json({
      success: false,
      error: 'Tracking number is required'
    });
  }

  // Get shipment by tracking number
  const { prisma } = await import('../utils/prisma');
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber }
  });

  if (!shipment) {
    return res.status(404).json({
      success: false,
      error: 'Shipment not found'
    });
  }

  const result = await DeliveryService.getShipmentTracking(shipment.id);
  res.json(result);
});

// DELIVERY AGENT ENDPOINTS

// Update shipment status (delivery agents only)
export const updateShipmentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { shipmentId } = req.params;
  const {
    status,
    location,
    notes,
    proofOfDelivery,
    failedReason,
    codCollected
  } = req.body;

  const userId = req.user!.id;

  // Get agent ID from user ID
  const { prisma } = await import('../utils/prisma');
  const agent = await prisma.deliveryAgent.findUnique({
    where: { userId }
  });

  if (!agent) {
    return res.status(403).json({
      success: false,
      error: 'User is not a registered delivery agent'
    });
  }

  if (!Object.values(ShipmentStatus).includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid shipment status'
    });
  }

  const success = await DeliveryService.updateShipmentStatus({
    shipmentId,
    status,
    agentId: agent.id,
    location,
    notes,
    proofOfDelivery,
    failedReason,
    codCollected: codCollected ? parseFloat(codCollected) : undefined
  });

  if (!success) {
    return res.status(400).json({
      success: false,
      error: 'Failed to update shipment status'
    });
  }

  res.json({
    success: true,
    message: 'Shipment status updated successfully'
  });
});

// Get agent's assigned deliveries
export const getAgentDeliveries = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { status } = req.query;

  // Get agent ID from user ID
  const { prisma } = await import('../utils/prisma');
  const agent = await prisma.deliveryAgent.findUnique({
    where: { userId }
  });

  if (!agent) {
    return res.status(403).json({
      success: false,
      error: 'User is not a registered delivery agent'
    });
  }

  const result = await DeliveryService.getAgentDeliveries(
    agent.id, 
    status as ShipmentStatus
  );

  res.json(result);
});

// Update agent location (real-time tracking)
export const updateAgentLocation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required'
    });
  }

  // Get agent ID from user ID
  const { prisma } = await import('../utils/prisma');
  const agent = await prisma.deliveryAgent.findUnique({
    where: { userId }
  });

  if (!agent) {
    return res.status(403).json({
      success: false,
      error: 'User is not a registered delivery agent'
    });
  }

  const success = await DeliveryService.updateAgentLocation({
    agentId: agent.id,
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
    timestamp: new Date().toISOString()
  });

  if (!success) {
    return res.status(400).json({
      success: false,
      error: 'Failed to update location'
    });
  }

  res.json({
    success: true,
    message: 'Location updated successfully'
  });
});

// Register as delivery agent
export const registerDeliveryAgent = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    employeeId,
    vehicleType,
    vehicleModel,
    plateNumber,
    capacityKg,
    maxCapacity
  } = req.body;

  if (!Object.values(VehicleType).includes(vehicleType)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid vehicle type'
    });
  }

  const result = await DeliveryService.registerDeliveryAgent(userId, {
    employeeId,
    vehicleType,
    vehicleModel,
    plateNumber,
    capacityKg: capacityKg ? parseInt(capacityKg) : undefined,
    maxCapacity: maxCapacity ? parseInt(maxCapacity) : 5
  });

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.status(201).json(result);
});

// Get agent profile
export const getAgentProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const { prisma } = await import('../utils/prisma');
  const agent = await prisma.deliveryAgent.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
            // phone: true
        }
      }
    }
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Delivery agent profile not found'
    });
  }

  res.json({
    success: true,
    agent: {
      id: agent.id,
      userId: agent.userId,
      vehicleType: agent.vehicleType,
      licensePlate: agent.licensePlate,
      licenseNumber: agent.licenseNumber,
      businessName: agent.businessName,
      isAvailable: agent.isAvailable,
      isVerified: agent.isVerified,
      rating: Number(agent.rating) || 0,
      totalDeliveries: agent.totalDeliveries,
      earnings: Number(agent.earnings),
      status: agent.status,
      user: agent.user
    }
  });
});

// Toggle agent availability
export const toggleAgentAvailability = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { isOnline } = req.body;

  const { prisma } = await import('../utils/prisma');
  const agent = await prisma.deliveryAgent.findUnique({
    where: { userId }
  });

  if (!agent) {
    return res.status(404).json({
      success: false,
      error: 'Delivery agent profile not found'
    });
  }

  await prisma.deliveryAgent.update({
    where: { id: agent.id },
    data: {
      isAvailable: isOnline,
      currentLocation: JSON.stringify({ isOnline, timestamp: new Date() }),
      lastActiveAt: isOnline ? new Date() : agent.lastActiveAt
    }
  });

  res.json({
    success: true,
    message: `Agent is now ${isOnline ? 'online' : 'offline'}`
  });
});

// ADMIN ENDPOINTS

// Get all shipments (admin only)
export const getAllShipments = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Check admin role

  const { page = 1, limit = 20, status, partnerId } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const { prisma } = await import('../utils/prisma');
  
  const whereClause: any = {};
  if (status) whereClause.status = status;
  if (partnerId) whereClause.partnerId = partnerId;

  const [shipments, total] = await Promise.all([
    prisma.shipment.findMany({
      where: whereClause,
      include: {
        agent: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit as string)
    }),
    prisma.shipment.count({ where: whereClause })
  ]);

  res.json({
    success: true,
    shipments,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      pages: Math.ceil(total / parseInt(limit as string))
    }
  });
});

// Get delivery analytics (admin only)
export const getDeliveryAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Check admin role

  const { startDate, endDate } = req.query;

  const { prisma } = await import('../utils/prisma');
  
  const whereClause: any = {};
  if (startDate) {
    whereClause.createdAt = { gte: new Date(startDate as string) };
  }
  if (endDate) {
    whereClause.createdAt = {
      ...whereClause.createdAt,
      lte: new Date(endDate as string)
    };
  }

  const [
    totalShipments,
    deliveredShipments,
    failedShipments,
    shipmentsByStatus,
    shipmentsByPartner
  ] = await Promise.all([
    prisma.shipment.count({ where: whereClause }),
    prisma.shipment.count({ 
      where: { ...whereClause, status: ShipmentStatus.DELIVERED } 
    }),
    prisma.shipment.count({ 
      where: { ...whereClause, status: ShipmentStatus.CANCELLED } 
    }),
    prisma.shipment.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true }
    }),
    prisma.shipment.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { status: true },
      _avg: { deliveryFee: true }
    })
  ]);

  const deliveryRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;

  res.json({
    success: true,
    analytics: {
      period: {
        start: startDate || 'all_time',
        end: endDate || 'now'
      },
      metrics: {
        totalShipments,
        deliveredShipments,
        failedShipments,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        totalRevenue: 0 // TODO: Calculate from fees
      },
      breakdown: {
        byStatus: shipmentsByStatus.map(item => ({
          status: item.status,
          count: item._count.status,
          percentage: Math.round((item._count.status / totalShipments) * 100)
        })),
        byPartner: shipmentsByPartner.map(item => ({
          status: item.status,
          count: item._count?.status || 0,
          averageFee: item._avg?.deliveryFee || 0
        }))
      }
    }
  });
});
