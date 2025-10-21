import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
interface Dispute {
    id?: string;
    disputeId: string;
    complainantId: string;
    respondentId: string;
    orderId?: string;
    productId?: string;
    disputeType: DisputeType;
    category: DisputeCategory;
    subject: string;
    description: string;
    amount?: number;
    currency?: string;
    evidence: Evidence[];
    status: DisputeStatus;
    priority: DisputePriority;
    createdAt: Date;
    updatedAt: Date;
    dueDate: Date;
    assignedMediatorId?: string;
    resolution?: DisputeResolution;
}
interface Evidence {
    id?: string;
    disputeId: string;
    submittedBy: string;
    evidenceType: EvidenceType;
    title: string;
    description: string;
    fileUrls?: string[];
    metadata?: any;
    createdAt: Date;
    isVerified?: boolean;
    verifiedBy?: string;
}
interface DisputeMessage {
    id?: string;
    disputeId: string;
    senderId: string;
    senderRole: ParticipantRole;
    message: string;
    messageType: MessageType;
    attachments?: string[];
    sentAt: Date;
    isInternal?: boolean;
    readBy: string[];
}
interface DisputeResolution {
    id?: string;
    disputeId: string;
    resolvedBy: string;
    resolutionType: ResolutionType;
    outcome: ResolutionOutcome;
    description: string;
    compensation?: CompensationDetails;
    actions: ResolutionAction[];
    agreedByComplainant?: boolean;
    agreedByRespondent?: boolean;
    appealable: boolean;
    appealDeadline?: Date;
    resolvedAt: Date;
    implementedAt?: Date;
}
interface CompensationDetails {
    type: CompensationType;
    amount?: number;
    currency?: string;
    refundPercentage?: number;
    credits?: number;
    otherDescription?: string;
}
interface ResolutionAction {
    id?: string;
    action: ActionType;
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: ActionStatus;
    completedAt?: Date;
    notes?: string;
}
interface MediationSession {
    id?: string;
    disputeId: string;
    mediatorId: string;
    participantIds: string[];
    sessionType: SessionType;
    scheduledAt: Date;
    duration: number;
    status: SessionStatus;
    location?: string;
    meetingLink?: string;
    notes?: string;
    outcome?: string;
}
interface DisputeMetrics {
    totalDisputes: number;
    pendingDisputes: number;
    resolvedDisputes: number;
    averageResolutionTime: number;
    disputesByCategory: {
        [key: string]: number;
    };
    resolutionSuccess: number;
    customerSatisfaction?: number;
}
declare enum DisputeType {
    ORDER_ISSUE = "order_issue",
    PAYMENT_DISPUTE = "payment_dispute",
    PRODUCT_QUALITY = "product_quality",
    DELIVERY_PROBLEM = "delivery_problem",
    SERVICE_COMPLAINT = "service_complaint",
    REFUND_REQUEST = "refund_request",
    USER_CONDUCT = "user_conduct",
    POLICY_VIOLATION = "policy_violation"
}
declare enum DisputeCategory {
    COMMERCIAL = "commercial",
    TECHNICAL = "technical",
    SERVICE = "service",
    POLICY = "policy",
    SAFETY = "safety"
}
declare enum DisputeStatus {
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    INVESTIGATION = "investigation",
    MEDIATION = "mediation",
    ESCALATED = "escalated",
    RESOLVED = "resolved",
    CLOSED = "closed",
    APPEALED = "appealed"
}
declare enum DisputePriority {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
declare enum EvidenceType {
    DOCUMENT = "document",
    IMAGE = "image",
    VIDEO = "video",
    AUDIO = "audio",
    SCREENSHOT = "screenshot",
    CHAT_LOG = "chat_log",
    EMAIL = "email",
    RECEIPT = "receipt",
    CONTRACT = "contract"
}
declare enum ParticipantRole {
    COMPLAINANT = "complainant",
    RESPONDENT = "respondent",
    MEDIATOR = "mediator",
    ADMIN = "admin",
    SYSTEM = "system"
}
declare enum MessageType {
    TEXT = "text",
    EVIDENCE = "evidence",
    PROPOSAL = "proposal",
    DECISION = "decision",
    STATUS_UPDATE = "status_update",
    SYSTEM_NOTIFICATION = "system_notification"
}
declare enum ResolutionType {
    AGREEMENT = "agreement",
    MEDIATED_SETTLEMENT = "mediated_settlement",
    ARBITRATION = "arbitration",
    ADMINISTRATIVE_DECISION = "administrative_decision",
    MUTUAL_WITHDRAWAL = "mutual_withdrawal"
}
declare enum ResolutionOutcome {
    COMPLAINANT_FAVOR = "complainant_favor",
    RESPONDENT_FAVOR = "respondent_favor",
    MUTUAL_AGREEMENT = "mutual_agreement",
    PARTIAL_RESOLUTION = "partial_resolution",
    NO_FAULT = "no_fault",
    DISMISSED = "dismissed"
}
declare enum CompensationType {
    FULL_REFUND = "full_refund",
    PARTIAL_REFUND = "partial_refund",
    STORE_CREDIT = "store_credit",
    REPLACEMENT = "replacement",
    DISCOUNT = "discount",
    APOLOGY = "apology",
    CORRECTIVE_ACTION = "corrective_action",
    NO_COMPENSATION = "no_compensation"
}
declare enum ActionType {
    REFUND = "refund",
    REPLACE_ITEM = "replace_item",
    ACCOUNT_SUSPENSION = "account_suspension",
    WARNING = "warning",
    POLICY_UPDATE = "policy_update",
    TRAINING = "training",
    INVESTIGATION = "investigation",
    FOLLOW_UP = "follow_up"
}
declare enum ActionStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    OVERDUE = "overdue",
    CANCELLED = "cancelled"
}
declare enum SessionType {
    PHONE_CALL = "phone_call",
    VIDEO_CONFERENCE = "video_conference",
    IN_PERSON = "in_person",
    ONLINE_CHAT = "online_chat",
    EMAIL_MEDIATION = "email_mediation"
}
declare enum SessionStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    NO_SHOW = "no_show",
    RESCHEDULED = "rescheduled"
}
export declare class DisputeResolutionService {
    private prisma;
    private logger;
    constructor(prisma: PrismaClient, logger: Logger);
    /**
     * Create a new dispute
     */
    createDispute(dispute: Omit<Dispute, 'id' | 'disputeId' | 'createdAt' | 'updatedAt' | 'status' | 'priority'>): Promise<Dispute>;
    /**
     * Generate unique dispute ID
     */
    private generateDisputeId;
    /**
     * Calculate dispute priority
     */
    private calculateDisputePriority;
    /**
     * Calculate due date based on priority
     */
    private calculateDueDate;
    /**
     * Auto-assign dispute to appropriate mediator
     */
    private autoAssignDispute;
    /**
     * Assign mediator to dispute
     */
    assignMediator(disputeId: string, mediatorId: string): Promise<void>;
    /**
     * Add message to dispute
     */
    addMessage(message: Omit<DisputeMessage, 'id' | 'sentAt' | 'readBy'>): Promise<DisputeMessage>;
    /**
     * Schedule mediation session
     */
    scheduleMediationSession(session: Omit<MediationSession, 'id' | 'status'>): Promise<MediationSession>;
    /**
     * Update dispute status
     */
    private updateDisputeStatus;
    /**
     * Create resolution action
     */
    private createResolutionAction;
    /**
     * Process compensation
     */
    private processCompensation;
    /**
     * Process refund
     */
    private processRefund;
    /**
     * Issue store credit
     */
    private issueStoreCredit;
    /**
     * Get dispute metrics
     */
    getDisputeMetrics(startDate: Date, endDate: Date): Promise<DisputeMetrics>;
    /**
     * Send dispute notifications
     */
    private sendDisputeNotifications;
    /**
     * Notify participants of new message
     */
    private notifyParticipants;
    /**
     * Send mediation invites
     */
    private sendMediationInvites;
    /**
     * Mark message as read
     */
    private markMessageAsRead;
    /**
     * Update mediator statistics
     */
    private updateMediatorStats;
    /**
     * Escalate dispute
     */
    escalateDispute(disputeId: string, reason: string, escalatedBy: string): Promise<void>;
    /**
     * Assign to escalation team
     */
    private assignToEscalationTeam;
    /**
     * Generate dispute report
     */
    generateDisputeReport(startDate: Date, endDate: Date): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        metrics: DisputeMetrics;
        topIssues: {
            type: string;
            count: number;
        }[];
        mediatorPerformance: {
            mediatorId: string;
            resolved: number;
            avgTime: number;
        }[];
        recommendations: string[];
    }>;
    /**
     * Get mediator performance metrics
     */
    private getMediatorPerformance;
    /**
     * Get disputes for a specific user
     */
    getUserDisputes(userId: string, options: {
        page: number;
        limit: number;
        filters?: {
            status?: string;
            type?: string;
        };
    }): Promise<{
        disputes: ({
            resolutions: {
                id: string;
                description: string;
                resolvedAt: Date;
                resolvedBy: string;
                disputeId: string;
                compensation: string | null;
                outcome: string;
                resolutionType: string;
            }[];
        } & {
            id: string;
            type: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string;
            status: string;
            orderId: string | null;
            priority: string;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            dueDate: Date | null;
            assignedTo: string | null;
            evidence: string | null;
            resolvedAt: Date | null;
            resolution: string | null;
            disputeId: string;
            complainantId: string;
            respondentId: string;
            disputeType: string;
            subject: string;
            assignedMediatorId: string | null;
            disputeNumber: string;
            subcategory: string | null;
            relatedOrder: string | null;
            relatedItem: string | null;
            timeline: string | null;
            compensation: import("@prisma/client/runtime/library").Decimal | null;
            escalatedAt: Date | null;
            claimantId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Get a specific dispute
     */
    getDispute(disputeId: string): Promise<({
        resolutions: {
            id: string;
            description: string;
            resolvedAt: Date;
            resolvedBy: string;
            disputeId: string;
            compensation: string | null;
            outcome: string;
            resolutionType: string;
        }[];
    } & {
        id: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        description: string;
        status: string;
        orderId: string | null;
        priority: string;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        dueDate: Date | null;
        assignedTo: string | null;
        evidence: string | null;
        resolvedAt: Date | null;
        resolution: string | null;
        disputeId: string;
        complainantId: string;
        respondentId: string;
        disputeType: string;
        subject: string;
        assignedMediatorId: string | null;
        disputeNumber: string;
        subcategory: string | null;
        relatedOrder: string | null;
        relatedItem: string | null;
        timeline: string | null;
        compensation: import("@prisma/client/runtime/library").Decimal | null;
        escalatedAt: Date | null;
        claimantId: string;
    }) | null>;
    /**
     * Send message in dispute
     */
    sendMessage(disputeId: string, messageData: {
        senderId: string;
        message: string;
        messageType?: string;
        attachments?: string[];
    }): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        content: string;
        messageType: string;
        sentAt: Date;
        senderId: string;
        disputeId: string;
        readBy: string | null;
        senderRole: string | null;
        attachments: string | null;
        isInternal: boolean;
    }>;
    /**
     * Get dispute messages
     */
    getDisputeMessages(disputeId: string, options: {
        page: number;
        limit: number;
    }): Promise<{
        messages: {
            message: string;
            id: string;
            createdAt: Date;
            content: string;
            messageType: string;
            sentAt: Date;
            senderId: string;
            disputeId: string;
            readBy: string | null;
            senderRole: string | null;
            attachments: string | null;
            isInternal: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Schedule mediation
     */
    scheduleMediation(disputeId: string, mediationData: {
        mediatorId: string;
        scheduledAt: Date;
        duration: number;
        sessionType: string;
        location?: string;
        meetingLink?: string;
    }): Promise<{
        id: string;
        location: string | null;
        status: string;
        scheduledAt: Date;
        duration: number;
        disputeId: string;
        mediatorId: string;
        sessionType: string;
        meetingLink: string | null;
    }>;
    /**
     * Get all disputes (admin)
     */
    getAllDisputes(options: {
        page: number;
        limit: number;
        filters?: {
            status?: string;
            priority?: string;
            type?: string;
        };
    }): Promise<{
        disputes: ({
            resolutions: {
                id: string;
                description: string;
                resolvedAt: Date;
                resolvedBy: string;
                disputeId: string;
                compensation: string | null;
                outcome: string;
                resolutionType: string;
            }[];
        } & {
            id: string;
            type: string;
            createdAt: Date;
            updatedAt: Date;
            category: string;
            description: string;
            status: string;
            orderId: string | null;
            priority: string;
            amount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string;
            dueDate: Date | null;
            assignedTo: string | null;
            evidence: string | null;
            resolvedAt: Date | null;
            resolution: string | null;
            disputeId: string;
            complainantId: string;
            respondentId: string;
            disputeType: string;
            subject: string;
            assignedMediatorId: string | null;
            disputeNumber: string;
            subcategory: string | null;
            relatedOrder: string | null;
            relatedItem: string | null;
            timeline: string | null;
            compensation: import("@prisma/client/runtime/library").Decimal | null;
            escalatedAt: Date | null;
            claimantId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * Assign dispute to mediator
     */
    assignDispute(disputeId: string, assignedTo: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        updatedAt: Date;
        category: string;
        description: string;
        status: string;
        orderId: string | null;
        priority: string;
        amount: import("@prisma/client/runtime/library").Decimal | null;
        currency: string;
        dueDate: Date | null;
        assignedTo: string | null;
        evidence: string | null;
        resolvedAt: Date | null;
        resolution: string | null;
        disputeId: string;
        complainantId: string;
        respondentId: string;
        disputeType: string;
        subject: string;
        assignedMediatorId: string | null;
        disputeNumber: string;
        subcategory: string | null;
        relatedOrder: string | null;
        relatedItem: string | null;
        timeline: string | null;
        compensation: import("@prisma/client/runtime/library").Decimal | null;
        escalatedAt: Date | null;
        claimantId: string;
    }>;
    /**
     * Add evidence (simplified signature)
     */
    addEvidence(disputeId: string, evidence: {
        submittedBy: string;
        evidenceType: string;
        title: string;
        description: string;
        fileUrls?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        title: string;
        disputeId: string;
        submittedBy: string;
        evidenceType: string;
        fileUrls: string;
    }>;
    /**
     * Resolve dispute (simplified signature)
     */
    resolveDispute(disputeId: string, resolution: {
        resolutionType: string;
        outcome: string;
        description: string;
        compensation?: any;
    }): Promise<{
        id: string;
        description: string;
        resolvedAt: Date;
        resolvedBy: string;
        disputeId: string;
        compensation: string | null;
        outcome: string;
        resolutionType: string;
    }>;
}
export { DisputeType, DisputeCategory, DisputeStatus, DisputePriority, EvidenceType, ParticipantRole, MessageType, ResolutionType, ResolutionOutcome, CompensationType, ActionType, ActionStatus, SessionType, SessionStatus };
export type { Dispute, Evidence, DisputeMessage, DisputeResolution, CompensationDetails, ResolutionAction, MediationSession, DisputeMetrics };
//# sourceMappingURL=disputeResolutionService.d.ts.map