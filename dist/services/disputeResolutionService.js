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
exports.SessionStatus = exports.SessionType = exports.ActionStatus = exports.ActionType = exports.CompensationType = exports.ResolutionOutcome = exports.ResolutionType = exports.MessageType = exports.ParticipantRole = exports.EvidenceType = exports.DisputePriority = exports.DisputeStatus = exports.DisputeCategory = exports.DisputeType = exports.DisputeResolutionService = void 0;
const crypto = __importStar(require("crypto"));
var DisputeType;
(function (DisputeType) {
    DisputeType["ORDER_ISSUE"] = "order_issue";
    DisputeType["PAYMENT_DISPUTE"] = "payment_dispute";
    DisputeType["PRODUCT_QUALITY"] = "product_quality";
    DisputeType["DELIVERY_PROBLEM"] = "delivery_problem";
    DisputeType["SERVICE_COMPLAINT"] = "service_complaint";
    DisputeType["REFUND_REQUEST"] = "refund_request";
    DisputeType["USER_CONDUCT"] = "user_conduct";
    DisputeType["POLICY_VIOLATION"] = "policy_violation";
})(DisputeType || (exports.DisputeType = DisputeType = {}));
var DisputeCategory;
(function (DisputeCategory) {
    DisputeCategory["COMMERCIAL"] = "commercial";
    DisputeCategory["TECHNICAL"] = "technical";
    DisputeCategory["SERVICE"] = "service";
    DisputeCategory["POLICY"] = "policy";
    DisputeCategory["SAFETY"] = "safety";
})(DisputeCategory || (exports.DisputeCategory = DisputeCategory = {}));
var DisputeStatus;
(function (DisputeStatus) {
    DisputeStatus["SUBMITTED"] = "submitted";
    DisputeStatus["UNDER_REVIEW"] = "under_review";
    DisputeStatus["INVESTIGATION"] = "investigation";
    DisputeStatus["MEDIATION"] = "mediation";
    DisputeStatus["ESCALATED"] = "escalated";
    DisputeStatus["RESOLVED"] = "resolved";
    DisputeStatus["CLOSED"] = "closed";
    DisputeStatus["APPEALED"] = "appealed";
})(DisputeStatus || (exports.DisputeStatus = DisputeStatus = {}));
var DisputePriority;
(function (DisputePriority) {
    DisputePriority["LOW"] = "low";
    DisputePriority["MEDIUM"] = "medium";
    DisputePriority["HIGH"] = "high";
    DisputePriority["URGENT"] = "urgent";
    DisputePriority["CRITICAL"] = "critical";
})(DisputePriority || (exports.DisputePriority = DisputePriority = {}));
var EvidenceType;
(function (EvidenceType) {
    EvidenceType["DOCUMENT"] = "document";
    EvidenceType["IMAGE"] = "image";
    EvidenceType["VIDEO"] = "video";
    EvidenceType["AUDIO"] = "audio";
    EvidenceType["SCREENSHOT"] = "screenshot";
    EvidenceType["CHAT_LOG"] = "chat_log";
    EvidenceType["EMAIL"] = "email";
    EvidenceType["RECEIPT"] = "receipt";
    EvidenceType["CONTRACT"] = "contract";
})(EvidenceType || (exports.EvidenceType = EvidenceType = {}));
var ParticipantRole;
(function (ParticipantRole) {
    ParticipantRole["COMPLAINANT"] = "complainant";
    ParticipantRole["RESPONDENT"] = "respondent";
    ParticipantRole["MEDIATOR"] = "mediator";
    ParticipantRole["ADMIN"] = "admin";
    ParticipantRole["SYSTEM"] = "system";
})(ParticipantRole || (exports.ParticipantRole = ParticipantRole = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "text";
    MessageType["EVIDENCE"] = "evidence";
    MessageType["PROPOSAL"] = "proposal";
    MessageType["DECISION"] = "decision";
    MessageType["STATUS_UPDATE"] = "status_update";
    MessageType["SYSTEM_NOTIFICATION"] = "system_notification";
})(MessageType || (exports.MessageType = MessageType = {}));
var ResolutionType;
(function (ResolutionType) {
    ResolutionType["AGREEMENT"] = "agreement";
    ResolutionType["MEDIATED_SETTLEMENT"] = "mediated_settlement";
    ResolutionType["ARBITRATION"] = "arbitration";
    ResolutionType["ADMINISTRATIVE_DECISION"] = "administrative_decision";
    ResolutionType["MUTUAL_WITHDRAWAL"] = "mutual_withdrawal";
})(ResolutionType || (exports.ResolutionType = ResolutionType = {}));
var ResolutionOutcome;
(function (ResolutionOutcome) {
    ResolutionOutcome["COMPLAINANT_FAVOR"] = "complainant_favor";
    ResolutionOutcome["RESPONDENT_FAVOR"] = "respondent_favor";
    ResolutionOutcome["MUTUAL_AGREEMENT"] = "mutual_agreement";
    ResolutionOutcome["PARTIAL_RESOLUTION"] = "partial_resolution";
    ResolutionOutcome["NO_FAULT"] = "no_fault";
    ResolutionOutcome["DISMISSED"] = "dismissed";
})(ResolutionOutcome || (exports.ResolutionOutcome = ResolutionOutcome = {}));
var CompensationType;
(function (CompensationType) {
    CompensationType["FULL_REFUND"] = "full_refund";
    CompensationType["PARTIAL_REFUND"] = "partial_refund";
    CompensationType["STORE_CREDIT"] = "store_credit";
    CompensationType["REPLACEMENT"] = "replacement";
    CompensationType["DISCOUNT"] = "discount";
    CompensationType["APOLOGY"] = "apology";
    CompensationType["CORRECTIVE_ACTION"] = "corrective_action";
    CompensationType["NO_COMPENSATION"] = "no_compensation";
})(CompensationType || (exports.CompensationType = CompensationType = {}));
var ActionType;
(function (ActionType) {
    ActionType["REFUND"] = "refund";
    ActionType["REPLACE_ITEM"] = "replace_item";
    ActionType["ACCOUNT_SUSPENSION"] = "account_suspension";
    ActionType["WARNING"] = "warning";
    ActionType["POLICY_UPDATE"] = "policy_update";
    ActionType["TRAINING"] = "training";
    ActionType["INVESTIGATION"] = "investigation";
    ActionType["FOLLOW_UP"] = "follow_up";
})(ActionType || (exports.ActionType = ActionType = {}));
var ActionStatus;
(function (ActionStatus) {
    ActionStatus["PENDING"] = "pending";
    ActionStatus["IN_PROGRESS"] = "in_progress";
    ActionStatus["COMPLETED"] = "completed";
    ActionStatus["OVERDUE"] = "overdue";
    ActionStatus["CANCELLED"] = "cancelled";
})(ActionStatus || (exports.ActionStatus = ActionStatus = {}));
var SessionType;
(function (SessionType) {
    SessionType["PHONE_CALL"] = "phone_call";
    SessionType["VIDEO_CONFERENCE"] = "video_conference";
    SessionType["IN_PERSON"] = "in_person";
    SessionType["ONLINE_CHAT"] = "online_chat";
    SessionType["EMAIL_MEDIATION"] = "email_mediation";
})(SessionType || (exports.SessionType = SessionType = {}));
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["SCHEDULED"] = "scheduled";
    SessionStatus["IN_PROGRESS"] = "in_progress";
    SessionStatus["COMPLETED"] = "completed";
    SessionStatus["CANCELLED"] = "cancelled";
    SessionStatus["NO_SHOW"] = "no_show";
    SessionStatus["RESCHEDULED"] = "rescheduled";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
