import { prisma } from '../lib/prisma';

// Define enums locally to match our schema
enum ShipmentStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

enum ShippingOption {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
  NEXT_DAY = 'next_day',
  SCHEDULED = 'scheduled'
}

enum VehicleType {
  BIKE = 'bike',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck'
}

enum CODStatus {
  PENDING = 'pending',
  COLLECTED = 'collected',
  RETURNED = 'returned'
}

export interface DeliveryQuoteRequest {
  pickupAddress: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
  deliveryAddress: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
  };
  weight?: number;
  packageValue: number;
  deliveryType?: ShippingOption;
  cod?: boolean;
}

export interface ShipmentCreateRequest {
  orderId: string;
  partnerId?: string;
  deliveryType: ShippingOption;
  pickupAddress: any;
  deliveryAddress: any;
  weight?: number;
  dimensions?: any;
  fragile: boolean;
  packageValue: number;
  description: string;
  codAmount?: number;
  scheduledAt?: string;
  instructions?: string;
}

export interface AgentLocationUpdate {
  agentId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface DeliveryStatusUpdate {
  shipmentId: string;
  status: ShipmentStatus;
  agentId: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  proofOfDelivery?: {
    signature?: string;
    photo?: string;
    deliveredTo: string;
  };
  failedReason?: string;
  codCollected?: number;
}

export class DeliveryService {
  // Get delivery quote/rates
  static async getDeliveryQuote(request: DeliveryQuoteRequest): Promise<any> {
    try {
      const { pickupAddress, deliveryAddress, weight = 1, packageValue, deliveryType, cod = false } = request;
      
      // Calculate distance (simplified - in production use proper geolocation service)
      const distance = this.calculateDistance(
        pickupAddress.latitude, pickupAddress.longitude,
        deliveryAddress.latitude, deliveryAddress.longitude
      );

      const rates = [];
      
      // Calculate base delivery fee based on distance
      let baseFee = Math.max(500, distance * 50); // Minimum ₦500 or ₦50/km
      
      // Apply modifiers based on delivery type
      if (deliveryType === ShippingOption.EXPRESS) {
        baseFee *= 1.5;
      } else if (deliveryType === ShippingOption.SAME_DAY) {
        baseFee *= 2.0;
      }

      // COD fee
      if (cod) {
        baseFee += packageValue * 0.02; // 2% COD fee
      }

      rates.push({
        partnerId: null,
        partnerName: 'Internal Fleet',
        deliveryType: deliveryType || ShippingOption.STANDARD,
        fee: Math.round(baseFee * 100) / 100,
        currency: 'NGN',
        estimatedDays: this.getEstimatedDays(deliveryType || ShippingOption.STANDARD),
        estimatedHours: this.getEstimatedHours(deliveryType || ShippingOption.STANDARD),
        features: ['tracking', 'cod', 'proof_of_delivery'],
        available: true,
        codSupported: true,
        distance: Math.round(distance * 100) / 100
      });

      return {
        success: true,
        rates: rates.sort((a, b) => a.fee - b.fee), // Sort by price
        zones: {
          pickup: pickupAddress.city,
          delivery: deliveryAddress.city
        },
        distance: Math.round(distance * 100) / 100
      };

    } catch (error) {
      console.error('Error calculating delivery quote:', error);
      return {
        success: false,
        rates: [],
        error: 'Failed to calculate delivery rates'
      };
    }
  }

