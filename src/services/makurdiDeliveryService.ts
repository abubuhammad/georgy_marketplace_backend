import { prisma } from '../lib/prisma';

// Makurdi Zone Configuration
export const MAKURDI_ZONES = [
  {
    code: 'MKD-NB',
    name: 'North Bank',
    baseFee: 400,
    perKmFee: 50,
    minFee: 400,
    maxFee: 3000,
    estimatedTime: 30,
    areas: ['North Bank', 'Gyado Villa', 'Behind CBN', 'Welfare Quarters'],
    center: { lat: 7.7500, lng: 8.5167 }
  },
  {
    code: 'MKD-WK',
    name: 'Wurukum',
    baseFee: 350,
    perKmFee: 50,
    minFee: 350,
    maxFee: 2500,
    estimatedTime: 25,
    areas: ['Wurukum', 'Modern Market', 'High Level', 'Old GRA'],
    center: { lat: 7.7333, lng: 8.5333 }
  },
  {
    code: 'MKD-LG',
    name: 'Logo/Kanshio',
    baseFee: 400,
    perKmFee: 50,
    minFee: 400,
    maxFee: 3000,
    estimatedTime: 35,
    areas: ['Logo I', 'Logo II', 'Kanshio', 'Naka Road', 'Federal Housing'],
    center: { lat: 7.7200, lng: 8.5400 }
  },
  {
    code: 'MKD-WD',
    name: 'Wadata',
    baseFee: 350,
    perKmFee: 50,
    minFee: 350,
    maxFee: 2500,
    estimatedTime: 25,
    areas: ['Wadata', 'Ankpa Quarters', 'Judges Quarters'],
    center: { lat: 7.7400, lng: 8.5200 }
  },
  {
    code: 'MKD-UA',
    name: 'UAM Area',
    baseFee: 500,
    perKmFee: 60,
    minFee: 500,
    maxFee: 4000,
    estimatedTime: 45,
    areas: ['University of Agriculture', 'Agbadu', 'Single Quarters', 'Staff Quarters'],
    center: { lat: 7.7800, lng: 8.5600 }
  },
  {
    code: 'MKD-IL',
    name: 'Industrial Layout',
    baseFee: 450,
    perKmFee: 55,
    minFee: 450,
    maxFee: 3500,
    estimatedTime: 40,
    areas: ['Industrial Layout', 'BIPC', 'Brewery'],
    center: { lat: 7.7100, lng: 8.5100 }
  },
  {
    code: 'MKD-MM',
    name: 'Modern Market Area',
    baseFee: 300,
    perKmFee: 45,
    minFee: 300,
    maxFee: 2000,
    estimatedTime: 20,
    areas: ['Modern Market', 'Railway', 'Gaadi', 'Clerk Quarters'],
    center: { lat: 7.7250, lng: 8.5250 }
  },
  {
    code: 'MKD-HL',
    name: 'High Level',
    baseFee: 350,
    perKmFee: 50,
    minFee: 350,
    maxFee: 2500,
    estimatedTime: 30,
    areas: ['High Level', 'New GRA', 'Government House Area'],
    center: { lat: 7.7350, lng: 8.5100 }
  }
];

// Cross-zone fees (additional fees when delivering between zones)
export const CROSS_ZONE_FEES: { [from: string]: { [to: string]: number } } = {
  'MKD-NB': { 'MKD-UA': 300, 'MKD-IL': 250, 'MKD-LG': 200 },
  'MKD-WK': { 'MKD-UA': 250, 'MKD-NB': 200, 'MKD-IL': 150 },
  'MKD-UA': { 'MKD-MM': 350, 'MKD-WD': 300, 'MKD-IL': 300 },
  'MKD-IL': { 'MKD-UA': 300, 'MKD-NB': 250, 'MKD-LG': 200 }
};

// Global delivery settings
export const DELIVERY_SETTINGS = {
  platformCommission: 0.15, // 15%
  agentCommission: 0.85, // 85%
  insuranceThreshold: 50000, // NGN
  insuranceRate: 0.01, // 1%
  weightFreeLimit: 5, // kg
  weightSurchargePerKg: 100, // NGN per kg above limit
  expressMultiplier: 1.3,
  sameDayMultiplier: 1.5,
  scheduledMultiplier: 1.0,
  minDeliveryFee: 300,
  maxDeliveryFee: 5000,
  operatingHours: { start: '07:00', end: '21:00' }
};

export interface DeliveryQuoteParams {
  pickupLocation: {
    lat: number;
    lng: number;
    address?: string;
    zone?: string;
  };
  deliveryLocation: {
    lat: number;
    lng: number;
    address?: string;
    zone?: string;
  };
  weight?: number;
  packageValue: number;
  deliveryType: 'standard' | 'express' | 'same_day' | 'scheduled';
  scheduledTime?: string;
}

