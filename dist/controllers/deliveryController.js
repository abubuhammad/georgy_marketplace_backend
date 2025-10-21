"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryAnalytics = exports.getAllShipments = exports.toggleAgentAvailability = exports.getAgentProfile = exports.registerDeliveryAgent = exports.updateAgentLocation = exports.getAgentDeliveries = exports.updateShipmentStatus = exports.trackByNumber = exports.getShipmentTracking = exports.createShipment = exports.getDeliveryQuote = void 0;
const deliveryService_1 = require("../services/deliveryService");
const errorHandler_1 = require("../middleware/errorHandler");
require("../types"); // Import type definitions
// Define missing enums locally
var ShipmentStatus;
(function (ShipmentStatus) {
    ShipmentStatus["PENDING"] = "pending";
    ShipmentStatus["ASSIGNED"] = "assigned";
    ShipmentStatus["PICKED_UP"] = "picked_up";
    ShipmentStatus["IN_TRANSIT"] = "in_transit";
    ShipmentStatus["DELIVERED"] = "delivered";
    ShipmentStatus["CANCELLED"] = "cancelled";
})(ShipmentStatus || (ShipmentStatus = {}));
var ShippingOption;
(function (ShippingOption) {
    ShippingOption["STANDARD"] = "standard";
    ShippingOption["EXPRESS"] = "express";
    ShippingOption["SAME_DAY"] = "same_day";
    ShippingOption["SCHEDULED"] = "scheduled";
})(ShippingOption || (ShippingOption = {}));
var VehicleType;
(function (VehicleType) {
    VehicleType["BIKE"] = "bike";
    VehicleType["CAR"] = "car";
    VehicleType["VAN"] = "van";
    VehicleType["TRUCK"] = "truck";
})(VehicleType || (VehicleType = {}));
// Get delivery quote/rates
exports.getDeliveryQuote = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { pickupAddress, deliveryAddress, weight, packageValue, deliveryType, cod } = req.body;
    // Validate required fields
    if (!pickupAddress || !deliveryAddress || !packageValue) {
        return res.status(400).json({
            success: false,
            error: 'Pickup address, delivery address, and package value are required'
        });
    }
    const result = await deliveryService_1.DeliveryService.getDeliveryQuote({
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
exports.createShipment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { orderId, partnerId, deliveryType = ShippingOption.STANDARD, pickupAddress, deliveryAddress, weight, dimensions, fragile = false, packageValue, description, codAmount, scheduledAt, instructions } = req.body;
    // Validate required fields
    if (!orderId || !pickupAddress || !deliveryAddress || !packageValue || !description) {
        return res.status(400).json({
            success: false,
            error: 'Order ID, addresses, package value, and description are required'
        });
    }
    // TODO: Verify user has permission for this order
    const result = await deliveryService_1.DeliveryService.createShipment({
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
exports.getShipmentTracking = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { shipmentId } = req.params;
    if (!shipmentId) {
        return res.status(400).json({
            success: false,
            error: 'Shipment ID is required'
        });
    }
    const result = await deliveryService_1.DeliveryService.getShipmentTracking(shipmentId);
    if (!result.success) {
        return res.status(404).json(result);
    }
    res.json(result);
});
// Get shipment by tracking number (public endpoint for customer tracking)
exports.trackByNumber = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { trackingNumber } = req.params;
    if (!trackingNumber) {
        return res.status(400).json({
            success: false,
            error: 'Tracking number is required'
        });
    }
    // Get shipment by tracking number
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
    const shipment = await prisma.shipment.findUnique({
        where: { trackingNumber }
    });
    if (!shipment) {
        return res.status(404).json({
            success: false,
            error: 'Shipment not found'
        });
    }
    const result = await deliveryService_1.DeliveryService.getShipmentTracking(shipment.id);
    res.json(result);
});
// DELIVERY AGENT ENDPOINTS
// Update shipment status (delivery agents only)
exports.updateShipmentStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { shipmentId } = req.params;
    const { status, location, notes, proofOfDelivery, failedReason, codCollected } = req.body;
    const userId = req.user.id;
    // Get agent ID from user ID
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
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
    const success = await deliveryService_1.DeliveryService.updateShipmentStatus({
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
exports.getAgentDeliveries = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { status } = req.query;
    // Get agent ID from user ID
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
    const agent = await prisma.deliveryAgent.findUnique({
        where: { userId }
    });
    if (!agent) {
        return res.status(403).json({
            success: false,
            error: 'User is not a registered delivery agent'
        });
    }
    const result = await deliveryService_1.DeliveryService.getAgentDeliveries(agent.id, status);
    res.json(result);
});
// Update agent location (real-time tracking)
exports.updateAgentLocation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
        return res.status(400).json({
            success: false,
            error: 'Latitude and longitude are required'
        });
    }
    // Get agent ID from user ID
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
    const agent = await prisma.deliveryAgent.findUnique({
        where: { userId }
    });
    if (!agent) {
        return res.status(403).json({
            success: false,
            error: 'User is not a registered delivery agent'
        });
    }
    const success = await deliveryService_1.DeliveryService.updateAgentLocation({
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
exports.registerDeliveryAgent = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { employeeId, vehicleType, vehicleModel, plateNumber, capacityKg, maxCapacity } = req.body;
    if (!Object.values(VehicleType).includes(vehicleType)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid vehicle type'
        });
    }
    const result = await deliveryService_1.DeliveryService.registerDeliveryAgent(userId, {
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
exports.getAgentProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
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
exports.toggleAgentAvailability = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { isOnline } = req.body;
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
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
exports.getAllShipments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Check admin role
    const { page = 1, limit = 20, status, partnerId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
    const whereClause = {};
    if (status)
        whereClause.status = status;
    if (partnerId)
        whereClause.partnerId = partnerId;
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
            take: parseInt(limit)
        }),
        prisma.shipment.count({ where: whereClause })
    ]);
    res.json({
        success: true,
        shipments,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
        }
    });
});
// Get delivery analytics (admin only)
exports.getDeliveryAnalytics = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Check admin role
    const { startDate, endDate } = req.query;
    const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
    const whereClause = {};
    if (startDate) {
        whereClause.createdAt = { gte: new Date(startDate) };
    }
    if (endDate) {
        whereClause.createdAt = {
            ...whereClause.createdAt,
            lte: new Date(endDate)
        };
    }
    const [totalShipments, deliveredShipments, failedShipments, shipmentsByStatus, shipmentsByPartner] = await Promise.all([
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
//# sourceMappingURL=deliveryController.js.map