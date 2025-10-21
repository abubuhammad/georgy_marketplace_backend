import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
interface TrustProfile {
    id?: string;
    userId: string;
    trustScore: number;
    trustLevel: TrustLevel;
    verificationBadges: VerificationBadge[];
    reputationScore: number;
    reliabilityScore: number;
    activityScore: number;
    socialScore: number;
    updatedAt: Date;
    profileStrength: ProfileStrength;
    riskFlags: RiskFlag[];
    endorsements: Endorsement[];
}
interface VerificationBadge {
    id?: string;
    userId: string;
    badgeType: BadgeType;
    status: VerificationStatus;
    verifiedAt?: Date;
    verifiedBy?: string;
    expiresAt?: Date;
    metadata?: any;
    evidenceUrls?: string[];
    verificationScore?: number;
    renewalRequired?: boolean;
}
interface TrustMetric {
    id?: string;
    userId: string;
    metricType: MetricType;
    value: number;
    maxValue: number;
    weight: number;
    lastCalculated: Date;
    source: MetricSource;
    details?: any;
}
interface ReviewAuthenticity {
    id?: string;
    reviewId: string;
    userId: string;
    authenticityScore: number;
    verificationStatus: AuthenticityStatus;
    flags: AuthenticityFlag[];
    verifiedPurchase: boolean;
    reviewPatterns: ReviewPattern[];
    calculatedAt: Date;
}
interface ReputationChange {
    id?: string;
    userId: string;
    changeType: ChangeType;
    previousScore: number;
    newScore: number;
    delta: number;
    reason: string;
    triggeredBy: string;
    metadata?: any;
    createdAt: Date;
}
interface Endorsement {
    id?: string;
    endorserId: string;
    endorseeId: string;
    endorsementType: EndorsementType;
    category: string;
    description?: string;
    rating: number;
    isVerified: boolean;
    createdAt: Date;
    weight?: number;
}
interface TrustAlert {
    id?: string;
    userId: string;
    alertType: AlertType;
    severity: AlertSeverity;
    message: string;
    metadata?: any;
    isResolved: boolean;
    createdAt: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
}
interface RiskAssessment {
    overallRisk: RiskLevel;
    riskFactors: RiskFactor[];
    riskScore: number;
    recommendations: string[];
    lastAssessed: Date;
}
declare enum TrustLevel {
    UNVERIFIED = "unverified",
    BASIC = "basic",
    VERIFIED = "verified",
    TRUSTED = "trusted",
    PREMIUM = "premium",
    EXPERT = "expert",
    SUSPENDED = "suspended",
    BANNED = "banned"
}
declare enum BadgeType {
    EMAIL_VERIFIED = "email_verified",
    PHONE_VERIFIED = "phone_verified",
    IDENTITY_VERIFIED = "identity_verified",
    ADDRESS_VERIFIED = "address_verified",
    BUSINESS_VERIFIED = "business_verified",
    PAYMENT_VERIFIED = "payment_verified",
    SOCIAL_VERIFIED = "social_verified",
    EXPERT_SELLER = "expert_seller",
    TOP_RATED = "top_rated",
    POWER_USER = "power_user",
    FEATURED_SELLER = "featured_seller",
    COMMUNITY_MODERATOR = "community_moderator"
}
declare enum VerificationStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    VERIFIED = "verified",
    REJECTED = "rejected",
    EXPIRED = "expired",
    REVOKED = "revoked"
}
declare enum ProfileStrength {
    WEAK = "weak",
    FAIR = "fair",
    GOOD = "good",
    STRONG = "strong",
    EXCELLENT = "excellent"
}
declare enum MetricType {
    TRANSACTION_COUNT = "transaction_count",
    SUCCESSFUL_TRANSACTIONS = "successful_transactions",
    DISPUTE_RATE = "dispute_rate",
    RESPONSE_TIME = "response_time",
    COMPLETION_RATE = "completion_rate",
    CUSTOMER_SATISFACTION = "customer_satisfaction",
    ACCOUNT_AGE = "account_age",
    PROFILE_COMPLETENESS = "profile_completeness",
    SOCIAL_CONNECTIONS = "social_connections",
    REVIEW_QUALITY = "review_quality"
}
declare enum MetricSource {
    SYSTEM_CALCULATED = "system_calculated",
    USER_PROVIDED = "user_provided",
    THIRD_PARTY = "third_party",
    PEER_REVIEWED = "peer_reviewed",
    ADMIN_ASSIGNED = "admin_assigned"
}
declare enum AuthenticityStatus {
    AUTHENTIC = "authentic",
    SUSPICIOUS = "suspicious",
    FAKE = "fake",
    UNDER_REVIEW = "under_review"
}
declare enum ChangeType {
    INCREASE = "increase",
    DECREASE = "decrease",
    RESET = "reset",
    MANUAL_ADJUSTMENT = "manual_adjustment"
}
declare enum EndorsementType {
    SELLER_QUALITY = "seller_quality",
    COMMUNICATION = "communication",
    RELIABILITY = "reliability",
    PRODUCT_QUALITY = "product_quality",
    SERVICE_QUALITY = "service_quality",
    EXPERTISE = "expertise",
    TRUSTWORTHINESS = "trustworthiness"
}
declare enum AlertType {
    REPUTATION_DROP = "reputation_drop",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    VERIFICATION_EXPIRING = "verification_expiring",
    RISK_THRESHOLD_EXCEEDED = "risk_threshold_exceeded",
    UNUSUAL_PATTERN = "unusual_pattern",
    POLICY_VIOLATION = "policy_violation"
}
declare enum AlertSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum AuthenticityFlag {
    DUPLICATE_REVIEW = "duplicate_review",
    SUSPICIOUS_TIMING = "suspicious_timing",
    FAKE_PURCHASE = "fake_purchase",
    LANGUAGE_MISMATCH = "language_mismatch",
    REVIEW_FARMING = "review_farming",
    INCENTIVIZED_REVIEW = "incentivized_review"
}
declare enum ReviewPattern {
    BULK_REVIEWS = "bulk_reviews",
    SIMILAR_CONTENT = "similar_content",
    TIMING_PATTERN = "timing_pattern",
    RATING_PATTERN = "rating_pattern",
    DEVICE_PATTERN = "device_pattern"
}
declare enum RiskFlag {
    MULTIPLE_ACCOUNTS = "multiple_accounts",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    HIGH_DISPUTE_RATE = "high_dispute_rate",
    POLICY_VIOLATIONS = "policy_violations",
    FAKE_REVIEWS = "fake_reviews",
    PAYMENT_ISSUES = "payment_issues"
}
interface RiskFactor {
    factor: RiskFlag;
    score: number;
    weight: number;
    description: string;
    evidence?: string[];
}
export declare class UserTrustService {
    private prisma;
    private logger;
    constructor(prisma: PrismaClient, logger: Logger);
    /**
     * Initialize or update user trust profile
     */
    initializeTrustProfile(userId: string): Promise<TrustProfile>;
    /**
     * Initialize basic user metrics
     */
    private initializeUserMetrics;
    /**
     * Update trust profile with latest calculations
     */
    updateTrustProfile(userId: string): Promise<TrustProfile>;
    /**
     * Calculate overall trust score
     */
    calculateTrustScore(userId: string): Promise<number>;
    /**
     * Calculate verification bonus points
     */
    private calculateVerificationBonus;
    /**
     * Calculate reputation score
     */
    private calculateReputationScore;
    /**
     * Calculate reliability score
     */
    private calculateReliabilityScore;
    /**
     * Calculate activity score
     */
    private calculateActivityScore;
    /**
     * Calculate social score
     */
    private calculateSocialScore;
    /**
     * Determine trust level based on score
     */
    private determineTrustLevel;
    /**
     * Calculate profile strength
     */
    private calculateProfileStrength;
    /**
     * Award verification badge
     */
    awardVerificationBadge(badge: Omit<VerificationBadge, 'id' | 'verifiedAt' | 'status'>): Promise<VerificationBadge>;
    /**
     * Verify review authenticity
     */
    verifyReviewAuthenticity(reviewId: string): Promise<ReviewAuthenticity>;
    /**
     * Add endorsement
     */
    addEndorsement(endorsementData: {
        endorserId: string;
        endorseeId: string;
        category: string;
        rating: number;
        comment?: string;
        relatedOrder?: string;
    }): Promise<Endorsement>;
    /**
     * Calculate endorsement weight based on endorser's trust level
     */
    private calculateEndorsementWeight;
    /**
     * Perform risk assessment
     */
    performRiskAssessment(userId: string): Promise<RiskAssessment>;
    /**
     * Determine risk level from score
     */
    private determineRiskLevel;
    /**
     * Generate risk recommendations
     */
    private generateRiskRecommendations;
    /**
     * Check for trust alerts
     */
    private checkForTrustAlerts;
    /**
     * Create trust alert
     */
    private createTrustAlert;
    /**
     * Get trust profile with all details
     */
    getTrustProfile(userId: string): Promise<TrustProfile | null>;
    /**
     * Generate trust report for user
     */
    generateUserTrustReport(userId: string): Promise<{
        profile: TrustProfile | null;
        riskAssessment: RiskAssessment;
        recentChanges: ReputationChange[];
        recommendations: string[];
    }>;
    /**
     * Generate trust recommendations
     */
    private generateTrustRecommendations;
    /**
     * Record reputation change
     */
    recordReputationChange(change: Omit<ReputationChange, 'id' | 'timestamp'>): Promise<ReputationChange>;
    /**
     * Get user endorsements with pagination and filters
     */
    getUserEndorsements(userId: string, options: {
        page: number;
        limit: number;
        filters?: {
            category?: string;
        };
    }): Promise<{
        endorsements: Endorsement[];
        total: number;
        page: number;
        limit: number;
    }>;
    /**
     * Assess user risk
     */
    assessUserRisk(userId: string): Promise<RiskAssessment>;
    /**
     * Verify content authenticity
     */
    verifyContentAuthenticity(userId: string, contentType: string, contentId: string): Promise<{
        isAuthentic: boolean;
        score: number;
        flags: string[];
        details?: any;
    }>;
    /**
     * Generate platform-wide trust report with date range
     */
    generatePlatformTrustReport(options: {
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        summary: {
            totalUsers: number;
            verifiedUsers: number;
            suspendedUsers: number;
            averageTrustScore: number;
        };
        trustDistribution: {
            [key: string]: number;
        };
        recentChanges: ReputationChange[];
        topRisks: RiskAssessment[];
    }>;
}
export { TrustLevel, BadgeType, VerificationStatus, ProfileStrength, MetricType, MetricSource, AuthenticityStatus, ChangeType, EndorsementType, AlertType, AlertSeverity, RiskLevel, AuthenticityFlag, ReviewPattern, RiskFlag };
export type { TrustProfile, VerificationBadge, TrustMetric, ReviewAuthenticity, ReputationChange, Endorsement, TrustAlert, RiskAssessment, RiskFactor };
//# sourceMappingURL=userTrustService.d.ts.map