export interface DeliveryQuoteResult {
  success: boolean;
  quote?: {
    pickupZone: string;
    deliveryZone: string;
    distance: number;
    breakdown: {
      baseFee: number;
      distanceFee: number;
      weightFee: number;
      crossZoneFee: number;
      deliveryTypeMultiplier: number;
      insuranceFee: number;
      subtotal: number;
      platformFee: number;
    };
    totalFee: number;
    agentEarning: number;
    estimatedTime: string;
    estimatedArrival: string;
  };
  error?: string;
}

export class MakurdiDeliveryService {
  
  /**
   * Calculate delivery quote for Makurdi
   */
  static async calculateDeliveryQuote(params: DeliveryQuoteParams): Promise<DeliveryQuoteResult> {
    try {
      const { pickupLocation, deliveryLocation, weight, packageValue, deliveryType } = params;
      
      // Step 1: Determine zones
      const pickupZone = params.pickupLocation.zone || this.determineZone(pickupLocation);
      const deliveryZone = params.deliveryLocation.zone || this.determineZone(deliveryLocation);
      
      if (!pickupZone || !deliveryZone) {
        return {
          success: false,
          error: 'Location is outside Makurdi delivery coverage area'
        };
      }
      
      // Step 2: Get zone configurations
      const pickupZoneConfig = MAKURDI_ZONES.find(z => z.code === pickupZone);
      const deliveryZoneConfig = MAKURDI_ZONES.find(z => z.code === deliveryZone);
      
      if (!pickupZoneConfig || !deliveryZoneConfig) {
        return {
          success: false,
          error: 'Invalid delivery zone'
        };
      }
      
      // Step 3: Calculate distance
      const distance = this.calculateDistance(
        pickupLocation.lat, pickupLocation.lng,
        deliveryLocation.lat, deliveryLocation.lng
      );
      
      // Step 4: Calculate fees
      const baseFee = deliveryZoneConfig.baseFee;
      
      // Distance fee (charge for distance > 3km)
      const distanceFee = distance > 3 
        ? Math.round((distance - 3) * deliveryZoneConfig.perKmFee) 
        : 0;
      
      // Weight fee
      const weightFee = weight && weight > DELIVERY_SETTINGS.weightFreeLimit
        ? Math.round((weight - DELIVERY_SETTINGS.weightFreeLimit) * DELIVERY_SETTINGS.weightSurchargePerKg)
        : 0;
      
      // Cross-zone fee
      const crossZoneFee = pickupZone !== deliveryZone
        ? this.getCrossZoneFee(pickupZone, deliveryZone)
        : 0;
      
      // Delivery type multiplier
      let deliveryTypeMultiplier = 1;
      switch (deliveryType) {
        case 'express':
          deliveryTypeMultiplier = DELIVERY_SETTINGS.expressMultiplier;
          break;
        case 'same_day':
          deliveryTypeMultiplier = DELIVERY_SETTINGS.sameDayMultiplier;
          break;
        case 'scheduled':
          deliveryTypeMultiplier = DELIVERY_SETTINGS.scheduledMultiplier;
          break;
      }
      
      // Insurance fee (for high-value items)
      const insuranceFee = packageValue > DELIVERY_SETTINGS.insuranceThreshold
        ? Math.round(packageValue * DELIVERY_SETTINGS.insuranceRate)
        : 0;
      
      // Calculate subtotal
      const subtotal = Math.round(
        (baseFee + distanceFee + weightFee + crossZoneFee) * deliveryTypeMultiplier
      );
      
      // Platform fee
      const platformFee = Math.round(subtotal * DELIVERY_SETTINGS.platformCommission);
      
      // Total fee (apply min/max limits)
      let totalFee = subtotal + insuranceFee + platformFee;
      totalFee = Math.max(totalFee, deliveryZoneConfig.minFee);
      if (deliveryZoneConfig.maxFee) {
        totalFee = Math.min(totalFee, deliveryZoneConfig.maxFee);
      }
      
      // Agent earning
      const agentEarning = Math.round(subtotal * DELIVERY_SETTINGS.agentCommission);
      
      // Estimated time
      const estimatedTime = this.getEstimatedTime(deliveryType, distance, deliveryZoneConfig.estimatedTime);
      const estimatedArrival = this.getEstimatedArrival(deliveryType, estimatedTime);
      
      return {
        success: true,
        quote: {
          pickupZone,
          deliveryZone,
          distance: Math.round(distance * 100) / 100,
          breakdown: {
            baseFee,
            distanceFee,
            weightFee,
            crossZoneFee,
            deliveryTypeMultiplier,
            insuranceFee,
            subtotal,
            platformFee
          },
          totalFee,
          agentEarning,
          estimatedTime,
          estimatedArrival
        }
      };
      
    } catch (error) {
      console.error('Error calculating delivery quote:', error);
      return {
        success: false,
        error: 'Failed to calculate delivery quote'
      };
    }
  }
  