  // Create shipment
  static async createShipment(request: ShipmentCreateRequest): Promise<any> {
    try {
      const { orderId, partnerId, deliveryType, pickupAddress, deliveryAddress, 
              weight, dimensions, fragile, packageValue, description, codAmount, 
              scheduledAt, instructions } = request;

      // Generate tracking number
      const trackingNumber = this.generateTrackingNumber();

      // Calculate delivery fee
      const quoteRequest = {
        pickupAddress: {
          latitude: pickupAddress.latitude || 0,
          longitude: pickupAddress.longitude || 0,
          city: pickupAddress.city,
          state: pickupAddress.state
        },
        deliveryAddress: {
          latitude: deliveryAddress.latitude || 0,
          longitude: deliveryAddress.longitude || 0,
          city: deliveryAddress.city,
          state: deliveryAddress.state
        },
        weight: weight || 1,
        packageValue,
        deliveryType,
        cod: !!codAmount
      };

      const quote = await this.getDeliveryQuote(quoteRequest);
      const selectedRate = quote.rates[0]; // Use first (cheapest) rate

      if (!selectedRate) {
        throw new Error('No delivery option available for this location');
      }

      // Calculate estimated delivery time
      const estimatedDelivery = new Date();
      estimatedDelivery.setHours(estimatedDelivery.getHours() + selectedRate.estimatedHours);

      // Create shipment
      const shipment = await prisma.shipment.create({
        data: {
          orderId,
          trackingNumber,
          status: ShipmentStatus.PENDING,
          shippingOption: deliveryType || ShippingOption.STANDARD,
          pickupAddress: JSON.stringify(pickupAddress),
          deliveryAddress: JSON.stringify(deliveryAddress),
          recipientName: deliveryAddress.name || 'Customer',
          recipientPhone: deliveryAddress.phone || '',
          packageDetails: JSON.stringify({
            weight: weight ? parseFloat(weight.toString()) : undefined,
            dimensions,
            fragile,
            packageValue: parseFloat(packageValue.toString()),
            description
          }),
          deliveryFee: parseFloat(selectedRate.fee.toString()),
          estimatedDelivery,
          deliveryNotes: instructions
        },
        include: {
          agent: true
        }
      });

      // Log shipment creation
      console.log(`Shipment created: ${trackingNumber}`);

      // Auto-assign to agent if internal fleet
      if (!partnerId) {
        await this.autoAssignAgent(shipment.id);
      }

      return {
        success: true,
        shipment,
        trackingNumber,
        estimatedDelivery: estimatedDelivery.toISOString(),
        labelUrl: `/api/shipments/${shipment.id}/label`
      };

    } catch (error) {
      console.error('Error creating shipment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create shipment'
      };
    }
  }

  // Update shipment status (used by delivery agents)
  static async updateShipmentStatus(update: DeliveryStatusUpdate): Promise<boolean> {
    try {
      const { shipmentId, status, agentId, location, notes, proofOfDelivery, failedReason, codCollected } = update;

      // Get current shipment
      const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: { agent: true }
      });

      if (!shipment) {
        throw new Error('Shipment not found');
      }

      // Verify agent authorization
      if (shipment.agentId !== agentId) {
        throw new Error('Agent not authorized for this shipment');
      }

      // Update shipment
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      // Location updates would be handled by real-time tracking
      // For now, just log the location
      if (location) {
        console.log(`Shipment ${shipmentId} location updated:`, location);
      }

      if (status === ShipmentStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
        updateData.deliveryProof = JSON.stringify(proofOfDelivery);
      }

      // Failed reason would be stored in delivery notes or separate field
      if (status === ShipmentStatus.FAILED && failedReason) {
        updateData.deliveryNotes = failedReason;
      }

      await prisma.shipment.update({
        where: { id: shipmentId },
        data: updateData
      });

      // Log status update
      console.log(`Shipment ${shipmentId} status updated to ${status}`);

      // Log COD collection (implement proper COD handling later)
      if (status === ShipmentStatus.DELIVERED && codCollected) {
        console.log(`COD collected for shipment ${shipmentId}: ${codCollected}`);
      }

      // Update agent statistics
      await this.updateAgentStats(agentId, status);

      // Emit real-time event (will be implemented in Phase 5)
      // this.emitTrackingEvent(shipmentId, status, location);

