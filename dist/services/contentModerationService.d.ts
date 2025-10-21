import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
interface ContentItem {
    id?: string;
    itemId: string;
    contentType: ContentType;
    title?: string;
    content: string;
    authorId: string;
    metadata?: any;
    status: ModerationStatus;
    createdAt: Date;
    moderatedAt?: Date;
    moderatedBy?: string;
    autoModerationScore?: number;
    flags: ContentFlag[];
    violations?: ContentViolation[];
}
interface ContentFlag {
    id?: string;
    contentItemId: string;
    flaggedBy: string;
    flagType: FlagType;
    reason: string;
    description?: string;
    severity: FlagSeverity;
    status: FlagStatus;
    flaggedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    reviewNotes?: string;
}
interface ContentViolation {
    id?: string;
    contentItemId: string;
    violationType: ViolationType;
    category: ViolationCategory;
    severity: ViolationSeverity;
    description: string;
    detectedBy: DetectionMethod;
    detectedAt: Date;
    confidence?: number;
    evidence?: string[];
    actionTaken?: ModerationAction;
}
interface ModerationRule {
    id?: string;
    name: string;
    description: string;
    contentTypes: ContentType[];
    ruleType: RuleType;
    conditions: RuleCondition[];
    actions: ModerationAction[];
    severity: ViolationSeverity;
    isActive: boolean;
    priority: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
interface RuleCondition {
    field: string;
    operator: ConditionOperator;
    value: any;
    caseSensitive?: boolean;
}
interface ModerationQueue {
    id?: string;
    contentItemId: string;
    queueType: QueueType;
    priority: QueuePriority;
    assignedTo?: string;
    dueDate: Date;
    createdAt: Date;
    completedAt?: Date;
    notes?: string;
}
interface AutoModerationResult {
    contentItemId: string;
    overallScore: number;
    categories: {
        [key: string]: {
            score: number;
            confidence: number;
            details: string[];
        };
    };
    recommendations: ModerationRecommendation[];
    requiresHumanReview: boolean;
}
interface ModerationRecommendation {
    action: ModerationAction;
    reason: string;
    confidence: number;
    severity: ViolationSeverity;
}
interface ContentReview {
    id?: string;
    contentItemId: string;
    reviewerId: string;
    decision: ModerationDecision;
    confidence: ReviewConfidence;
    reasoning: string;
    actionsTaken: ModerationAction[];
    reviewTime: number;
    verifiedAt: Date;
    qualityScore?: number;
}
interface ModerationMetrics {
    totalContent: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    flagged: number;
    averageReviewTime: number;
    automationRate: number;
    accuracyRate: number;
}
declare enum ContentType {
    PRODUCT_LISTING = "product_listing",
    PRODUCT_DESCRIPTION = "product_description",
    USER_REVIEW = "user_review",
    COMMENT = "comment",
    MESSAGE = "message",
    USER_PROFILE = "user_profile",
    IMAGE = "image",
    VIDEO = "video",
    DOCUMENT = "document"
}
declare enum ModerationStatus {
    PENDING = "pending",
    AUTO_APPROVED = "auto_approved",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    ESCALATED = "escalated",
    QUARANTINED = "quarantined"
}
declare enum FlagType {
    INAPPROPRIATE_CONTENT = "inappropriate_content",
    SPAM = "spam",
    HARASSMENT = "harassment",
    HATE_SPEECH = "hate_speech",
    VIOLENCE = "violence",
    ADULT_CONTENT = "adult_content",
    FAKE_INFORMATION = "fake_information",
    COPYRIGHT_VIOLATION = "copyright_violation",
    PRIVACY_VIOLATION = "privacy_violation",
    SCAM = "scam",
    COUNTERFEIT = "counterfeit"
}
declare enum FlagSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum FlagStatus {
    PENDING = "pending",
    INVESTIGATING = "investigating",
    VALID = "valid",
    INVALID = "invalid",
    RESOLVED = "resolved"
}
declare enum ViolationType {
    PROFANITY = "profanity",
    SPAM = "spam",
    HARASSMENT = "harassment",
    HATE_SPEECH = "hate_speech",
    VIOLENCE = "violence",
    ADULT_CONTENT = "adult_content",
    MISLEADING_INFO = "misleading_info",
    PERSONAL_INFO = "personal_info",
    COPYRIGHT = "copyright",
    TRADEMARK = "trademark",
    ILLEGAL_CONTENT = "illegal_content"
}
declare enum ViolationCategory {
    SAFETY = "safety",
    LEGAL = "legal",
    COMMUNITY = "community",
    COMMERCIAL = "commercial",
    TECHNICAL = "technical"
}
declare enum ViolationSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum DetectionMethod {
    AUTO_AI = "auto_ai",
    AUTO_KEYWORD = "auto_keyword",
    AUTO_IMAGE = "auto_image",
    MANUAL_REPORT = "manual_report",
    MANUAL_REVIEW = "manual_review",
    SYSTEM_SCAN = "system_scan"
}
declare enum ModerationAction {
    APPROVE = "approve",
    REJECT = "reject",
    EDIT = "edit",
    WARNING = "warning",
    SUSPEND_USER = "suspend_user",
    BAN_USER = "ban_user",
    REMOVE_CONTENT = "remove_content",
    BLUR_CONTENT = "blur_content",
    RESTRICT_VISIBILITY = "restrict_visibility",
    REQUIRE_AGE_VERIFICATION = "require_age_verification"
}
declare enum RuleType {
    KEYWORD_FILTER = "keyword_filter",
    PATTERN_MATCH = "pattern_match",
    AI_CLASSIFICATION = "ai_classification",
    IMAGE_ANALYSIS = "image_analysis",
    BEHAVIORAL = "behavioral",
    THRESHOLD = "threshold"
}
declare enum ConditionOperator {
    EQUALS = "equals",
    NOT_EQUALS = "not_equals",
    CONTAINS = "contains",
    NOT_CONTAINS = "not_contains",
    STARTS_WITH = "starts_with",
    ENDS_WITH = "ends_with",
    REGEX_MATCH = "regex_match",
    GREATER_THAN = "greater_than",
    LESS_THAN = "less_than",
    IN_LIST = "in_list",
    NOT_IN_LIST = "not_in_list"
}
declare enum QueueType {
    AUTO_FLAGGED = "auto_flagged",
    USER_REPORTED = "user_reported",
    ESCALATED = "escalated",
    ROUTINE_REVIEW = "routine_review",
    HIGH_PRIORITY = "high_priority"
}
declare enum QueuePriority {
    LOW = "low",
    NORMAL = "normal",
    HIGH = "high",
    URGENT = "urgent",
    CRITICAL = "critical"
}
declare enum ModerationDecision {
    APPROVE = "approve",
    APPROVE_WITH_EDITS = "approve_with_edits",
    REJECT = "reject",
    ESCALATE = "escalate",
    REQUEST_MORE_INFO = "request_more_info"
}
declare enum ReviewConfidence {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
export declare class ContentModerationService {
    private prisma;
    private logger;
    private profanityList;
    private spamPatterns;
    constructor(prisma: PrismaClient, logger: Logger);
    /**
     * Initialize moderation data (profanity lists, patterns, etc.)
     */
    private initializeModerationData;
    /**
     * Submit content for moderation
     */
    submitContent(content: Omit<ContentItem, 'id' | 'submittedAt' | 'status' | 'flags' | 'violations'>): Promise<ContentItem>;
    /**
     * Run automated moderation on content
     */
    private runAutoModeration;
    /**
     * Analyze text content for violations
     */
    private analyzeText;
    /**
     * Analyze image content (placeholder for actual image analysis)
     */
    private analyzeImage;
    /**
     * Apply custom moderation rules
     */
    private applyModerationRules;
    /**
     * Evaluate a single moderation rule
     */
    private evaluateRule;
    /**
     * Get field value from content item
     */
    private getFieldValue;
    /**
     * Evaluate a single condition
     */
    private evaluateCondition;
    /**
     * Generate recommendations based on analysis
     */
    private generateRecommendations;
    /**
     * Determine if content requires human review
     */
    private shouldRequireHumanReview;
    /**
     * Store auto-moderation result
     */
    private storeAutoModerationResult;
    /**
     * Update content status based on auto-moderation
     */
    private updateContentStatus;
    /**
     * Add content to moderation queue
     */
    private addToModerationQueue;
    /**
     * Determine queue priority based on moderation result
     */
    private determinePriority;
    /**
     * Calculate due date based on priority
     */
    private calculateDueDate;
    /**
     * Flag content by user
     */
    flagContent(flag: Omit<ContentFlag, 'id' | 'flaggedAt' | 'status'>): Promise<ContentFlag>;
    /**
     * Convert flag severity to queue priority
     */
    private flagSeverityToPriority;
    /**
     * Review content manually
     */
    reviewContent(review: Omit<ContentReview, 'id' | 'reviewedAt'>): Promise<ContentReview>;
    /**
     * Convert review decision to content status
     */
    private decisionToStatus;
    /**
     * Execute moderation action
     */
    private executeModerationAction;
    /**
     * Remove content
     */
    private removeContent;
    /**
     * Suspend user
     */
    private suspendUser;
    /**
     * Ban user permanently
     */
    private banUser;
    /**
     * Send warning to user
     */
    private sendWarning;
    /**
     * Blur content
     */
    private blurContent;
    /**
     * Restrict content visibility
     */
    private restrictVisibility;
    /**
     * Update reviewer metrics
     */
    private updateReviewerMetrics;
    /**
     * Get moderation metrics
     */
    getModerationMetrics(startDate: Date, endDate: Date): Promise<ModerationMetrics>;
    /**
     * Create moderation rule
     */
    createModerationRule(rule: Omit<ModerationRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ModerationRule>;
    /**
     * Assign queue item to reviewer
     */
    assignQueueItem(queueItemId: string, reviewerId: string): Promise<void>;
    /**
     * Generate moderation report
     */
    generateModerationReport(startDate: Date, endDate: Date): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        metrics: ModerationMetrics;
        topViolations: {
            type: string;
            count: number;
        }[];
        reviewerPerformance: {
            reviewerId: string;
            reviews: number;
            avgTime: number;
        }[];
        recommendations: string[];
    }>;
    /**
     * Get reviewer performance
     */
    private getReviewerPerformance;
    /**
     * Get content moderation status
     */
    getContentModerationStatus(contentId: string): Promise<{
        status: string;
        flags: any[];
        violations: any[];
        lastReviewed?: Date;
    }>;
    /**
     * Moderate content
     */
    moderateContent(data: {
        contentType: string;
        contentId: string;
        content: string;
        authorId: string;
    }): Promise<{
        status: string;
        violations: any[];
        recommendations: any[];
    }>;
    /**
     * Get moderation rules
     */
    getModerationRules(filters?: {
        category?: string;
        active?: boolean;
    }): Promise<{
        id: string;
        type: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        description: string;
        priority: number;
        createdBy: string;
        severity: string;
        conditions: string;
        usageCount: number;
        actions: string;
        lastUsed: Date | null;
    }[]>;
    /**
     * Update moderation rule
     */
    updateModerationRule(ruleId: string, updates: Partial<ModerationRule>): Promise<{
        id: string;
        type: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        category: string;
        description: string;
        priority: number;
        createdBy: string;
        severity: string;
        conditions: string;
        usageCount: number;
        actions: string;
        lastUsed: Date | null;
    }>;
    /**
     * Assign moderation task
     */
    assignModerationTask(queueId: string, assignedTo: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        content: string;
        metadata: string | null;
        assignedAt: Date | null;
        priority: string;
        reason: string;
        completedAt: Date | null;
        contentItemId: string | null;
        contentType: string;
        contentId: string;
        authorId: string;
        assignedTo: string | null;
        flaggedBy: string;
        reviewedAt: Date | null;
    }>;
    /**
     * Get moderation queue (override with proper signature)
     */
    getModerationQueue(options: {
        page: number;
        limit: number;
        filters?: {
            priority?: string;
            status?: string;
            assignedTo?: string;
        };
    }): Promise<{
        queue: ({
            contentItem: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string | null;
                status: string;
                content: string;
                contentType: string;
                authorId: string;
                itemId: string;
                moderatedAt: Date | null;
                autoModerationScore: number | null;
                isRemoved: boolean;
                isBlurred: boolean;
                visibilityRestricted: boolean;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            content: string;
            metadata: string | null;
            assignedAt: Date | null;
            priority: string;
            reason: string;
            completedAt: Date | null;
            contentItemId: string | null;
            contentType: string;
            contentId: string;
            authorId: string;
            assignedTo: string | null;
            flaggedBy: string;
            reviewedAt: Date | null;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
export { ContentType, ModerationStatus, FlagType, FlagSeverity, FlagStatus, ViolationType, ViolationCategory, ViolationSeverity, DetectionMethod, ModerationAction, RuleType, ConditionOperator, QueueType, QueuePriority, ModerationDecision, ReviewConfidence };
export type { ContentItem, ContentFlag, ContentViolation, ModerationRule, RuleCondition, ModerationQueue, AutoModerationResult, ModerationRecommendation, ContentReview, ModerationMetrics };
//# sourceMappingURL=contentModerationService.d.ts.map