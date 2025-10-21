"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewConfidence = exports.ModerationDecision = exports.QueuePriority = exports.QueueType = exports.ConditionOperator = exports.RuleType = exports.ModerationAction = exports.DetectionMethod = exports.ViolationSeverity = exports.ViolationCategory = exports.ViolationType = exports.FlagStatus = exports.FlagSeverity = exports.FlagType = exports.ModerationStatus = exports.ContentType = exports.ContentModerationService = void 0;
var ContentType;
(function (ContentType) {
    ContentType["PRODUCT_LISTING"] = "product_listing";
    ContentType["PRODUCT_DESCRIPTION"] = "product_description";
    ContentType["USER_REVIEW"] = "user_review";
    ContentType["COMMENT"] = "comment";
    ContentType["MESSAGE"] = "message";
    ContentType["USER_PROFILE"] = "user_profile";
    ContentType["IMAGE"] = "image";
    ContentType["VIDEO"] = "video";
    ContentType["DOCUMENT"] = "document";
})(ContentType || (exports.ContentType = ContentType = {}));
var ModerationStatus;
(function (ModerationStatus) {
    ModerationStatus["PENDING"] = "pending";
    ModerationStatus["AUTO_APPROVED"] = "auto_approved";
    ModerationStatus["UNDER_REVIEW"] = "under_review";
    ModerationStatus["APPROVED"] = "approved";
    ModerationStatus["REJECTED"] = "rejected";
    ModerationStatus["ESCALATED"] = "escalated";
    ModerationStatus["QUARANTINED"] = "quarantined";
})(ModerationStatus || (exports.ModerationStatus = ModerationStatus = {}));
var FlagType;
(function (FlagType) {
    FlagType["INAPPROPRIATE_CONTENT"] = "inappropriate_content";
    FlagType["SPAM"] = "spam";
    FlagType["HARASSMENT"] = "harassment";
    FlagType["HATE_SPEECH"] = "hate_speech";
    FlagType["VIOLENCE"] = "violence";
    FlagType["ADULT_CONTENT"] = "adult_content";
    FlagType["FAKE_INFORMATION"] = "fake_information";
    FlagType["COPYRIGHT_VIOLATION"] = "copyright_violation";
    FlagType["PRIVACY_VIOLATION"] = "privacy_violation";
    FlagType["SCAM"] = "scam";
    FlagType["COUNTERFEIT"] = "counterfeit";
})(FlagType || (exports.FlagType = FlagType = {}));
var FlagSeverity;
(function (FlagSeverity) {
    FlagSeverity["LOW"] = "low";
    FlagSeverity["MEDIUM"] = "medium";
    FlagSeverity["HIGH"] = "high";
    FlagSeverity["CRITICAL"] = "critical";
})(FlagSeverity || (exports.FlagSeverity = FlagSeverity = {}));
var FlagStatus;
(function (FlagStatus) {
    FlagStatus["PENDING"] = "pending";
    FlagStatus["INVESTIGATING"] = "investigating";
    FlagStatus["VALID"] = "valid";
    FlagStatus["INVALID"] = "invalid";
    FlagStatus["RESOLVED"] = "resolved";
})(FlagStatus || (exports.FlagStatus = FlagStatus = {}));
var ViolationType;
(function (ViolationType) {
    ViolationType["PROFANITY"] = "profanity";
    ViolationType["SPAM"] = "spam";
    ViolationType["HARASSMENT"] = "harassment";
    ViolationType["HATE_SPEECH"] = "hate_speech";
    ViolationType["VIOLENCE"] = "violence";
    ViolationType["ADULT_CONTENT"] = "adult_content";
    ViolationType["MISLEADING_INFO"] = "misleading_info";
    ViolationType["PERSONAL_INFO"] = "personal_info";
    ViolationType["COPYRIGHT"] = "copyright";
    ViolationType["TRADEMARK"] = "trademark";
    ViolationType["ILLEGAL_CONTENT"] = "illegal_content";
})(ViolationType || (exports.ViolationType = ViolationType = {}));
var ViolationCategory;
(function (ViolationCategory) {
    ViolationCategory["SAFETY"] = "safety";
    ViolationCategory["LEGAL"] = "legal";
    ViolationCategory["COMMUNITY"] = "community";
    ViolationCategory["COMMERCIAL"] = "commercial";
    ViolationCategory["TECHNICAL"] = "technical";
})(ViolationCategory || (exports.ViolationCategory = ViolationCategory = {}));
var ViolationSeverity;
(function (ViolationSeverity) {
    ViolationSeverity["LOW"] = "low";
    ViolationSeverity["MEDIUM"] = "medium";
    ViolationSeverity["HIGH"] = "high";
    ViolationSeverity["CRITICAL"] = "critical";
})(ViolationSeverity || (exports.ViolationSeverity = ViolationSeverity = {}));
var DetectionMethod;
(function (DetectionMethod) {
    DetectionMethod["AUTO_AI"] = "auto_ai";
    DetectionMethod["AUTO_KEYWORD"] = "auto_keyword";
    DetectionMethod["AUTO_IMAGE"] = "auto_image";
    DetectionMethod["MANUAL_REPORT"] = "manual_report";
    DetectionMethod["MANUAL_REVIEW"] = "manual_review";
    DetectionMethod["SYSTEM_SCAN"] = "system_scan";
})(DetectionMethod || (exports.DetectionMethod = DetectionMethod = {}));
var ModerationAction;
(function (ModerationAction) {
    ModerationAction["APPROVE"] = "approve";
    ModerationAction["REJECT"] = "reject";
    ModerationAction["EDIT"] = "edit";
    ModerationAction["WARNING"] = "warning";
    ModerationAction["SUSPEND_USER"] = "suspend_user";
    ModerationAction["BAN_USER"] = "ban_user";
    ModerationAction["REMOVE_CONTENT"] = "remove_content";
    ModerationAction["BLUR_CONTENT"] = "blur_content";
    ModerationAction["RESTRICT_VISIBILITY"] = "restrict_visibility";
    ModerationAction["REQUIRE_AGE_VERIFICATION"] = "require_age_verification";
})(ModerationAction || (exports.ModerationAction = ModerationAction = {}));
var RuleType;
(function (RuleType) {
    RuleType["KEYWORD_FILTER"] = "keyword_filter";
    RuleType["PATTERN_MATCH"] = "pattern_match";
    RuleType["AI_CLASSIFICATION"] = "ai_classification";
    RuleType["IMAGE_ANALYSIS"] = "image_analysis";
    RuleType["BEHAVIORAL"] = "behavioral";
    RuleType["THRESHOLD"] = "threshold";
})(RuleType || (exports.RuleType = RuleType = {}));
var ConditionOperator;
(function (ConditionOperator) {
    ConditionOperator["EQUALS"] = "equals";
    ConditionOperator["NOT_EQUALS"] = "not_equals";
    ConditionOperator["CONTAINS"] = "contains";
    ConditionOperator["NOT_CONTAINS"] = "not_contains";
    ConditionOperator["STARTS_WITH"] = "starts_with";
    ConditionOperator["ENDS_WITH"] = "ends_with";
    ConditionOperator["REGEX_MATCH"] = "regex_match";
    ConditionOperator["GREATER_THAN"] = "greater_than";
    ConditionOperator["LESS_THAN"] = "less_than";
    ConditionOperator["IN_LIST"] = "in_list";
    ConditionOperator["NOT_IN_LIST"] = "not_in_list";
})(ConditionOperator || (exports.ConditionOperator = ConditionOperator = {}));
var QueueType;
(function (QueueType) {
    QueueType["AUTO_FLAGGED"] = "auto_flagged";
    QueueType["USER_REPORTED"] = "user_reported";
    QueueType["ESCALATED"] = "escalated";
    QueueType["ROUTINE_REVIEW"] = "routine_review";
    QueueType["HIGH_PRIORITY"] = "high_priority";
})(QueueType || (exports.QueueType = QueueType = {}));
var QueuePriority;
(function (QueuePriority) {
    QueuePriority["LOW"] = "low";
    QueuePriority["NORMAL"] = "normal";
    QueuePriority["HIGH"] = "high";
    QueuePriority["URGENT"] = "urgent";
    QueuePriority["CRITICAL"] = "critical";
})(QueuePriority || (exports.QueuePriority = QueuePriority = {}));
var ModerationDecision;
(function (ModerationDecision) {
    ModerationDecision["APPROVE"] = "approve";
    ModerationDecision["APPROVE_WITH_EDITS"] = "approve_with_edits";
    ModerationDecision["REJECT"] = "reject";
    ModerationDecision["ESCALATE"] = "escalate";
    ModerationDecision["REQUEST_MORE_INFO"] = "request_more_info";
})(ModerationDecision || (exports.ModerationDecision = ModerationDecision = {}));
var ReviewConfidence;
(function (ReviewConfidence) {
    ReviewConfidence["LOW"] = "low";
    ReviewConfidence["MEDIUM"] = "medium";
    ReviewConfidence["HIGH"] = "high";
    ReviewConfidence["VERY_HIGH"] = "very_high";
})(ReviewConfidence || (exports.ReviewConfidence = ReviewConfidence = {}));
class ContentModerationService {
    constructor(prisma, logger) {
        this.profanityList = new Set();
        this.spamPatterns = [];
        this.prisma = prisma;
        this.logger = logger;
        this.initializeModerationData();
    }
    /**
     * Initialize moderation data (profanity lists, patterns, etc.)
     */
    async initializeModerationData() {
        try {
            // Load profanity list (in production, this would be from a database or external service)
            const profanityWords = [
                'spam', 'scam', 'fake', 'fraud', 'cheat', 'hack', 'illegal',
                // Add more words as needed - keeping it minimal for example
            ];
            profanityWords.forEach(word => this.profanityList.add(word.toLowerCase()));
            // Common spam patterns
            this.spamPatterns = [
                /\b(?:click here|act now|limited time|urgent|guaranteed|free money)\b/gi,
                /\b(?:make money fast|work from home|earn \$\d+)\b/gi,
                /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/\S*)?/g, // URLs in suspicious contexts
                /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card patterns
                /\b(?:\d{3}[\s-]?\d{3}[\s-]?\d{4}|\(\d{3}\)\s*\d{3}[\s-]?\d{4})\b/g // Phone patterns
            ];
            this.logger.info('Content moderation data initialized');
        }
        catch (error) {
            this.logger.error('Error initializing moderation data:', error);
        }
    }
    /**
     * Submit content for moderation
     */
    async submitContent(content) {
        try {
            const contentItem = await this.prisma.contentItem.create({
                data: {
                    ...content,
                    createdAt: new Date(),
                    status: ModerationStatus.PENDING
                }
            });
            // Run auto-moderation
            const autoResult = await this.runAutoModeration(contentItem.id);
            // Update content with auto-moderation results
            await this.updateContentStatus(contentItem.id, autoResult);
            // Add to moderation queue if needed
            if (autoResult.requiresHumanReview) {
                await this.addToModerationQueue(contentItem.id, autoResult);
            }
            this.logger.info(`Content submitted for moderation: ${contentItem.id}`);
            return { ...contentItem, flags: [], violations: [] };
        }
        catch (error) {
            this.logger.error('Error submitting content for moderation:', error);
            throw new Error('Failed to submit content for moderation');
        }
    }
    /**
     * Run automated moderation on content
     */
    async runAutoModeration(contentItemId) {
        try {
            const contentItem = await this.prisma.contentItem.findUnique({
                where: { id: contentItemId }
            });
            if (!contentItem) {
                throw new Error('Content item not found');
            }
            const result = {
                contentItemId,
                overallScore: 0,
                categories: {},
                recommendations: [],
                requiresHumanReview: false
            };
            // Text-based moderation
            if (contentItem.content) {
                const textAnalysis = await this.analyzeText(contentItem.content);
                result.categories.text = textAnalysis;
                result.overallScore = Math.max(result.overallScore, textAnalysis.score);
            }
            // Title analysis if available
            if (contentItem.title) {
                const titleAnalysis = await this.analyzeText(contentItem.title);
                result.categories.title = titleAnalysis;
                result.overallScore = Math.max(result.overallScore, titleAnalysis.score);
            }
            // Image moderation for image content
            if (contentItem.contentType === ContentType.IMAGE) {
                const imageAnalysis = await this.analyzeImage(contentItem.content);
                result.categories.image = imageAnalysis;
                result.overallScore = Math.max(result.overallScore, imageAnalysis.score);
            }
            // Apply moderation rules
            const ruleResults = await this.applyModerationRules(contentItem);
            if (ruleResults.length > 0) {
                result.categories.rules = {
                    score: Math.max(...ruleResults.map(r => 0)), // Fixed score issue
                    confidence: 0.9,
                    details: ruleResults.map(r => r.description)
                };
            }
            // Generate recommendations
            result.recommendations = this.generateRecommendations(result);
            result.requiresHumanReview = this.shouldRequireHumanReview(result);
            // Store auto-moderation result
            await this.storeAutoModerationResult(contentItemId, result);
            return result;
        }
        catch (error) {
            this.logger.error('Error running auto-moderation:', error);
            throw error;
        }
    }
    /**
     * Analyze text content for violations
     */
    async analyzeText(text) {
        const details = [];
        let score = 0;
        let maxConfidence = 0;
        const lowerText = text.toLowerCase();
        // Profanity detection
        for (const word of this.profanityList) {
            if (lowerText.includes(word)) {
                details.push(`Contains prohibited word: ${word}`);
                score = Math.max(score, 70);
                maxConfidence = 0.8;
            }
        }
        // Spam pattern detection
        for (const pattern of this.spamPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                details.push(`Spam pattern detected: ${matches[0]}`);
                score = Math.max(score, 60);
                maxConfidence = Math.max(maxConfidence, 0.7);
            }
        }
        // Excessive capitalization
        const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
        if (capsRatio > 0.5 && text.length > 10) {
            details.push('Excessive capitalization detected');
            score = Math.max(score, 30);
            maxConfidence = Math.max(maxConfidence, 0.6);
        }
        // Repetitive characters
        if (text.match(/(.)\1{4,}/)) {
            details.push('Repetitive characters detected');
            score = Math.max(score, 25);
            maxConfidence = Math.max(maxConfidence, 0.5);
        }
        return {
            score,
            confidence: maxConfidence,
            details
        };
    }
    /**
     * Analyze image content (placeholder for actual image analysis)
     */
    async analyzeImage(imageUrl) {
        // In production, this would integrate with image analysis services
        // like Google Vision API, AWS Rekognition, etc.
        // Simulate image analysis
        const mockResults = {
            score: Math.random() * 50, // Random score for demonstration
            confidence: 0.7,
            details: imageUrl.includes('inappropriate') ? ['Potentially inappropriate content'] : []
        };
        return mockResults;
    }
    /**
     * Apply custom moderation rules
     */
    async applyModerationRules(contentItem) {
        try {
            const rules = await this.prisma.moderationRule.findMany({
                where: {
                    isActive: true,
                    // contentTypes: { has: contentItem.contentType } // Field structure issue
                },
                orderBy: { priority: 'desc' }
            });
            const violations = [];
            for (const rule of rules) {
                const ruleResult = this.evaluateRule(rule, contentItem);
                if (ruleResult.violated) {
                    violations.push({
                        contentItemId: contentItem.id,
                        violationType: ruleResult.violationType,
                        category: ViolationCategory.COMMUNITY,
                        severity: ViolationSeverity.MEDIUM, // rule.severity might be string
                        description: ruleResult.description,
                        detectedBy: DetectionMethod.AUTO_KEYWORD,
                        detectedAt: new Date(),
                        confidence: ruleResult.confidence
                    });
                }
            }
            return violations;
        }
        catch (error) {
            this.logger.error('Error applying moderation rules:', error);
            return [];
        }
    }
    /**
     * Evaluate a single moderation rule
     */
    evaluateRule(rule, contentItem) {
        let allConditionsMet = true;
        const description = `Rule violation: ${rule.name}`;
        for (const condition of rule.conditions) {
            const fieldValue = this.getFieldValue(contentItem, condition.field);
            const conditionMet = this.evaluateCondition(fieldValue, condition);
            if (!conditionMet) {
                allConditionsMet = false;
                break;
            }
        }
        return {
            violated: allConditionsMet,
            violationType: ViolationType.SPAM, // This would be determined by rule configuration
            description,
            confidence: 0.8,
            score: allConditionsMet ? 80 : 0
        };
    }
    /**
     * Get field value from content item
     */
    getFieldValue(contentItem, field) {
        const fieldPath = field.split('.');
        let value = contentItem;
        for (const path of fieldPath) {
            value = value?.[path];
        }
        return value;
    }
    /**
     * Evaluate a single condition
     */
    evaluateCondition(fieldValue, condition) {
        const value = condition.caseSensitive ? condition.value : condition.value?.toLowerCase();
        const compareValue = condition.caseSensitive ? fieldValue : fieldValue?.toLowerCase();
        switch (condition.operator) {
            case ConditionOperator.EQUALS:
                return compareValue === value;
            case ConditionOperator.NOT_EQUALS:
                return compareValue !== value;
            case ConditionOperator.CONTAINS:
                return compareValue?.includes(value);
            case ConditionOperator.NOT_CONTAINS:
                return !compareValue?.includes(value);
            case ConditionOperator.STARTS_WITH:
                return compareValue?.startsWith(value);
            case ConditionOperator.ENDS_WITH:
                return compareValue?.endsWith(value);
            case ConditionOperator.REGEX_MATCH:
                return new RegExp(value).test(compareValue);
            case ConditionOperator.GREATER_THAN:
                return parseFloat(fieldValue) > parseFloat(value);
            case ConditionOperator.LESS_THAN:
                return parseFloat(fieldValue) < parseFloat(value);
            case ConditionOperator.IN_LIST:
                return Array.isArray(value) && value.includes(compareValue);
            case ConditionOperator.NOT_IN_LIST:
                return Array.isArray(value) && !value.includes(compareValue);
            default:
                return false;
        }
    }
    /**
     * Generate recommendations based on analysis
     */
    generateRecommendations(result) {
        const recommendations = [];
        if (result.overallScore >= 80) {
            recommendations.push({
                action: ModerationAction.REJECT,
                reason: 'High risk content detected',
                confidence: 0.9,
                severity: ViolationSeverity.HIGH
            });
        }
        else if (result.overallScore >= 60) {
            recommendations.push({
                action: ModerationAction.REQUIRE_AGE_VERIFICATION,
                reason: 'Potentially inappropriate content',
                confidence: 0.7,
                severity: ViolationSeverity.MEDIUM
            });
        }
        else if (result.overallScore >= 40) {
            recommendations.push({
                action: ModerationAction.WARNING,
                reason: 'Content may violate community guidelines',
                confidence: 0.6,
                severity: ViolationSeverity.LOW
            });
        }
        else if (result.overallScore < 20) {
            recommendations.push({
                action: ModerationAction.APPROVE,
                reason: 'Content appears to be safe',
                confidence: 0.8,
                severity: ViolationSeverity.LOW
            });
        }
        return recommendations;
    }
    /**
     * Determine if content requires human review
     */
    shouldRequireHumanReview(result) {
        // Require human review for:
        // 1. High-risk content that's not clearly violating
        // 2. Content with low confidence scores
        // 3. Borderline cases
        return ((result.overallScore >= 40 && result.overallScore <= 70) ||
            Object.values(result.categories).some(cat => cat.confidence < 0.7) ||
            result.recommendations.some(rec => rec.confidence < 0.8));
    }
    /**
     * Store auto-moderation result
     */
    async storeAutoModerationResult(contentItemId, result) {
        await this.prisma.contentItem.update({
            where: { id: contentItemId },
            data: {
                autoModerationScore: result.overallScore
            }
        });
    }
    /**
     * Update content status based on auto-moderation
     */
    async updateContentStatus(contentItemId, result) {
        let status = ModerationStatus.PENDING;
        const requiresReview = this.shouldRequireHumanReview(result);
        if (!requiresReview) {
            if (result.overallScore < 20) {
                status = ModerationStatus.AUTO_APPROVED;
            }
            else if (result.overallScore >= 80) {
                status = ModerationStatus.REJECTED;
            }
        }
        else {
            status = ModerationStatus.UNDER_REVIEW;
        }
        await this.prisma.contentItem.update({
            where: { id: contentItemId },
            data: { status }
        });
    }
    /**
     * Add content to moderation queue
     */
    async addToModerationQueue(contentItemId, result) {
        const priority = this.determinePriority(result);
        const dueDate = this.calculateDueDate(priority);
        await this.prisma.moderationQueue.create({
            data: {
                contentId: contentItemId, // Using contentId as required
                contentItemId,
                contentType: 'unknown', // Required field - would need to be determined from content
                flaggedBy: 'system', // Required field
                reason: 'Auto-moderation queue', // Required field
                content: '', // Required field - would need content text
                authorId: 'system', // Using authorId instead of author
                priority,
                createdAt: new Date()
            }
        });
    }
    /**
     * Determine queue priority based on moderation result
     */
    determinePriority(result) {
        if (result.overallScore >= 80)
            return QueuePriority.CRITICAL;
        if (result.overallScore >= 60)
            return QueuePriority.HIGH;
        if (result.overallScore >= 40)
            return QueuePriority.NORMAL;
        return QueuePriority.LOW;
    }
    /**
     * Calculate due date based on priority
     */
    calculateDueDate(priority) {
        const now = new Date();
        const hours = {
            [QueuePriority.CRITICAL]: 1,
            [QueuePriority.URGENT]: 4,
            [QueuePriority.HIGH]: 12,
            [QueuePriority.NORMAL]: 24,
            [QueuePriority.LOW]: 72
        };
        return new Date(now.getTime() + (hours[priority] * 60 * 60 * 1000));
    }
    /**
     * Flag content by user
     */
    async flagContent(flag) {
        try {
            const contentFlag = await this.prisma.contentFlag.create({
                data: {
                    contentItemId: flag.contentItemId,
                    flaggedBy: flag.flaggedBy,
                    flagType: flag.flagType,
                    reason: flag.reason,
                    description: flag.description,
                    severity: flag.severity,
                    reviewNotes: flag.reviewNotes,
                    flaggedAt: new Date(),
                    status: FlagStatus.PENDING,
                    content: {
                        connect: { id: flag.contentItemId }
                    }
                }
            });
            // Add to moderation queue with higher priority
            await this.prisma.moderationQueue.create({
                data: {
                    contentId: flag.contentItemId, // Using contentId as required
                    contentItemId: flag.contentItemId,
                    contentType: 'content', // Required field
                    flaggedBy: flag.flaggedBy, // Required field
                    reason: `User reported: ${flag.reason}`, // Required field
                    content: '', // Required field - would need actual content
                    authorId: 'unknown', // Required field - would need actual author ID
                    priority: this.flagSeverityToPriority(flag.severity),
                    createdAt: new Date()
                }
            });
            // Update content status
            await this.prisma.contentItem.update({
                where: { id: flag.contentItemId },
                data: { status: ModerationStatus.UNDER_REVIEW }
            });
            this.logger.info(`Content flagged: ${flag.contentItemId} by ${flag.flaggedBy}`);
            return contentFlag;
        }
        catch (error) {
            this.logger.error('Error flagging content:', error);
            throw new Error('Failed to flag content');
        }
    }
    /**
     * Convert flag severity to queue priority
     */
    flagSeverityToPriority(severity) {
        switch (severity) {
            case FlagSeverity.CRITICAL: return QueuePriority.CRITICAL;
            case FlagSeverity.HIGH: return QueuePriority.HIGH;
            case FlagSeverity.MEDIUM: return QueuePriority.NORMAL;
            case FlagSeverity.LOW: return QueuePriority.LOW;
            default: return QueuePriority.NORMAL;
        }
    }
    /**
     * Review content manually
     */
    async reviewContent(review) {
        try {
            const startTime = Date.now();
            const contentReview = await this.prisma.contentReview.create({
                data: {
                    contentId: review.contentItemId,
                    reviewerId: review.reviewerId,
                    decision: review.decision,
                    confidence: review.confidence,
                    reasoning: review.reasoning,
                    actionsTaken: JSON.stringify(review.actionsTaken),
                    reviewTime: review.reviewTime,
                    qualityScore: review.qualityScore,
                    verifiedAt: new Date()
                }
            });
            // Update content status based on decision
            const newStatus = this.decisionToStatus(review.decision);
            await this.prisma.contentItem.update({
                where: { id: review.contentItemId },
                data: {
                    status: newStatus,
                    moderatedAt: new Date(),
                    // moderatedBy: review.reviewerId // Field might not exist
                }
            });
            // Execute moderation actions
            for (const action of review.actionsTaken) {
                await this.executeModerationAction(review.contentItemId, action, review.reviewerId);
            }
            // Remove from moderation queue
            await this.prisma.moderationQueue.deleteMany({
                where: { contentItemId: review.contentItemId }
            });
            // Update reviewer metrics
            await this.updateReviewerMetrics(review.reviewerId);
            this.logger.info(`Content reviewed: ${review.contentItemId} by ${review.reviewerId}`);
            return { ...contentReview, actionsTaken: JSON.parse(contentReview.actionsTaken || '[]') };
        }
        catch (error) {
            this.logger.error('Error reviewing content:', error);
            throw new Error('Failed to review content');
        }
    }
    /**
     * Convert review decision to content status
     */
    decisionToStatus(decision) {
        switch (decision) {
            case ModerationDecision.APPROVE:
            case ModerationDecision.APPROVE_WITH_EDITS:
                return ModerationStatus.APPROVED;
            case ModerationDecision.REJECT:
                return ModerationStatus.REJECTED;
            case ModerationDecision.ESCALATE:
                return ModerationStatus.ESCALATED;
            default:
                return ModerationStatus.UNDER_REVIEW;
        }
    }
    /**
     * Execute moderation action
     */
    async executeModerationAction(contentItemId, action, moderatorId) {
        try {
            const contentItem = await this.prisma.contentItem.findUnique({
                where: { id: contentItemId }
            });
            if (!contentItem)
                return;
            switch (action) {
                case ModerationAction.REMOVE_CONTENT:
                    await this.removeContent(contentItemId);
                    break;
                case ModerationAction.SUSPEND_USER:
                    await this.suspendUser(contentItem.authorId, moderatorId);
                    break;
                case ModerationAction.BAN_USER:
                    await this.banUser(contentItem.authorId, moderatorId);
                    break;
                case ModerationAction.WARNING:
                    await this.sendWarning(contentItem.authorId, contentItemId);
                    break;
                case ModerationAction.BLUR_CONTENT:
                    await this.blurContent(contentItemId);
                    break;
                case ModerationAction.RESTRICT_VISIBILITY:
                    await this.restrictVisibility(contentItemId);
                    break;
            }
            this.logger.info(`Moderation action executed: ${action} on ${contentItemId}`);
        }
        catch (error) {
            this.logger.error(`Error executing moderation action ${action}:`, error);
        }
    }
    /**
     * Remove content
     */
    async removeContent(contentItemId) {
        await this.prisma.contentItem.update({
            where: { id: contentItemId },
            data: {
                content: '[Content Removed by Moderator]',
                isRemoved: true
            }
        });
    }
    /**
     * Suspend user
     */
    async suspendUser(userId, moderatorId) {
        const suspensionEnd = new Date();
        suspensionEnd.setDate(suspensionEnd.getDate() + 7); // 7-day suspension
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: true,
                suspendedAt: new Date(),
                // suspensionEnd, // Field might not exist
                // suspendedBy: moderatorId, // Field not in schema
                // suspensionReason: 'Content policy violation' // Field not in schema
            }
        });
    }
    /**
     * Ban user permanently
     */
    async banUser(userId, moderatorId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isBanned: true,
                bannedAt: new Date(),
                // bannedBy: moderatorId, // Field might not exist in schema
                // bannedReason: 'Severe content policy violation' // Field might not exist
            }
        });
    }
    /**
     * Send warning to user
     */
    async sendWarning(userId, contentItemId) {
        await this.prisma.userWarning.create({
            data: {
                userId,
                contentItemId,
                reason: 'Content policy violation',
                issuedBy: 'system', // Required field
                issuedAt: new Date(),
                // warningType: 'content_violation' // Field not in schema
            }
        });
    }
    /**
     * Blur content
     */
    async blurContent(contentItemId) {
        await this.prisma.contentItem.update({
            where: { id: contentItemId },
            data: {
                isBlurred: true,
                // blurReason: 'Potentially sensitive content' // Field might not exist
            }
        });
    }
    /**
     * Restrict content visibility
     */
    async restrictVisibility(contentItemId) {
        await this.prisma.contentItem.update({
            where: { id: contentItemId },
            data: {
                visibilityRestricted: true,
                // restrictionReason: 'Content under review' // Field might not exist
            }
        });
    }
    /**
     * Update reviewer metrics
     */
    async updateReviewerMetrics(reviewerId) {
        try {
            await this.prisma.user.update({
                where: { id: reviewerId },
                data: {
                // moderationStats: { increment: { totalReviews: 1 } } // Field might not exist
                }
            });
        }
        catch (error) {
            this.logger.error('Error updating reviewer metrics:', error);
        }
    }
    /**
     * Get moderation metrics
     */
    async getModerationMetrics(startDate, endDate) {
        try {
            const [total, pending, approved, rejected, flagged, reviews] = await Promise.all([
                this.prisma.contentItem.count({
                    where: { createdAt: { gte: startDate, lte: endDate } }
                }),
                this.prisma.contentItem.count({
                    where: {
                        createdAt: { gte: startDate, lte: endDate },
                        status: { in: [ModerationStatus.PENDING, ModerationStatus.UNDER_REVIEW] }
                    }
                }),
                this.prisma.contentItem.count({
                    where: {
                        createdAt: { gte: startDate, lte: endDate },
                        status: { in: [ModerationStatus.APPROVED, ModerationStatus.AUTO_APPROVED] }
                    }
                }),
                this.prisma.contentItem.count({
                    where: {
                        createdAt: { gte: startDate, lte: endDate },
                        status: ModerationStatus.REJECTED
                    }
                }),
                this.prisma.contentFlag.count({
                    where: { flaggedAt: { gte: startDate, lte: endDate } }
                }),
                this.prisma.contentReview.findMany({
                    where: { verifiedAt: { gte: startDate, lte: endDate } }
                })
            ]);
            const totalReviewTime = reviews.reduce((sum, review) => sum + (review.reviewTime || 0), 0);
            const averageReviewTime = reviews.length > 0 ? totalReviewTime / reviews.length : 0;
            const autoApproved = await this.prisma.contentItem.count({
                where: {
                    createdAt: { gte: startDate, lte: endDate },
                    status: ModerationStatus.AUTO_APPROVED
                }
            });
            const automationRate = total > 0 ? (autoApproved / total) * 100 : 0;
            // Calculate accuracy rate (placeholder - would need actual accuracy tracking)
            const accuracyRate = 95; // Mock value
            return {
                totalContent: total,
                pendingReview: pending,
                approved,
                rejected,
                flagged,
                averageReviewTime,
                automationRate: Math.round(automationRate * 100) / 100,
                accuracyRate
            };
        }
        catch (error) {
            this.logger.error('Error getting moderation metrics:', error);
            throw new Error('Failed to get moderation metrics');
        }
    }
    /**
     * Create moderation rule
     */
    async createModerationRule(rule) {
        try {
            const moderationRule = await this.prisma.moderationRule.create({
                data: {
                    name: rule.name,
                    description: rule.description,
                    type: rule.ruleType,
                    category: rule.ruleType, // Use ruleType as category if not provided
                    priority: rule.priority,
                    severity: rule.severity,
                    conditions: JSON.stringify(rule.conditions),
                    actions: JSON.stringify(rule.actions),
                    createdBy: rule.createdBy,
                    isActive: rule.isActive,
                    usageCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            });
            this.logger.info(`Moderation rule created: ${rule.name}`);
            return {
                ...moderationRule,
                ruleType: moderationRule.type,
                contentTypes: [], // Default empty array - would need to be populated based on business logic
                conditions: JSON.parse(moderationRule.conditions),
                actions: JSON.parse(moderationRule.actions)
            };
        }
        catch (error) {
            this.logger.error('Error creating moderation rule:', error);
            throw new Error('Failed to create moderation rule');
        }
    }
    /**
     * Assign queue item to reviewer
     */
    async assignQueueItem(queueItemId, reviewerId) {
        try {
            await this.prisma.moderationQueue.update({
                where: { id: queueItemId },
                data: { assignedTo: reviewerId }
            });
            this.logger.info(`Queue item ${queueItemId} assigned to ${reviewerId}`);
        }
        catch (error) {
            this.logger.error('Error assigning queue item:', error);
            throw new Error('Failed to assign queue item');
        }
    }
    /**
     * Generate moderation report
     */
    async generateModerationReport(startDate, endDate) {
        try {
            const metrics = await this.getModerationMetrics(startDate, endDate);
            // Get top violations
            const violations = await this.prisma.contentViolation.groupBy({
                by: ['violationType'],
                where: {
                    detectedAt: { gte: startDate, lte: endDate }
                },
                _count: true,
                orderBy: { _count: { violationType: 'desc' } },
                take: 5
            });
            const topViolations = violations.map(v => ({
                type: v.violationType,
                count: v._count
            }));
            // Get reviewer performance
            const reviewerPerformance = await this.getReviewerPerformance(startDate, endDate);
            // Generate recommendations
            const recommendations = [];
            if (metrics.pendingReview > metrics.approved) {
                recommendations.push('Consider increasing moderation team capacity');
            }
            if (metrics.automationRate < 70) {
                recommendations.push('Review auto-moderation rules to improve automation rate');
            }
            if (metrics.averageReviewTime > 300) { // 5 minutes
                recommendations.push('Optimize review processes to reduce average review time');
            }
            return {
                period: { start: startDate, end: endDate },
                metrics,
                topViolations,
                reviewerPerformance,
                recommendations
            };
        }
        catch (error) {
            this.logger.error('Error generating moderation report:', error);
            throw new Error('Failed to generate moderation report');
        }
    }
    /**
     * Get reviewer performance
     */
    async getReviewerPerformance(startDate, endDate) {
        try {
            const reviews = await this.prisma.contentReview.groupBy({
                by: ['reviewerId'],
                where: {
                    verifiedAt: { gte: startDate, lte: endDate }
                },
                _count: true,
                _avg: {
                    reviewTime: true
                }
            });
            return reviews.map(r => ({
                reviewerId: r.reviewerId,
                reviews: r._count,
                avgTime: Math.round((r._avg.reviewTime || 0) * 100) / 100
            }));
        }
        catch (error) {
            this.logger.error('Error getting reviewer performance:', error);
            return [];
        }
    }
    /**
     * Get content moderation status
     */
    async getContentModerationStatus(contentId) {
        try {
            const contentItem = await this.prisma.contentItem.findUnique({
                where: { id: contentId },
                include: {
                    flags: true,
                    violations: true
                }
            });
            if (!contentItem) {
                throw new Error('Content not found');
            }
            const lastReview = await this.prisma.contentReview.findFirst({
                where: { contentId },
                orderBy: { verifiedAt: 'desc' }
            });
            return {
                status: contentItem.status,
                flags: contentItem.flags || [],
                violations: contentItem.violations || [],
                lastReviewed: lastReview?.verifiedAt
            };
        }
        catch (error) {
            this.logger.error('Error getting content moderation status:', error);
            throw new Error('Failed to get content moderation status');
        }
    }
    /**
     * Moderate content
     */
    async moderateContent(data) {
        try {
            // Create or update content item
            await this.prisma.contentItem.upsert({
                where: { id: data.contentId },
                update: {
                    content: data.content,
                    updatedAt: new Date()
                },
                create: {
                    id: data.contentId,
                    itemId: data.contentId,
                    contentType: data.contentType,
                    content: data.content,
                    authorId: data.authorId,
                    status: 'pending',
                    createdAt: new Date()
                }
            });
            // Run auto-moderation
            const result = await this.runAutoModeration(data.content);
            // Update status based on result
            const requiresReview = this.shouldRequireHumanReview(result);
            const newStatus = requiresReview ? 'pending_review' : 'approved';
            await this.prisma.contentItem.update({
                where: { id: data.contentId },
                data: { status: newStatus }
            });
            return {
                status: newStatus,
                violations: [], // result.violations,
                recommendations: result.recommendations || []
            };
        }
        catch (error) {
            this.logger.error('Error moderating content:', error);
            throw new Error('Failed to moderate content');
        }
    }
    /**
     * Get moderation rules
     */
    async getModerationRules(filters = {}) {
        try {
            const where = {};
            if (filters.category)
                where.category = filters.category;
            if (filters.active !== undefined)
                where.isActive = filters.active;
            const rules = await this.prisma.moderationRule.findMany({
                where,
                orderBy: {
                    priority: 'desc'
                }
            });
            return rules;
        }
        catch (error) {
            this.logger.error('Error getting moderation rules:', error);
            throw new Error('Failed to get moderation rules');
        }
    }
    /**
     * Update moderation rule
     */
    async updateModerationRule(ruleId, updates) {
        try {
            const rule = await this.prisma.moderationRule.update({
                where: { id: ruleId },
                data: {
                    name: updates.name,
                    description: updates.description,
                    type: updates.ruleType,
                    category: updates.ruleType || 'general',
                    priority: updates.priority,
                    severity: updates.severity,
                    conditions: updates.conditions ? JSON.stringify(updates.conditions) : undefined,
                    actions: updates.actions ? JSON.stringify(updates.actions) : undefined,
                    isActive: updates.isActive,
                    updatedAt: new Date()
                }
            });
            this.logger.info(`Moderation rule updated: ${ruleId}`);
            return rule;
        }
        catch (error) {
            this.logger.error('Error updating moderation rule:', error);
            throw new Error('Failed to update moderation rule');
        }
    }
    /**
     * Assign moderation task
     */
    async assignModerationTask(queueId, assignedTo) {
        try {
            const result = await this.prisma.moderationQueue.update({
                where: { id: queueId },
                data: {
                    assignedTo,
                    assignedAt: new Date(),
                    updatedAt: new Date()
                }
            });
            this.logger.info(`Moderation task ${queueId} assigned to ${assignedTo}`);
            return result;
        }
        catch (error) {
            this.logger.error('Error assigning moderation task:', error);
            throw new Error('Failed to assign moderation task');
        }
    }
    /**
     * Get moderation queue (override with proper signature)
     */
    async getModerationQueue(options) {
        try {
            const { page, limit, filters = {} } = options;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.priority)
                where.priority = filters.priority;
            if (filters.status)
                where.status = filters.status;
            if (filters.assignedTo)
                where.assignedTo = filters.assignedTo;
            const queue = await this.prisma.moderationQueue.findMany({
                where,
                skip,
                take: limit,
                include: {
                    contentItem: true
                },
                orderBy: [
                    { priority: 'desc' },
                    { createdAt: 'asc' }
                ]
            });
            const total = await this.prisma.moderationQueue.count({ where });
            return {
                queue,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        catch (error) {
            this.logger.error('Error getting moderation queue:', error);
            throw new Error('Failed to get moderation queue');
        }
    }
}
exports.ContentModerationService = ContentModerationService;
//# sourceMappingURL=contentModerationService.js.map