  /**
   * Determine which Makurdi zone a location belongs to
   */
  static determineZone(location: { lat: number; lng: number }): string | null {
    // Find nearest zone based on distance to zone center
    let nearestZone: string | null = null;
    let minDistance = Infinity;
    
    for (const zone of MAKURDI_ZONES) {
      const distance = this.calculateDistance(
        location.lat, location.lng,
        zone.center.lat, zone.center.lng
      );
      
      // Maximum radius for a zone is 10km
      if (distance < minDistance && distance <= 10) {
        minDistance = distance;
        nearestZone = zone.code;
      }
    }
    
    return nearestZone;
  }
  
  /**
   * Get cross-zone delivery fee
   */
  static getCrossZoneFee(fromZone: string, toZone: string): number {
    // Check direct mapping
    if (CROSS_ZONE_FEES[fromZone]?.[toZone]) {
      return CROSS_ZONE_FEES[fromZone][toZone];
    }
    
    // Check reverse mapping
    if (CROSS_ZONE_FEES[toZone]?.[fromZone]) {
      return CROSS_ZONE_FEES[toZone][fromZone];
    }
    
    // Default cross-zone fee
    return 150;
  }
  
  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
  
  /**
   * Get estimated delivery time
   */
  static getEstimatedTime(deliveryType: string, distance: number, baseTime: number): string {
    let timeMinutes = baseTime + (distance * 3); // Add 3 minutes per km
    
    switch (deliveryType) {
      case 'same_day':
        return `${Math.round(timeMinutes)}-${Math.round(timeMinutes + 30)} mins`;
      case 'express':
        timeMinutes *= 0.8; // 20% faster
        return `${Math.round(timeMinutes)}-${Math.round(timeMinutes + 20)} mins`;
      case 'scheduled':
        return 'As scheduled';
      default:
        return `${Math.round(timeMinutes)}-${Math.round(timeMinutes + 45)} mins`;
    }
  }
  
  /**
   * Get estimated arrival time
   */
  static getEstimatedArrival(deliveryType: string, estimatedTime: string): string {
    if (deliveryType === 'scheduled') {
      return 'As scheduled';
    }
    
    const now = new Date();
    const match = estimatedTime.match(/(\d+)-(\d+)/);
    if (match) {
      const maxMinutes = parseInt(match[2]);
      const arrivalTime = new Date(now.getTime() + maxMinutes * 60000);
      return arrivalTime.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    }
    
    return 'Within 1 hour';
  }
  
