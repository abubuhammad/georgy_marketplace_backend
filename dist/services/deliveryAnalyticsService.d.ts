declare enum ShipmentStatus {
    PENDING = "pending",
    ASSIGNED = "assigned",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
declare enum VehicleType {
    BIKE = "bike",
    CAR = "car",
    VAN = "van",
    TRUCK = "truck"
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
export declare class DeliveryAnalyticsService {
    static getDeliveryAnalytics(timeframe: AnalyticsTimeframe, filters?: AnalyticsFilters): Promise<{
        success: boolean;
        data?: {
            metrics: DeliveryMetrics;
            agentPerformance: AgentPerformanceData[];
            zonePerformance: ZonePerformanceData[];
            timeSeriesData: TimeSeriesData[];
            insights: DeliveryInsight[];
        };
        error?: string;
    }>;
    static calculateDeliveryMetrics(timeframe: AnalyticsTimeframe, filters?: AnalyticsFilters): Promise<DeliveryMetrics>;
    static getAgentPerformanceData(timeframe: AnalyticsTimeframe, filters?: AnalyticsFilters): Promise<AgentPerformanceData[]>;
    static getZonePerformanceData(timeframe: AnalyticsTimeframe, filters?: AnalyticsFilters): Promise<ZonePerformanceData[]>;
    static getTimeSeriesData(timeframe: AnalyticsTimeframe, filters?: AnalyticsFilters): Promise<TimeSeriesData[]>;
    static generateInsights(timeframe: AnalyticsTimeframe, filters?: AnalyticsFilters): Promise<DeliveryInsight[]>;
    static exportAnalyticsData(timeframe: AnalyticsTimeframe, filters?: AnalyticsFilters, format?: 'csv' | 'excel'): Promise<{
        success: boolean;
        data?: string;
        filename?: string;
        error?: string;
    }>;
    static getRealtimeMetrics(): Promise<{
        activeDeliveries: number;
        agentsOnline: number;
        avgDeliveryTime: number;
        successRateToday: number;
        revenueToday: number;
    }>;
    private static buildWhereClause;
}
export {};
//# sourceMappingURL=deliveryAnalyticsService.d.ts.map