      return true;

    } catch (error) {
      console.error('Error updating shipment status:', error);
      return false;
    }
  }

  // Get shipment tracking for customers
  static async getShipmentTracking(shipmentId: string): Promise<any> {
    try {
      const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId },
        include: {
          agent: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        }
      });

      if (!shipment) {
        return { success: false, error: 'Shipment not found' };
      }

      return {
        success: true,
        shipment: {
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          shippingOption: shipment.shippingOption,
          estimatedDelivery: shipment.estimatedDelivery,
          actualDelivery: shipment.deliveredAt,
          agent: shipment.agent ? {
            name: `${shipment.agent.user.firstName} ${shipment.agent.user.lastName}`,
            vehicleType: shipment.agent.vehicleType,
            phone: '***-***-**' + shipment.agent.phoneNumber?.slice(-2) // Masked phone
          } : null
        }
      };

    } catch (error) {
      console.error('Error getting shipment tracking:', error);
      return {
        success: false,
        error: 'Failed to get tracking information'
      };
    }
  }

  // Get deliveries assigned to agent
  static async getAgentDeliveries(agentId: string, status?: ShipmentStatus): Promise<any> {
    try {
      const whereClause: any = { agentId };
      if (status) {
        whereClause.status = status;
      }

      const shipments = await prisma.shipment.findMany({
        where: whereClause,
        orderBy: [
          { status: 'asc' },
          { estimatedDelivery: 'asc' }
        ]
      });

      return {
        success: true,
        shipments: shipments.map(shipment => ({
          id: shipment.id,
          trackingNumber: shipment.trackingNumber,
          status: shipment.status,
          shippingOption: shipment.shippingOption,
          pickupAddress: shipment.pickupAddress,
          deliveryAddress: shipment.deliveryAddress,
          estimatedDelivery: shipment.estimatedDelivery,
          deliveryNotes: shipment.deliveryNotes,
          recipientName: shipment.recipientName,
          recipientPhone: shipment.recipientPhone
        }))
      };

    } catch (error) {
      console.error('Error getting agent deliveries:', error);
      return {
        success: false,
        error: 'Failed to get agent deliveries'
      };
    }
  }

  // Update agent location (real-time tracking)
  static async updateAgentLocation(update: AgentLocationUpdate): Promise<boolean> {
    try {
      const { agentId, latitude, longitude, timestamp } = update;

      await prisma.deliveryAgent.update({
        where: { id: agentId },
        data: {
          currentLocation: JSON.stringify({
            latitude,
            longitude,
            timestamp
          }),
          lastActiveAt: new Date()
        }
      });

      // Update current shipment location if agent is on delivery
      const activeShipment = await prisma.shipment.findFirst({
        where: {
          agentId,
          status: {
            in: [ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT]
          }
        }
      });

      if (activeShipment) {
        // Log location update for active shipment
        console.log(`Active shipment ${activeShipment.id} location updated:`, { latitude, longitude });

        // Emit real-time location update (Phase 5)
        // this.emitLocationUpdate(activeShipment.id, { latitude, longitude });
      }

      return true;

    } catch (error) {
      console.error('Error updating agent location:', error);
      return false;
    }
  }

  // Register delivery agent
  static async registerDeliveryAgent(userId: string, agentData: any): Promise<any> {
    try {
      const agent = await prisma.deliveryAgent.create({
        data: {
          userId,
          businessName: agentData.businessName,
          vehicleType: agentData.vehicleType || 'bike',
          licensePlate: agentData.plateNumber,
          licenseNumber: agentData.licenseNumber,
          phoneNumber: agentData.phoneNumber,
          emergencyContact: agentData.emergencyContact,
          bankDetails: JSON.stringify(agentData.bankDetails || {}),
          isVerified: false,
          isAvailable: true
        },
        include: {
          user: true
        }
      });

      return {
        success: true,
        agent
      };

    } catch (error) {
      console.error('Error registering delivery agent:', error);
      return {
        success: false,
        error: 'Failed to register delivery agent'
      };
    }
  }

  // Helper methods

  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private static isLocationInZone(location: any, geoJson: any): boolean {
    // Simplified point-in-polygon check
    // In production, use proper GIS library like turf.js
    return true; // For now, assume all locations are serviceable
  }

  private static generateTrackingNumber(): string {
    return `GEO${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  private static getEstimatedDays(deliveryType: ShippingOption): number {
    switch (deliveryType) {
      case ShippingOption.SAME_DAY: return 0;
      case ShippingOption.NEXT_DAY: return 1;
      case ShippingOption.EXPRESS: return 1;
      default: return 2;
    }
  }

  private static getEstimatedHours(deliveryType: ShippingOption): number {
    switch (deliveryType) {
      case ShippingOption.SAME_DAY: return 8;
      case ShippingOption.NEXT_DAY: return 24;
      case ShippingOption.EXPRESS: return 12;
      default: return 48;
    }
  }

  private static getDeliveryFeatures(partner: any): string[] {
    if (!partner) return ['tracking', 'cod', 'proof_of_delivery'];
    
    const features = ['tracking'];
    if (partner.supportsCOD) features.push('cod');
    if (partner.supportsTracking) features.push('real_time_tracking');
    return features;
  }

  // Tracking events would be implemented with proper event system
  private static logTrackingEvent(shipmentId: string, eventData: any): void {
    console.log(`Tracking event for ${shipmentId}:`, eventData);
  }

  private static mapStatusToEventType(status: ShipmentStatus): string {
    const mapping = {
      [ShipmentStatus.PENDING]: 'SHIPMENT_CREATED',
      [ShipmentStatus.ASSIGNED]: 'SHIPMENT_ASSIGNED',
      [ShipmentStatus.PICKED_UP]: 'PICKED_UP',
      [ShipmentStatus.IN_TRANSIT]: 'IN_TRANSIT',
      [ShipmentStatus.DELIVERED]: 'DELIVERED',
      [ShipmentStatus.FAILED]: 'DELIVERY_FAILED',
      [ShipmentStatus.CANCELLED]: 'CANCELLED'
    };
    return mapping[status] || status;
  }

  private static getStatusDescription(status: ShipmentStatus, notes?: string): string {
    const descriptions = {
      [ShipmentStatus.PENDING]: 'Shipment is awaiting pickup',
      [ShipmentStatus.ASSIGNED]: 'Shipment assigned to delivery agent',
      [ShipmentStatus.PICKED_UP]: 'Package has been picked up from sender',
      [ShipmentStatus.IN_TRANSIT]: 'Package is on the way to destination',
      [ShipmentStatus.DELIVERED]: 'Package has been successfully delivered',
      [ShipmentStatus.FAILED]: 'Delivery attempt failed',
      [ShipmentStatus.CANCELLED]: 'Shipment has been cancelled'
    };
    
    const baseDescription = descriptions[status] || status;
    return notes ? `${baseDescription}. Note: ${notes}` : baseDescription;
  }

  private static async autoAssignAgent(shipmentId: string): Promise<void> {
    // Simple auto-assignment logic - in production use more sophisticated routing
    const availableAgent = await prisma.deliveryAgent.findFirst({
      where: {
        status: 'active',
        isVerified: true,
        isAvailable: true
      },
      orderBy: {
        totalDeliveries: 'asc' // Assign to agent with least deliveries
      }
    });

    if (availableAgent) {
      await prisma.shipment.update({
        where: { id: shipmentId },
        data: { agentId: availableAgent.id }
      });

      console.log(`Agent ${availableAgent.id} (${availableAgent.businessName || 'Agent'}) assigned to shipment ${shipmentId}`);
    }
  }

  // COD collection would be implemented with proper financial system
  private static logCODCollection(shipmentId: string, agentId: string, amount: number): void {
    console.log(`COD collected: Shipment ${shipmentId}, Agent ${agentId}, Amount ${amount}`);
  }

  private static async updateAgentStats(agentId: string, status: ShipmentStatus): Promise<void> {
    // Update total deliveries count and last active time
    if (status === ShipmentStatus.DELIVERED) {
      await prisma.deliveryAgent.update({
        where: { id: agentId },
        data: {
          totalDeliveries: { increment: 1 },
          lastActiveAt: new Date()
        }
      });
    }
  }
}