  /**
   * Find available delivery agents near a location
   */
  static async findAvailableAgents(location: { lat: number; lng: number }, maxRadius: number = 10): Promise<any[]> {
    try {
      // Get all online, verified, available agents
      const agents = await prisma.deliveryAgent.findMany({
        where: {
          status: 'active',
          isVerified: true,
          isAvailable: true
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          },
          shipments: {
            where: {
              status: {
                in: ['assigned', 'picked_up', 'in_transit']
              }
            }
          }
        }
      });
      
      // Filter and score agents by proximity
      const scoredAgents = agents
        .map(agent => {
          let agentLocation = { lat: 0, lng: 0 };
          if (agent.currentLocation) {
            try {
              agentLocation = JSON.parse(agent.currentLocation);
            } catch (e) {
              // Invalid location data
            }
          }
          
          const distance = this.calculateDistance(
            location.lat, location.lng,
            agentLocation.lat, agentLocation.lng
          );
          
          return { agent, distance };
        })
        .filter(item => item.distance <= maxRadius)
        .sort((a, b) => a.distance - b.distance);
      
      return scoredAgents;
      
    } catch (error) {
      console.error('Error finding available agents:', error);
      return [];
    }
  }
  
  /**
   * Auto-assign delivery agent to shipment
   */
  static async autoAssignAgent(shipmentId: string): Promise<{ success: boolean; agentId?: string; error?: string }> {
    try {
      const shipment = await prisma.shipment.findUnique({
        where: { id: shipmentId }
      });
      
      if (!shipment) {
        return { success: false, error: 'Shipment not found' };
      }
      
      // Parse pickup location
      let pickupLocation = { lat: 7.7333, lng: 8.5333 }; // Default Makurdi center
      if (shipment.pickupAddress) {
        try {
          const parsed = JSON.parse(shipment.pickupAddress);
          if (parsed.lat && parsed.lng) {
            pickupLocation = { lat: parsed.lat, lng: parsed.lng };
          }
        } catch (e) {
          // Use default
        }
      }
      
      // Find available agents
      const availableAgents = await this.findAvailableAgents(pickupLocation, 15);
      
      if (availableAgents.length === 0) {
        return { success: false, error: 'No available agents in the area' };
      }
      
      // Score agents based on multiple factors
      const scoredAgents = availableAgents.map(({ agent, distance }) => {
        let score = 100;
        
        // Proximity score (closer is better)
        score -= distance * 5;
        
        // Current load (fewer active deliveries is better)
        const activeDeliveries = agent.shipments?.length || 0;
        score -= activeDeliveries * 20;
        
        // Rating bonus
        const rating = agent.rating || 3;
        score += rating * 5;
        
        // Experience bonus
        if (agent.totalDeliveries > 100) score += 15;
        else if (agent.totalDeliveries > 50) score += 10;
        else if (agent.totalDeliveries > 20) score += 5;
        
        // On-time rate bonus
        const onTimeRate = agent.onTimeRate || 80;
        score += (onTimeRate / 100) * 10;
        
        // Vehicle type consideration
        const maxCapacity = this.getVehicleCapacity(agent.vehicleType);
        if (activeDeliveries >= maxCapacity) {
          score = -100; // Agent at capacity
        }
        
        return { agent, score, distance };
      });
      
      // Sort by score and get best agent
      scoredAgents.sort((a, b) => b.score - a.score);
      const bestAgent = scoredAgents.find(a => a.score > 0);
      
      if (!bestAgent) {
        return { success: false, error: 'All agents are at capacity' };
      }
      
      // Assign agent to shipment
      await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          agentId: bestAgent.agent.id,
          status: 'assigned',
          assignedAt: new Date()
        }
      });
      
      console.log(`Agent ${bestAgent.agent.id} assigned to shipment ${shipmentId} (score: ${bestAgent.score}, distance: ${bestAgent.distance.toFixed(2)}km)`);
      
      return { success: true, agentId: bestAgent.agent.id };
      
    } catch (error) {
      console.error('Error auto-assigning agent:', error);
      return { success: false, error: 'Failed to assign agent' };
    }
  }
  
  /**
   * Get vehicle capacity
   */
  static getVehicleCapacity(vehicleType: string): number {
    switch (vehicleType) {
      case 'bike': return 2;
      case 'tricycle': return 4;
      case 'car': return 5;
      case 'van': return 10;
      default: return 2;
    }
  }
  
  /**
   * Get all Makurdi zones
   */
  static getZones(): typeof MAKURDI_ZONES {
    return MAKURDI_ZONES;
  }
  
  /**
   * Get zone by code
   */
  static getZoneByCode(code: string): typeof MAKURDI_ZONES[0] | undefined {
    return MAKURDI_ZONES.find(z => z.code === code);
  }
  
  /**
   * Check if location is within Makurdi coverage
   */
  static isWithinCoverage(location: { lat: number; lng: number }): boolean {
    // Makurdi approximate boundaries
    const bounds = {
      north: 7.85,
      south: 7.65,
      east: 8.62,
      west: 8.45
    };
    
    return (
      location.lat >= bounds.south &&
      location.lat <= bounds.north &&
      location.lng >= bounds.west &&
      location.lng <= bounds.east
    );
  }
  
  /**
   * Get delivery settings
   */
  static getSettings(): typeof DELIVERY_SETTINGS {
    return DELIVERY_SETTINGS;
  }
  
  /**
   * Update agent earnings after successful delivery
   */
  static async creditAgentEarning(agentId: string, shipmentId: string, amount: number): Promise<boolean> {
    try {
      // Create earning record
      await prisma.$transaction([
        // Create earning entry (if model exists)
        // prisma.deliveryEarning.create({
        //   data: {
        //     agentId,
        //     shipmentId,
        //     type: 'delivery',
        //     amount,
        //     status: 'approved'
        //   }
        // }),
        
        // Update agent's total earnings
        prisma.deliveryAgent.update({
          where: { id: agentId },
          data: {
            earnings: { increment: amount },
            totalDeliveries: { increment: 1 }
          }
        })
      ]);
      
      console.log(`Credited ${amount} NGN to agent ${agentId} for shipment ${shipmentId}`);
      return true;
      
    } catch (error) {
      console.error('Error crediting agent earning:', error);
      return false;
    }
  }
}

export default MakurdiDeliveryService;
