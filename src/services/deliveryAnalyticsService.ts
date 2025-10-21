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

enum VehicleType {
  BIKE = 'bike',
  CAR = 'car',
  VAN = 'van',
  TRUCK = 'truck'
}

export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
}

export interface AnalyticsFilters {
  partnerId?: string;
  agentId?: string;
  zoneId?: string;
  deliveryType?: string;
  status?: ShipmentStatus;
}

export interface DeliveryMetrics {
  totalShipments: number;
  deliveredShipments: number;
  failedShipments: number;
  inTransitShipments: number;
  deliveryRate: number;
  averageDeliveryTime: number;
  totalRevenue: number;
  totalCOD: number;
  averageRating: number;
  onTimeDeliveryRate: number;
  costPerDelivery: number;
  revenuePerDelivery: number;
  returnRate: number;
}

export interface AgentPerformanceData {
  agentId: string;
  agentName: string;
  employeeId: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageDeliveryTime: number;
  totalDistance: number;
  averageRating: number;
  totalEarnings: number;
  hoursWorked: number;
  deliveriesPerHour: number;
  fuelEfficiency?: number;
  customerComplaints: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  vehicleType: VehicleType;
  activeHours: number;
  lastDelivery: Date | null;
  performanceTrend: 'up' | 'down' | 'stable';
}

export interface ZonePerformanceData {
  zoneId: string;
  zoneName: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  averageDeliveryTime: number;
  successRate: number;
  totalRevenue: number;
  averageDistance: number;
  coverage: number;
  activeAgents: number;
  peakHours: string[];
  demandDensity: number;
  costEfficiency: number;
}

export interface TimeSeriesData {
  date: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageDeliveryTime: number;
  totalRevenue: number;
  onTimeDeliveries: number;
  customerSatisfaction: number;
  activeAgents: number;
}

export interface DeliveryInsight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'efficiency' | 'cost' | 'customer';
  metadata?: any;
}

export class DeliveryAnalyticsService {
  // Main analytics method - gets comprehensive delivery metrics
  static async getDeliveryAnalytics(
    timeframe: AnalyticsTimeframe,
    filters: AnalyticsFilters = {}
  ): Promise<{
    success: boolean;
    data?: {
      metrics: DeliveryMetrics;
      agentPerformance: AgentPerformanceData[];
      zonePerformance: ZonePerformanceData[];
      timeSeriesData: TimeSeriesData[];
      insights: DeliveryInsight[];
    };
    error?: string;
  }> {
    try {
      const [
        metrics,
        agentPerformance,
        zonePerformance,
        timeSeriesData,
        insights
      ] = await Promise.all([
        this.calculateDeliveryMetrics(timeframe, filters),
        this.getAgentPerformanceData(timeframe, filters),
        this.getZonePerformanceData(timeframe, filters),
        this.getTimeSeriesData(timeframe, filters),
        this.generateInsights(timeframe, filters)
      ]);

      return {
        success: true,
        data: {
          metrics,
          agentPerformance,
          zonePerformance,
          timeSeriesData,
          insights
        }
      };
    } catch (error) {
      console.error('Error getting delivery analytics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get analytics data'
      };
    }
  }

