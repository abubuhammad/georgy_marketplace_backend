declare enum ShipmentStatus {
    PENDING = "pending",
    ASSIGNED = "assigned",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
declare enum ShippingOption {
    STANDARD = "standard",
    EXPRESS = "express",
    SAME_DAY = "same_day",
    NEXT_DAY = "next_day",
    SCHEDULED = "scheduled"
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
export declare class DeliveryService {
    static getDeliveryQuote(request: DeliveryQuoteRequest): Promise<any>;
    static createShipment(request: ShipmentCreateRequest): Promise<any>;
    static updateShipmentStatus(update: DeliveryStatusUpdate): Promise<boolean>;
    static getShipmentTracking(shipmentId: string): Promise<any>;
    static getAgentDeliveries(agentId: string, status?: ShipmentStatus): Promise<any>;
    static updateAgentLocation(update: AgentLocationUpdate): Promise<boolean>;
    static registerDeliveryAgent(userId: string, agentData: any): Promise<any>;
    private static calculateDistance;
    private static deg2rad;
    private static isLocationInZone;
    private static generateTrackingNumber;
    private static getEstimatedDays;
    private static getEstimatedHours;
    private static getDeliveryFeatures;
    private static logTrackingEvent;
    private static mapStatusToEventType;
    private static getStatusDescription;
    private static autoAssignAgent;
    private static logCODCollection;
    private static updateAgentStats;
}
export {};
//# sourceMappingURL=deliveryService.d.ts.map