class DisputeResolutionService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    /**
     * Create a new dispute
     */
    async createDispute(dispute) {
        try {
            const disputeId = this.generateDisputeId();
            const priority = this.calculateDisputePriority(dispute);
            const dueDate = this.calculateDueDate(priority);
            const newDispute = await this.prisma.dispute.create({
                data: {
                    disputeNumber: disputeId,
                    type: dispute.disputeType, // Using type as required
                    disputeType: dispute.disputeType, // Also include disputeType
                    subject: dispute.description, // Using subject instead of description
                    description: dispute.description,
                    category: dispute.category,
                    claimantId: dispute.complainantId, // Using claimantId as required
                    complainantId: dispute.complainantId, // Also include complainantId
                    respondentId: 'unknown', // Required field - would need actual respondent ID
                    status: DisputeStatus.SUBMITTED,
                    priority,
                    dueDate,
                    amount: dispute.amount,
                    evidence: JSON.stringify(dispute.evidence || []),
                    resolution: typeof dispute.resolution === 'string' ? dispute.resolution : (dispute.resolution ? JSON.stringify(dispute.resolution) : ''),
                    orderId: dispute.orderId,
                    // productId: dispute.productId, // Field not in schema
                    // serviceRequestId: dispute.serviceRequestId, // Field not in schema
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            // Auto-assign based on dispute type
            await this.autoAssignDispute(newDispute.id, dispute.disputeType);
            // Send notifications
            await this.sendDisputeNotifications(newDispute.id, 'created');
            this.logger.info(`Dispute created: ${disputeId} by ${dispute.complainantId}`);
            return { ...newDispute, disputeId: newDispute.disputeNumber, complainantId: newDispute.claimantId, disputeType: newDispute.type };
        }
        catch (error) {
            this.logger.error('Error creating dispute:', error);
            throw new Error('Failed to create dispute');
        }
    }
    /**
     * Generate unique dispute ID
     */
    generateDisputeId() {
        const prefix = 'DSP';
        const timestamp = Date.now().toString();
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        return `${prefix}-${timestamp.slice(-8)}-${random}`;
    }
    /**
     * Calculate dispute priority
     */
    calculateDisputePriority(dispute) {
        // High-value disputes get higher priority
        if (dispute.amount && dispute.amount > 1000) {
            return DisputePriority.HIGH;
        }
        // Safety-related disputes are critical
        if (dispute.category === DisputeCategory.SAFETY) {
            return DisputePriority.CRITICAL;
        }
        // User conduct issues are urgent
        if (dispute.disputeType === DisputeType.USER_CONDUCT) {
            return DisputePriority.URGENT;
        }
        // Service complaints and delivery problems are medium priority
        if ([DisputeType.SERVICE_COMPLAINT, DisputeType.DELIVERY_PROBLEM].includes(dispute.disputeType)) {
            return DisputePriority.MEDIUM;
        }
        return DisputePriority.LOW;
    }
    /**
     * Calculate due date based on priority
     */
    calculateDueDate(priority) {
        const now = new Date();
        switch (priority) {
            case DisputePriority.CRITICAL:
                return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
            case DisputePriority.URGENT:
                return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
            case DisputePriority.HIGH:
                return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
            case DisputePriority.MEDIUM:
                return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
            case DisputePriority.LOW:
                return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
            default:
                return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        }
    }
    /**
     * Auto-assign dispute to appropriate mediator
     */
    async autoAssignDispute(disputeId, disputeType) {
        try {
            // Find available mediators with expertise in the dispute type
            const mediators = await this.prisma.user.findMany({
                where: {
                    role: 'mediator',
                    isActive: true,
                    // specializations: { has: disputeType } // Field might not exist
                },
                // orderBy: { activeDisputes: 'asc' } // Field might not exist
                take: 1
            });
            if (mediators.length > 0) {
                await this.assignMediator(disputeId, mediators[0].id);
            }
        }
        catch (error) {
            this.logger.error('Error auto-assigning dispute:', error);
        }
    }
    /**
     * Assign mediator to dispute
     */
    async assignMediator(disputeId, mediatorId) {
        try {
            await this.prisma.dispute.update({
                where: { id: disputeId },
                data: {
                    assignedMediatorId: mediatorId,
                    status: DisputeStatus.UNDER_REVIEW,
                    updatedAt: new Date()
                }
            });
            // Update mediator's active dispute count
            await this.prisma.user.update({
                where: { id: mediatorId },
                data: {
                // activeDisputes: { increment: 1 } // Field might not exist
                }
            });
            this.logger.info(`Mediator ${mediatorId} assigned to dispute ${disputeId}`);
        }
        catch (error) {
            this.logger.error('Error assigning mediator:', error);
            throw new Error('Failed to assign mediator');
        }
    }
    /**
     * Add message to dispute
     */
    async addMessage(message) {
        try {
            const newMessage = await this.prisma.disputeMessage.create({
                data: {
                    disputeId: message.disputeId,
                    senderId: message.senderId,
                    content: message.message,
                    message: message.message, // Both content and message fields needed
                    messageType: message.messageType,
                    senderRole: message.senderRole,
                    attachments: message.attachments ? JSON.stringify(message.attachments) : null,
                    isInternal: message.isInternal,
                    sentAt: new Date(),
                    readBy: '' // String field instead of array
                }
            });
            // Mark as read by sender
            await this.markMessageAsRead(newMessage.id, message.senderId);
            // Send notifications to other participants
            await this.notifyParticipants(message.disputeId, message.senderId);
            this.logger.info(`Message added to dispute ${message.disputeId} by ${message.senderId}`);
            return { ...newMessage, readBy: [], attachments: newMessage.attachments ? JSON.parse(newMessage.attachments) : [] };
        }
        catch (error) {
            this.logger.error('Error adding message:', error);
            throw new Error('Failed to add message');
        }
    }
    /**
     * Schedule mediation session
     */
    async scheduleMediationSession(session) {
        try {
            const newSession = await this.prisma.mediationSession.create({
                data: {
                    ...session,
                    status: SessionStatus.SCHEDULED
                }
            });
            // Update dispute status to mediation
            await this.updateDisputeStatus(session.disputeId, DisputeStatus.MEDIATION);
            // Send calendar invites to participants
            await this.sendMediationInvites(newSession.id);
            this.logger.info(`Mediation session scheduled for dispute ${session.disputeId}`);
            return newSession;
        }
        catch (error) {
            this.logger.error('Error scheduling mediation session:', error);
            throw new Error('Failed to schedule mediation session');
        }
    }
    /**
     * Update dispute status
     */
    async updateDisputeStatus(disputeId, status) {
        await this.prisma.dispute.update({
            where: { id: disputeId },
            data: {
                status,
                updatedAt: new Date()
            }
        });
    }
    /**
     * Create resolution action
     */
    async createResolutionAction(resolutionId, action) {
        // resolutionAction table might not exist
        const resolutionAction = await this.prisma.disputeResolution.create({
            data: {
                disputeId: resolutionId, // Using disputeId instead of resolutionId
                description: action.description || 'Resolution action',
                resolvedBy: action.assignedTo || 'system',
                resolvedAt: new Date(),
                resolutionType: 'system_action',
                outcome: 'pending'
            }
        });
        return {
            ...resolutionAction,
            action: resolutionAction.resolutionType || 'INVESTIGATION', // Map to action field
            assignedTo: resolutionAction.resolvedBy,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
            status: ActionStatus.COMPLETED // Using enum instead of string
        };
    }
    /**
     * Process compensation
     */
    async processCompensation(disputeId, compensation) {
        try {
            const dispute = await this.prisma.dispute.findUnique({
                where: { id: disputeId },
                include: {
                // user: true,
                // seller: true
                }
            });
            if (!dispute)
                return;
            switch (compensation.type) {
                case CompensationType.FULL_REFUND:
                    if (dispute.orderId) {
                        await this.processRefund(dispute.orderId, compensation.amount || Number(dispute.amount));
                    }
                    break;
                case CompensationType.PARTIAL_REFUND:
                    const refundAmount = compensation.amount ||
                        (dispute.amount && compensation.refundPercentage ?
                            Number(dispute.amount) * (compensation.refundPercentage / 100) : 0);
                    if (dispute.orderId) {
                        await this.processRefund(dispute.orderId, refundAmount);
                    }
                    break;
                case CompensationType.STORE_CREDIT:
                    await this.issueStoreCredit(dispute.complainantId, compensation.credits || compensation.amount);
                    break;
                // Add other compensation types as needed
            }
            this.logger.info(`Compensation processed for dispute ${disputeId}: ${compensation.type}`);
        }
        catch (error) {
            this.logger.error('Error processing compensation:', error);
        }
    }
    /**
     * Process refund
     */
    async processRefund(orderId, amount) {
        if (!orderId || !amount)
            return;
        // Implementation would integrate with payment processor
        // For now, just log the refund request
        this.logger.info(`Refund requested: Order ${orderId}, Amount: ${amount}`);
    }
    /**
     * Issue store credit
     */
    async issueStoreCredit(userId, amount) {
        if (!amount)
            return;
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                storeCredit: {
                    increment: amount
                }
            }
        });
        this.logger.info(`Store credit issued: User ${userId}, Amount: ${amount}`);
    }
    /**
     * Get dispute metrics
     */
    async getDisputeMetrics(startDate, endDate) {
        try {
            const [total, pending, resolved, disputes] = await Promise.all([
                this.prisma.dispute.count({
                    where: {
                        createdAt: { gte: startDate, lte: endDate }
                    }
                }),
                this.prisma.dispute.count({
                    where: {
                        status: {
                            in: [DisputeStatus.SUBMITTED, DisputeStatus.UNDER_REVIEW, DisputeStatus.INVESTIGATION, DisputeStatus.MEDIATION]
                        },
                        createdAt: { gte: startDate, lte: endDate }
                    }
                }),
                this.prisma.dispute.count({
                    where: {
                        status: DisputeStatus.RESOLVED,
                        createdAt: { gte: startDate, lte: endDate }
                    }
                }),
                this.prisma.dispute.findMany({
                    where: {
                        createdAt: { gte: startDate, lte: endDate }
                    },
                    include: {
                        resolutions: true
                    }
                })
            ]);
            // Calculate average resolution time
            const resolvedDisputes = disputes.filter(d => d.resolutions && d.resolutions.length > 0);
            const totalResolutionTime = resolvedDisputes.reduce((sum, dispute) => {
                if (dispute.resolutions && dispute.resolutions.length > 0) {
                    const resolution = dispute.resolutions[0];
                    return sum + (new Date(resolution.resolvedAt || new Date()).getTime() - dispute.createdAt.getTime());
                }
                return sum;
            }, 0);
            const averageResolutionTime = resolvedDisputes.length > 0 ?
                totalResolutionTime / resolvedDisputes.length / (1000 * 60 * 60 * 24) : 0; // in days
            // Group by category
            const disputesByCategory = disputes.reduce((acc, dispute) => {
                acc[dispute.category] = (acc[dispute.category] || 0) + 1;
                return acc;
            }, {});
            // Calculate success rate
            const successfulResolutions = resolvedDisputes.filter(d => d.resolutions && d.resolutions.length > 0 &&
                d.resolutions[0].outcome !== ResolutionOutcome.DISMISSED).length;
            const resolutionSuccess = resolvedDisputes.length > 0 ?
                (successfulResolutions / resolvedDisputes.length) * 100 : 0;
            return {
                totalDisputes: total,
                pendingDisputes: pending,
                resolvedDisputes: resolved,
                averageResolutionTime: Math.round(averageResolutionTime * 100) / 100,
                disputesByCategory,
                resolutionSuccess: Math.round(resolutionSuccess * 100) / 100
            };
        }
        catch (error) {
            this.logger.error('Error getting dispute metrics:', error);
            throw new Error('Failed to get dispute metrics');
        }
    }
    /**
     * Send dispute notifications
     */
    async sendDisputeNotifications(disputeId, eventType) {
        try {
            const dispute = await this.prisma.dispute.findUnique({
                where: { id: disputeId },
                // include: { complainant: true, respondent: true, mediator: true }
            });
            if (!dispute)
                return;
            // Implementation would send actual notifications
            // For now, just log the notification
            this.logger.info(`Dispute notification sent: ${dispute.disputeId} - ${eventType}`);
        }
        catch (error) {
            this.logger.error('Error sending dispute notifications:', error);
        }
    }
    /**
     * Notify participants of new message
     */
    async notifyParticipants(disputeId, senderId) {
        try {
            const dispute = await this.prisma.dispute.findUnique({
                where: { id: disputeId }
            });
            if (!dispute)
                return;
            const participantIds = [
                dispute.complainantId,
                dispute.respondentId,
                dispute.assignedMediatorId
            ].filter(id => id && id !== senderId);
            // Send notifications to participants
            for (const participantId of participantIds) {
                if (participantId) {
                    // Implementation would send actual notification
                    this.logger.info(`Message notification sent to ${participantId} for dispute ${dispute.disputeId}`);
                }
            }
        }
        catch (error) {
            this.logger.error('Error notifying participants:', error);
        }
    }
    /**
     * Send mediation invites
     */
    async sendMediationInvites(sessionId) {
        try {
            const session = await this.prisma.mediationSession.findUnique({
                where: { id: sessionId },
                // include: { dispute: true, participants: true }
            });
            if (!session)
                return;
            // Implementation would send calendar invites
            this.logger.info(`Mediation invites sent for session ${sessionId}`);
        }
        catch (error) {
            this.logger.error('Error sending mediation invites:', error);
        }
    }
    /**
     * Mark message as read
     */
    async markMessageAsRead(messageId, userId) {
        await this.prisma.disputeMessage.update({
            where: { id: messageId },
            data: {
                readBy: userId // String field instead of array push
            }
        });
    }
    /**
     * Update mediator statistics
     */
    async updateMediatorStats(mediatorId, action) {
        try {
            const updates = {};
            if (action === 'resolved') {
                updates.disputesResolved = { increment: 1 };
                updates.activeDisputes = { decrement: 1 };
            }
            else if (action === 'assigned') {
                updates.activeDisputes = { increment: 1 };
            }
            await this.prisma.user.update({
                where: { id: mediatorId },
                data: updates
            });
        }
        catch (error) {
            this.logger.error('Error updating mediator stats:', error);
        }
    }
    /**
     * Escalate dispute
     */
    async escalateDispute(disputeId, reason, escalatedBy) {
        try {
            await this.prisma.dispute.update({
                where: { id: disputeId },
                data: {
                    status: DisputeStatus.ESCALATED,
                    updatedAt: new Date()
                }
            });
            // Create escalation record
            // disputeEscalation table might not exist, using disputeResolution instead
            await this.prisma.disputeResolution.create({
                data: {
                    disputeId,
                    // reason, // Field not in schema
                    description: reason, // Using description instead of reason
                    resolvedBy: escalatedBy,
                    resolvedAt: new Date(),
                    resolutionType: 'escalation', // Required field
                    outcome: 'escalated' // Required field
                }
            });
            // Assign to senior mediator or admin
            await this.assignToEscalationTeam(disputeId);
            this.logger.info(`Dispute ${disputeId} escalated by ${escalatedBy}: ${reason}`);
        }
        catch (error) {
            this.logger.error('Error escalating dispute:', error);
            throw new Error('Failed to escalate dispute');
        }
    }
    /**
     * Assign to escalation team
     */
    async assignToEscalationTeam(disputeId) {
        try {
            const escalationTeam = await this.prisma.user.findMany({
                where: {
                    role: 'senior_mediator',
                    isActive: true
                },
                // orderBy: { activeDisputes: 'asc' }, // Field might not exist
                take: 1
            });
            if (escalationTeam.length > 0) {
                await this.assignMediator(disputeId, escalationTeam[0].id);
            }
        }
        catch (error) {
            this.logger.error('Error assigning to escalation team:', error);
        }
    }
    /**
     * Generate dispute report
     */
    async generateDisputeReport(startDate, endDate) {
        try {
            const metrics = await this.getDisputeMetrics(startDate, endDate);
            const disputes = await this.prisma.dispute.findMany({
                where: {
                    createdAt: { gte: startDate, lte: endDate }
                },
                include: {
                    resolutions: true
                }
            });
            // Top issues
            const issueMap = disputes.reduce((acc, dispute) => {
                acc[dispute.disputeType] = (acc[dispute.disputeType] || 0) + 1;
                return acc;
            }, {});
            const topIssues = Object.entries(issueMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type, count]) => ({ type, count }));
            // Mediator performance
            const mediatorPerformance = await this.getMediatorPerformance(startDate, endDate);
            // Generate recommendations
            const recommendations = [];
            if (metrics.averageResolutionTime > 14) {
                recommendations.push('Consider adding more mediators to reduce resolution time');
            }
            if (metrics.resolutionSuccess < 80) {
                recommendations.push('Review dispute resolution processes to improve success rate');
            }
            if (metrics.pendingDisputes > metrics.resolvedDisputes) {
                recommendations.push('Focus on clearing pending dispute backlog');
            }
            return {
                period: { start: startDate, end: endDate },
                metrics,
                topIssues,
                mediatorPerformance,
                recommendations
            };
        }
        catch (error) {
            this.logger.error('Error generating dispute report:', error);
            throw new Error('Failed to generate dispute report');
        }
    }
    /**
     * Get mediator performance metrics
     */
    async getMediatorPerformance(startDate, endDate) {
        try {
            const resolutions = await this.prisma.disputeResolution.findMany({
                where: {
                    resolvedAt: { gte: startDate, lte: endDate }
                },
                include: {
                    dispute: true
                }
            });
            const performanceMap = new Map();
            resolutions.forEach(resolution => {
                const mediatorId = resolution.resolvedBy;
                if (!performanceMap.has(mediatorId)) {
                    performanceMap.set(mediatorId, {
                        resolved: 0,
                        totalTime: 0
                    });
                }
                const stats = performanceMap.get(mediatorId);
                stats.resolved += 1;
                stats.totalTime += resolution.resolvedAt.getTime() - resolution.dispute.createdAt.getTime();
            });
            return Array.from(performanceMap.entries()).map(([mediatorId, stats]) => ({
                mediatorId,
                resolved: stats.resolved,
                avgTime: Math.round((stats.totalTime / stats.resolved) / (1000 * 60 * 60 * 24) * 100) / 100 // days
            }));
        }
        catch (error) {
            this.logger.error('Error getting mediator performance:', error);
            return [];
        }
    }
    /**
     * Get disputes for a specific user
     */
    async getUserDisputes(userId, options) {
        try {
            const { page, limit, filters = {} } = options;
            const skip = (page - 1) * limit;
            const where = {
                OR: [
                    { complainantId: userId },
                    { respondentId: userId }
                ]
            };
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.type) {
                where.disputeType = filters.type;
            }
            const disputes = await this.prisma.dispute.findMany({
                where,
                skip,
                take: limit,
                include: {
                    resolutions: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            const total = await this.prisma.dispute.count({ where });
            return {
                disputes,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            this.logger.error('Error getting user disputes:', error);
            throw new Error('Failed to get user disputes');
        }
    }
    /**
     * Get a specific dispute
     */
    async getDispute(disputeId) {
        try {
            return await this.prisma.dispute.findUnique({
                where: { id: disputeId },
                include: {
                    resolutions: true
                    // evidence: true // Might not exist
                }
            });
        }
        catch (error) {
            this.logger.error('Error getting dispute:', error);
            throw new Error('Failed to get dispute');
        }
    }
    /**
     * Send message in dispute
     */
    async sendMessage(disputeId, messageData) {
        try {
            const message = await this.prisma.disputeMessage.create({
                data: {
                    disputeId,
                    senderId: messageData.senderId,
                    content: messageData.message, // Using content instead of message
                    message: messageData.message, // Both content and message fields needed
                    messageType: messageData.messageType || 'text',
                    attachments: JSON.stringify(messageData.attachments || []),
                    sentAt: new Date()
                }
            });
            return message;
        }
        catch (error) {
            this.logger.error('Error sending message:', error);
            throw new Error('Failed to send message');
        }
    }
    /**
     * Get dispute messages
     */
    async getDisputeMessages(disputeId, options) {
        try {
            const { page, limit } = options;
            const skip = (page - 1) * limit;
            const messages = await this.prisma.disputeMessage.findMany({
                where: { disputeId },
                skip,
                take: limit,
                orderBy: {
                    sentAt: 'desc'
                }
            });
            const total = await this.prisma.disputeMessage.count({
                where: { disputeId }
            });
            return {
                messages,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            this.logger.error('Error getting dispute messages:', error);
            throw new Error('Failed to get dispute messages');
        }
    }
    /**
     * Schedule mediation
     */
    async scheduleMediation(disputeId, mediationData) {
        try {
            const mediation = await this.prisma.mediationSession.create({
                data: {
                    disputeId,
                    mediatorId: mediationData.mediatorId,
                    scheduledAt: mediationData.scheduledAt,
                    duration: mediationData.duration,
                    sessionType: mediationData.sessionType,
                    location: mediationData.location,
                    meetingLink: mediationData.meetingLink,
                    status: 'scheduled'
                }
            });
            return mediation;
        }
        catch (error) {
            this.logger.error('Error scheduling mediation:', error);
            throw new Error('Failed to schedule mediation');
        }
    }
    /**
     * Get all disputes (admin)
     */
    async getAllDisputes(options) {
        try {
            const { page, limit, filters = {} } = options;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.status)
                where.status = filters.status;
            if (filters.priority)
                where.priority = filters.priority;
            if (filters.type)
                where.disputeType = filters.type;
            const disputes = await this.prisma.dispute.findMany({
                where,
                skip,
                take: limit,
                include: {
                    resolutions: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            const total = await this.prisma.dispute.count({ where });
            return {
                disputes,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            this.logger.error('Error getting all disputes:', error);
            throw new Error('Failed to get disputes');
        }
    }
    /**
     * Assign dispute to mediator
     */
    async assignDispute(disputeId, assignedTo) {
        try {
            const result = await this.prisma.dispute.update({
                where: { id: disputeId },
                data: {
                    assignedMediatorId: assignedTo,
                    status: 'mediation',
                    updatedAt: new Date()
                }
            });
            return result;
        }
        catch (error) {
            this.logger.error('Error assigning dispute:', error);
            throw new Error('Failed to assign dispute');
        }
    }
    /**
     * Add evidence (simplified signature)
     */
    async addEvidence(disputeId, evidence) {
        try {
            const result = await this.prisma.disputeEvidence.create({
                data: {
                    disputeId,
                    submittedBy: evidence.submittedBy,
                    evidenceType: evidence.evidenceType,
                    title: evidence.title,
                    description: evidence.description,
                    fileUrls: JSON.stringify(evidence.fileUrls || []),
                    createdAt: new Date()
                }
            });
            return result;
        }
        catch (error) {
            this.logger.error('Error adding evidence:', error);
            throw new Error('Failed to add evidence');
        }
    }
    /**
     * Resolve dispute (simplified signature)
     */
    async resolveDispute(disputeId, resolution) {
        try {
            const result = await this.prisma.disputeResolution.create({
                data: {
                    disputeId,
                    resolvedBy: 'admin', // Will be updated when we have proper auth
                    resolutionType: resolution.resolutionType,
                    outcome: resolution.outcome,
                    description: resolution.description,
                    compensation: resolution.compensation,
                    resolvedAt: new Date()
                }
            });
            // Update dispute status
            await this.prisma.dispute.update({
                where: { id: disputeId },
                data: {
                    status: 'resolved',
                    updatedAt: new Date()
                }
            });
            return result;
        }
        catch (error) {
            this.logger.error('Error resolving dispute:', error);
            throw new Error('Failed to resolve dispute');
        }
    }
}
exports.DisputeResolutionService = DisputeResolutionService;
//# sourceMappingURL=disputeResolutionService.js.map