  // Calculate core delivery metrics
  static async calculateDeliveryMetrics(
    timeframe: AnalyticsTimeframe,
    filters: AnalyticsFilters = {}
  ): Promise<DeliveryMetrics> {
    const whereClause = this.buildWhereClause(timeframe, filters);

    // Get shipment counts by status
    const shipmentCounts = await prisma.shipment.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        id: true
      }
    });

    // Calculate basic metrics
    const totalShipments = shipmentCounts.reduce((sum, item) => sum + item._count.id, 0);
    const deliveredShipments = shipmentCounts.find(item => item.status === ShipmentStatus.DELIVERED)?._count.id || 0;
    const failedShipments = shipmentCounts.find(item => item.status === ShipmentStatus.FAILED)?._count.id || 0;
    const inTransitShipments = shipmentCounts.filter(item => 
      [ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT].includes(item.status as ShipmentStatus)
    ).reduce((sum, item) => sum + item._count.id, 0);

    // Get delivery times and revenue data
    const deliveryData = await prisma.shipment.findMany({
      where: {
        ...whereClause,
        status: ShipmentStatus.DELIVERED,
        actualDelivery: { not: null }
      },
      select: {
        estimatedDelivery: true,
        deliveredAt: true,
        deliveryFee: true,
        // codAmount: true, // COD would be tracked separately
        createdAt: true
      }
    });

    // Calculate time-based metrics
    const deliveryTimes = deliveryData
      .filter(item => item.deliveredAt)
      .map(item => {
        const estimated = item.estimatedDelivery;
        const actual = item.deliveredAt!;
        const deliveryTime = (actual.getTime() - item.createdAt.getTime()) / (1000 * 60); // minutes
        const onTime = estimated ? actual <= estimated : false;
        return { deliveryTime, onTime };
      });

    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((sum, item) => sum + item.deliveryTime, 0) / deliveryTimes.length 
      : 0;

    const onTimeDeliveries = deliveryTimes.filter(item => item.onTime).length;
    const onTimeDeliveryRate = deliveryTimes.length > 0 
      ? (onTimeDeliveries / deliveryTimes.length) * 100 
      : 0;

    // Calculate revenue metrics
    const totalRevenue = deliveryData.reduce((sum, item) => sum + Number(item.deliveryFee), 0);
    const totalCOD = 0; // COD tracking would be implemented separately
    const revenuePerDelivery = deliveredShipments > 0 ? totalRevenue / deliveredShipments : 0;

    // Get ratings data (assuming a rating system exists)
    const ratingsData = await prisma.shipment.findMany({
      where: {
        ...whereClause,
        status: ShipmentStatus.DELIVERED
      },
      select: {
        id: true,
        // Assuming rating is stored in metadata or a separate table
      }
    });

    // Calculate return rate (failed after delivery attempts)
    const returnedShipments = await prisma.shipment.count({
      where: {
        ...whereClause,
        status: ShipmentStatus.FAILED,
        // Assuming failed reason indicates returns
      }
    });

    const deliveryRate = totalShipments > 0 ? (deliveredShipments / totalShipments) * 100 : 0;
    const returnRate = deliveredShipments > 0 ? (returnedShipments / deliveredShipments) * 100 : 0;
    
    // Estimate cost per delivery (this would normally come from cost tracking)
    const estimatedCostPerDelivery = revenuePerDelivery * 0.6; // 60% cost ratio estimate

    return {
      totalShipments,
      deliveredShipments,
      failedShipments,
      inTransitShipments,
      deliveryRate,
      averageDeliveryTime,
      totalRevenue,
      totalCOD,
      averageRating: 4.6, // Mock rating - would calculate from actual ratings
      onTimeDeliveryRate,
      costPerDelivery: estimatedCostPerDelivery,
      revenuePerDelivery,
      returnRate
    };
  }

  // Get agent performance data
  static async getAgentPerformanceData(
    timeframe: AnalyticsTimeframe,
    filters: AnalyticsFilters = {}
  ): Promise<AgentPerformanceData[]> {
    const whereClause = this.buildWhereClause(timeframe, filters);

    const agentData = await prisma.deliveryAgent.findMany({
      where: {
        status: 'active',
        ...(filters.agentId && { id: filters.agentId })
      },
      include: {
        user: {
          select: { firstName: true, lastName: true }
        },
        shipments: {
          where: whereClause,
          select: {
            id: true,
            status: true,
            createdAt: true,
            deliveredAt: true,
            estimatedDelivery: true,
            deliveryFee: true
          }
        }
      }
    });

    return agentData.map(agent => {
      const shipments = agent.shipments;
      const totalDeliveries = shipments.length;
      const successfulDeliveries = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;
      const failedDeliveries = shipments.filter(s => s.status === ShipmentStatus.FAILED).length;
      
      const deliveryTimes = shipments
        .filter(s => s.deliveredAt)
        .map(s => (s.deliveredAt!.getTime() - s.createdAt.getTime()) / (1000 * 60));
      
      const averageDeliveryTime = deliveryTimes.length > 0 
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
        : 0;

      const onTimeDeliveries = shipments.filter(s => 
        s.deliveredAt && s.estimatedDelivery && s.deliveredAt <= s.estimatedDelivery
      ).length;

      const totalEarnings = shipments.reduce((sum, s) => sum + Number(s.deliveryFee || 0), 0);
      
      // Estimate hours worked (this would come from time tracking in production)
      const hoursWorked = totalDeliveries * 1.5; // Estimate 1.5 hours per delivery
      
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
      const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) * 100 : 0;
      
      // Calculate performance trend (simplified)
      const recentPerformance = successRate;
      const performanceTrend: 'up' | 'down' | 'stable' = 
        recentPerformance > 95 ? 'up' : recentPerformance < 85 ? 'down' : 'stable';

      return {
        agentId: agent.id,
        agentName: agent.businessName || `Agent ${agent.id}`,
        employeeId: agent.id,
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        successRate,
        averageDeliveryTime,
        totalDistance: totalDeliveries * 15, // Estimate 15km average per delivery
        averageRating: 4.6, // Mock rating
        totalEarnings,
        hoursWorked,
        deliveriesPerHour: hoursWorked > 0 ? totalDeliveries / hoursWorked : 0,
        customerComplaints: failedDeliveries, // Simplified
        onTimeDeliveries,
        onTimeRate,
        vehicleType: agent.vehicleType as VehicleType,
        activeHours: hoursWorked,
        lastDelivery: shipments.length > 0 ? 
          shipments.reduce((latest, s) => s.deliveredAt && (!latest || s.deliveredAt > latest) ? s.deliveredAt : latest, null as Date | null) : null,
        performanceTrend
      };
    });
  }

  // Get zone performance data
  static async getZonePerformanceData(
    timeframe: AnalyticsTimeframe,
    filters: AnalyticsFilters = {}
  ): Promise<ZonePerformanceData[]> {
    const whereClause = this.buildWhereClause(timeframe, filters);

    const zones = await prisma.deliveryZone.findMany({
      where: {
        isActive: true,
        ...(filters.zoneId && { id: filters.zoneId })
      },
      include: {
        shipments: {
          where: whereClause,
          select: {
            id: true,
            status: true,
            deliveryFee: true,
            createdAt: true,
            deliveredAt: true,
            estimatedDelivery: true
          }
        }
      }
    });

    return zones.map(zone => {
      const shipments = zone.shipments;
      const totalDeliveries = shipments.length;
      const successfulDeliveries = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;
      
      const deliveryTimes = shipments
        .filter(s => s.deliveredAt)
        .map(s => (s.deliveredAt!.getTime() - s.createdAt.getTime()) / (1000 * 60));
      
      const averageDeliveryTime = deliveryTimes.length > 0 
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
        : 0;

      const totalRevenue = shipments.reduce((sum, s) => sum + Number(s.deliveryFee || 0), 0);
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

      // Estimate coverage and other metrics
      const coverage = Math.min(95 + Math.random() * 5, 100); // Mock coverage percentage
      const averageDistance = 8 + Math.random() * 10; // Mock average distance
      const activeAgents = Math.floor(totalDeliveries / 20) + 1; // Estimate active agents

      return {
        zoneId: zone.id,
        zoneName: zone.name,
        totalDeliveries,
        successfulDeliveries,
        averageDeliveryTime,
        successRate,
        totalRevenue,
        averageDistance,
        coverage,
        activeAgents,
        peakHours: ['09:00-11:00', '14:00-16:00', '18:00-20:00'], // Mock peak hours
        demandDensity: totalDeliveries / 30, // Deliveries per day estimate
        costEfficiency: totalRevenue > 0 ? (totalRevenue * 0.4) / totalDeliveries : 0 // Mock efficiency
      };
    });
  }

  // Get time series data for trends
  static async getTimeSeriesData(
    timeframe: AnalyticsTimeframe,
    filters: AnalyticsFilters = {}
  ): Promise<TimeSeriesData[]> {
    const whereClause = this.buildWhereClause(timeframe, filters);
    const daysDiff = Math.ceil((timeframe.end.getTime() - timeframe.start.getTime()) / (1000 * 60 * 60 * 24));
    
    const timeSeriesData: TimeSeriesData[] = [];
    
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(timeframe.start);
      currentDate.setDate(currentDate.getDate() + i);
      
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayShipments = await prisma.shipment.findMany({
        where: {
          ...whereClause,
          createdAt: {
            gte: currentDate,
            lt: nextDate
          }
        },
        select: {
          id: true,
          status: true,
          deliveryFee: true,
          actualDelivery: true,
          estimatedDelivery: true,
          createdAt: true
        }
      });

      const totalDeliveries = dayShipments.length;
      const successfulDeliveries = dayShipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;
      const failedDeliveries = dayShipments.filter(s => s.status === ShipmentStatus.FAILED).length;
      
      const deliveryTimes = dayShipments
        .filter(s => s.actualDelivery)
        .map(s => (s.actualDelivery!.getTime() - s.createdAt.getTime()) / (1000 * 60));
      
      const averageDeliveryTime = deliveryTimes.length > 0 
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
        : 0;

      const totalRevenue = dayShipments.reduce((sum, s) => sum + Number(s.deliveryFee || 0), 0);
      const onTimeDeliveries = dayShipments.filter(s => 
        s.actualDelivery && s.estimatedDelivery && s.actualDelivery <= s.estimatedDelivery
      ).length;

      timeSeriesData.push({
        date: currentDate.toISOString().split('T')[0],
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        averageDeliveryTime,
        totalRevenue,
        onTimeDeliveries,
        customerSatisfaction: 4.2 + Math.random() * 0.8, // Mock satisfaction score
        activeAgents: Math.floor(totalDeliveries / 5) + 1 // Estimate active agents
      });
    }

    return timeSeriesData;
  }

  // Generate AI-powered insights
  static async generateInsights(
    timeframe: AnalyticsTimeframe,
    filters: AnalyticsFilters = {}
  ): Promise<DeliveryInsight[]> {
    const metrics = await this.calculateDeliveryMetrics(timeframe, filters);
    const agentPerformance = await this.getAgentPerformanceData(timeframe, filters);
    const zonePerformance = await this.getZonePerformanceData(timeframe, filters);
    
    const insights: DeliveryInsight[] = [];

    // Performance insights
    if (metrics.deliveryRate > 95) {
      insights.push({
        type: 'success',
        title: 'Excellent Delivery Performance',
        description: `Delivery success rate of ${metrics.deliveryRate.toFixed(1)}% exceeds target of 95%`,
        actionable: false,
        priority: 'low',
        category: 'performance'
      });
    } else if (metrics.deliveryRate < 90) {
      insights.push({
        type: 'warning',
        title: 'Delivery Rate Below Target',
        description: `Current delivery rate of ${metrics.deliveryRate.toFixed(1)}% is below the 90% threshold`,
        actionable: true,
        priority: 'high',
        category: 'performance'
      });
    }

    // Efficiency insights
    if (metrics.averageDeliveryTime > 180) {
      insights.push({
        type: 'warning',
        title: 'Long Delivery Times',
        description: `Average delivery time of ${(metrics.averageDeliveryTime / 60).toFixed(1)} hours exceeds optimal range`,
        actionable: true,
        priority: 'medium',
        category: 'efficiency'
      });
    }

    // Agent performance insights
    const lowPerformingAgents = agentPerformance.filter(agent => agent.successRate < 85);
    if (lowPerformingAgents.length > 0) {
      insights.push({
        type: 'danger',
        title: 'Agents Need Training',
        description: `${lowPerformingAgents.length} agents have success rates below 85%`,
        actionable: true,
        priority: 'high',
        category: 'performance',
        metadata: { agentCount: lowPerformingAgents.length }
      });
    }

    // Zone performance insights
    const underperformingZones = zonePerformance.filter(zone => zone.successRate < 90);
    if (underperformingZones.length > 0) {
      const worstZone = underperformingZones.reduce((worst, zone) => 
        zone.successRate < worst.successRate ? zone : worst
      );
      
      insights.push({
        type: 'warning',
        title: 'Zone Optimization Needed',
        description: `${worstZone.zoneName} has ${worstZone.successRate.toFixed(1)}% success rate - consider route optimization`,
        actionable: true,
        priority: 'medium',
        category: 'efficiency',
        metadata: { zoneId: worstZone.zoneId, zoneName: worstZone.zoneName }
      });
    }

    // Revenue insights
    if (metrics.revenuePerDelivery > 1500) {
      insights.push({
        type: 'success',
        title: 'Strong Revenue Performance',
        description: `Revenue per delivery of ₦${metrics.revenuePerDelivery.toFixed(0)} exceeds target`,
        actionable: false,
        priority: 'low',
        category: 'cost'
      });
    }

    // Cost efficiency insights
    const profitMargin = ((metrics.revenuePerDelivery - metrics.costPerDelivery) / metrics.revenuePerDelivery) * 100;
    if (profitMargin < 30) {
      insights.push({
        type: 'warning',
        title: 'Low Profit Margins',
        description: `Profit margin of ${profitMargin.toFixed(1)}% is below optimal 30% threshold`,
        actionable: true,
        priority: 'high',
        category: 'cost'
      });
    }

    return insights;
  }

  // Export analytics data to CSV
  static async exportAnalyticsData(
    timeframe: AnalyticsTimeframe,
    filters: AnalyticsFilters = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
    try {
      const analytics = await this.getDeliveryAnalytics(timeframe, filters);
      
      if (!analytics.success || !analytics.data) {
        return { success: false, error: 'Failed to get analytics data' };
      }

      const { metrics, agentPerformance, zonePerformance } = analytics.data;
      
      let csvContent = '';
      
      // Add metrics summary
      csvContent += 'DELIVERY METRICS SUMMARY\n';
      csvContent += `Total Shipments,${metrics.totalShipments}\n`;
      csvContent += `Delivered Shipments,${metrics.deliveredShipments}\n`;
      csvContent += `Delivery Rate,${metrics.deliveryRate.toFixed(2)}%\n`;
      csvContent += `Average Delivery Time,${metrics.averageDeliveryTime.toFixed(0)} minutes\n`;
      csvContent += `Total Revenue,₦${metrics.totalRevenue.toFixed(2)}\n`;
      csvContent += `Revenue Per Delivery,₦${metrics.revenuePerDelivery.toFixed(2)}\n`;
      csvContent += '\n';

      // Add agent performance
      csvContent += 'AGENT PERFORMANCE\n';
      csvContent += 'Agent Name,Employee ID,Total Deliveries,Success Rate,Average Time,Total Earnings\n';
      agentPerformance.forEach(agent => {
        csvContent += `${agent.agentName},${agent.employeeId},${agent.totalDeliveries},${agent.successRate.toFixed(1)}%,${agent.averageDeliveryTime.toFixed(0)} min,₦${agent.totalEarnings.toFixed(0)}\n`;
      });
      csvContent += '\n';

      // Add zone performance
      csvContent += 'ZONE PERFORMANCE\n';
      csvContent += 'Zone Name,Total Deliveries,Success Rate,Average Time,Total Revenue\n';
      zonePerformance.forEach(zone => {
        csvContent += `${zone.zoneName},${zone.totalDeliveries},${zone.successRate.toFixed(1)}%,${zone.averageDeliveryTime.toFixed(0)} min,₦${zone.totalRevenue.toFixed(0)}\n`;
      });

      const filename = `delivery_analytics_${timeframe.start.toISOString().split('T')[0]}_to_${timeframe.end.toISOString().split('T')[0]}.csv`;

      return {
        success: true,
        data: csvContent,
        filename
      };

    } catch (error) {
      console.error('Error exporting analytics data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export data'
      };
    }
  }

  // Real-time analytics updates (for WebSocket integration)
  static async getRealtimeMetrics(): Promise<{
    activeDeliveries: number;
    agentsOnline: number;
    avgDeliveryTime: number;
    successRateToday: number;
    revenueToday: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [activeDeliveries, agentsOnline, todayShipments] = await Promise.all([
      // Active deliveries
      prisma.shipment.count({
        where: {
          status: {
            in: [ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT]
          }
        }
      }),

      // Online agents
      prisma.deliveryAgent.count({
        where: {
          status: 'active',
          lastActiveAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      }),

      // Today's shipments
      prisma.shipment.findMany({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        },
        select: {
          status: true,
          deliveryFee: true,
          actualDelivery: true,
          createdAt: true
        }
      })
    ]);

    const deliveredToday = todayShipments.filter(s => s.status === ShipmentStatus.DELIVERED);
    const successRateToday = todayShipments.length > 0 
      ? (deliveredToday.length / todayShipments.length) * 100 
      : 0;

    const avgDeliveryTime = deliveredToday.length > 0
      ? deliveredToday
          .filter(s => s.actualDelivery)
          .reduce((sum, s) => sum + ((s.actualDelivery!.getTime() - s.createdAt.getTime()) / (1000 * 60)), 0) / deliveredToday.length
      : 0;

    const revenueToday = todayShipments.reduce((sum, s) => sum + Number(s.deliveryFee || 0), 0);

    return {
      activeDeliveries,
      agentsOnline,
      avgDeliveryTime,
      successRateToday,
      revenueToday
    };
  }

  // Helper method to build where clause for database queries
  private static buildWhereClause(timeframe: AnalyticsTimeframe, filters: AnalyticsFilters = {}): any {
    const where: any = {
      createdAt: {
        gte: timeframe.start,
        lte: timeframe.end
      }
    };

    if (filters.partnerId) {
      where.partnerId = filters.partnerId;
    }

    if (filters.agentId) {
      where.agentId = filters.agentId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.deliveryType) {
      where.deliveryType = filters.deliveryType;
    }

    return where;
  }
}
