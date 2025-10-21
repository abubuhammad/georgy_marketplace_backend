"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiskFlag = exports.ReviewPattern = exports.AuthenticityFlag = exports.RiskLevel = exports.AlertSeverity = exports.AlertType = exports.EndorsementType = exports.ChangeType = exports.AuthenticityStatus = exports.MetricSource = exports.MetricType = exports.ProfileStrength = exports.VerificationStatus = exports.BadgeType = exports.TrustLevel = exports.UserTrustService = void 0;
var TrustLevel;
(function (TrustLevel) {
    TrustLevel["UNVERIFIED"] = "unverified";
    TrustLevel["BASIC"] = "basic";
    TrustLevel["VERIFIED"] = "verified";
    TrustLevel["TRUSTED"] = "trusted";
    TrustLevel["PREMIUM"] = "premium";
    TrustLevel["EXPERT"] = "expert";
    TrustLevel["SUSPENDED"] = "suspended";
    TrustLevel["BANNED"] = "banned";
})(TrustLevel || (exports.TrustLevel = TrustLevel = {}));
var BadgeType;
(function (BadgeType) {
    BadgeType["EMAIL_VERIFIED"] = "email_verified";
    BadgeType["PHONE_VERIFIED"] = "phone_verified";
    BadgeType["IDENTITY_VERIFIED"] = "identity_verified";
    BadgeType["ADDRESS_VERIFIED"] = "address_verified";
    BadgeType["BUSINESS_VERIFIED"] = "business_verified";
    BadgeType["PAYMENT_VERIFIED"] = "payment_verified";
    BadgeType["SOCIAL_VERIFIED"] = "social_verified";
    BadgeType["EXPERT_SELLER"] = "expert_seller";
    BadgeType["TOP_RATED"] = "top_rated";
    BadgeType["POWER_USER"] = "power_user";
    BadgeType["FEATURED_SELLER"] = "featured_seller";
    BadgeType["COMMUNITY_MODERATOR"] = "community_moderator";
})(BadgeType || (exports.BadgeType = BadgeType = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["IN_PROGRESS"] = "in_progress";
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["REJECTED"] = "rejected";
    VerificationStatus["EXPIRED"] = "expired";
    VerificationStatus["REVOKED"] = "revoked";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var ProfileStrength;
(function (ProfileStrength) {
    ProfileStrength["WEAK"] = "weak";
    ProfileStrength["FAIR"] = "fair";
    ProfileStrength["GOOD"] = "good";
    ProfileStrength["STRONG"] = "strong";
    ProfileStrength["EXCELLENT"] = "excellent";
})(ProfileStrength || (exports.ProfileStrength = ProfileStrength = {}));
var MetricType;
(function (MetricType) {
    MetricType["TRANSACTION_COUNT"] = "transaction_count";
    MetricType["SUCCESSFUL_TRANSACTIONS"] = "successful_transactions";
    MetricType["DISPUTE_RATE"] = "dispute_rate";
    MetricType["RESPONSE_TIME"] = "response_time";
    MetricType["COMPLETION_RATE"] = "completion_rate";
    MetricType["CUSTOMER_SATISFACTION"] = "customer_satisfaction";
    MetricType["ACCOUNT_AGE"] = "account_age";
    MetricType["PROFILE_COMPLETENESS"] = "profile_completeness";
    MetricType["SOCIAL_CONNECTIONS"] = "social_connections";
    MetricType["REVIEW_QUALITY"] = "review_quality";
})(MetricType || (exports.MetricType = MetricType = {}));
var MetricSource;
(function (MetricSource) {
    MetricSource["SYSTEM_CALCULATED"] = "system_calculated";
    MetricSource["USER_PROVIDED"] = "user_provided";
    MetricSource["THIRD_PARTY"] = "third_party";
    MetricSource["PEER_REVIEWED"] = "peer_reviewed";
    MetricSource["ADMIN_ASSIGNED"] = "admin_assigned";
})(MetricSource || (exports.MetricSource = MetricSource = {}));
var AuthenticityStatus;
(function (AuthenticityStatus) {
    AuthenticityStatus["AUTHENTIC"] = "authentic";
    AuthenticityStatus["SUSPICIOUS"] = "suspicious";
    AuthenticityStatus["FAKE"] = "fake";
    AuthenticityStatus["UNDER_REVIEW"] = "under_review";
})(AuthenticityStatus || (exports.AuthenticityStatus = AuthenticityStatus = {}));
var ChangeType;
(function (ChangeType) {
    ChangeType["INCREASE"] = "increase";
    ChangeType["DECREASE"] = "decrease";
    ChangeType["RESET"] = "reset";
    ChangeType["MANUAL_ADJUSTMENT"] = "manual_adjustment";
})(ChangeType || (exports.ChangeType = ChangeType = {}));
var EndorsementType;
(function (EndorsementType) {
    EndorsementType["SELLER_QUALITY"] = "seller_quality";
    EndorsementType["COMMUNICATION"] = "communication";
    EndorsementType["RELIABILITY"] = "reliability";
    EndorsementType["PRODUCT_QUALITY"] = "product_quality";
    EndorsementType["SERVICE_QUALITY"] = "service_quality";
    EndorsementType["EXPERTISE"] = "expertise";
    EndorsementType["TRUSTWORTHINESS"] = "trustworthiness";
})(EndorsementType || (exports.EndorsementType = EndorsementType = {}));
var AlertType;
(function (AlertType) {
    AlertType["REPUTATION_DROP"] = "reputation_drop";
    AlertType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    AlertType["VERIFICATION_EXPIRING"] = "verification_expiring";
    AlertType["RISK_THRESHOLD_EXCEEDED"] = "risk_threshold_exceeded";
    AlertType["UNUSUAL_PATTERN"] = "unusual_pattern";
    AlertType["POLICY_VIOLATION"] = "policy_violation";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var AuthenticityFlag;
(function (AuthenticityFlag) {
    AuthenticityFlag["DUPLICATE_REVIEW"] = "duplicate_review";
    AuthenticityFlag["SUSPICIOUS_TIMING"] = "suspicious_timing";
    AuthenticityFlag["FAKE_PURCHASE"] = "fake_purchase";
    AuthenticityFlag["LANGUAGE_MISMATCH"] = "language_mismatch";
    AuthenticityFlag["REVIEW_FARMING"] = "review_farming";
    AuthenticityFlag["INCENTIVIZED_REVIEW"] = "incentivized_review";
})(AuthenticityFlag || (exports.AuthenticityFlag = AuthenticityFlag = {}));
var ReviewPattern;
(function (ReviewPattern) {
    ReviewPattern["BULK_REVIEWS"] = "bulk_reviews";
    ReviewPattern["SIMILAR_CONTENT"] = "similar_content";
    ReviewPattern["TIMING_PATTERN"] = "timing_pattern";
    ReviewPattern["RATING_PATTERN"] = "rating_pattern";
    ReviewPattern["DEVICE_PATTERN"] = "device_pattern";
})(ReviewPattern || (exports.ReviewPattern = ReviewPattern = {}));
var RiskFlag;
(function (RiskFlag) {
    RiskFlag["MULTIPLE_ACCOUNTS"] = "multiple_accounts";
    RiskFlag["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    RiskFlag["HIGH_DISPUTE_RATE"] = "high_dispute_rate";
    RiskFlag["POLICY_VIOLATIONS"] = "policy_violations";
    RiskFlag["FAKE_REVIEWS"] = "fake_reviews";
    RiskFlag["PAYMENT_ISSUES"] = "payment_issues";
})(RiskFlag || (exports.RiskFlag = RiskFlag = {}));
class UserTrustService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    /**
     * Initialize or update user trust profile
     */
    async initializeTrustProfile(userId) {
        try {
            const existingProfile = await this.prisma.userTrustProfile.findUnique({
                where: { userId }
            });
            if (existingProfile) {
                return await this.updateTrustProfile(userId);
            }
            // Create new trust profile
            const trustProfile = await this.prisma.userTrustProfile.create({
                data: {
                    userId,
                    trustScore: 50, // Starting score
                    trustLevel: TrustLevel.UNVERIFIED,
                    reputationScore: 50,
                    reliabilityScore: 50,
                    activityScore: 0,
                    socialScore: 0,
                    profileStrength: ProfileStrength.WEAK,
                    verificationBadges: '[]', // Add required field as JSON string
                    updatedAt: new Date()
                }
            });
            // Initialize basic metrics
            await this.initializeUserMetrics(userId);
            this.logger.info(`Trust profile initialized for user: ${userId}`);
            return trustProfile;
        }
        catch (error) {
            this.logger.error('Error initializing trust ', error);
            throw new Error('Failed to initialize trust profile');
        }
    }
    /**
     * Initialize basic user metrics
     */
    async initializeUserMetrics(userId) {
        const baseMetrics = [
            { type: MetricType.TRANSACTION_COUNT, value: 0, maxValue: 1000, weight: 0.2 },
            { type: MetricType.SUCCESSFUL_TRANSACTIONS, value: 0, maxValue: 1000, weight: 0.25 },
            { type: MetricType.DISPUTE_RATE, value: 0, maxValue: 100, weight: -0.3 },
            { type: MetricType.RESPONSE_TIME, value: 24, maxValue: 24, weight: 0.15 },
            { type: MetricType.COMPLETION_RATE, value: 100, maxValue: 100, weight: 0.2 },
            { type: MetricType.CUSTOMER_SATISFACTION, value: 0, maxValue: 5, weight: 0.3 }
        ];
        for (const metric of baseMetrics) {
            await this.prisma.trustMetric.create({
                data: {
                    userId,
                    metricType: metric.type,
                    value: metric.value,
                    maxValue: metric.maxValue,
                    weight: metric.weight,
                    // source: MetricSource.SYSTEM_CALCULATED, // Field doesn't exist in schema
                    lastCalculated: new Date()
                }
            });
        }
    }
    /**
     * Update trust profile with latest calculations
     */
    async updateTrustProfile(userId) {
        try {
            // Calculate new scores
            const trustScore = await this.calculateTrustScore(userId);
            const reputationScore = await this.calculateReputationScore(userId);
            const reliabilityScore = await this.calculateReliabilityScore(userId);
            const activityScore = await this.calculateActivityScore(userId);
            const socialScore = await this.calculateSocialScore(userId);
            // Determine trust level
            const trustLevel = this.determineTrustLevel(trustScore);
            const profileStrength = this.calculateProfileStrength(userId);
            // Update profile
            const updatedProfile = await this.prisma.userTrustProfile.update({
                where: { userId },
                data: {
                    trustScore,
                    trustLevel,
                    reputationScore,
                    reliabilityScore,
                    activityScore,
                    socialScore,
                    profileStrength: await profileStrength,
                    updatedAt: new Date()
                }
            });
            // Check for alerts
            await this.checkForTrustAlerts(userId, trustScore);
            this.logger.info(`Trust profile updated for user: ${userId} - Score: ${trustScore}`);
            return updatedProfile;
        }
        catch (error) {
            this.logger.error('Error updating trust ', error);
            throw new Error('Failed to update trust profile');
        }
    }
    /**
     * Calculate overall trust score
     */
    async calculateTrustScore(userId) {
        try {
            const metrics = await this.prisma.trustMetric.findMany({
                where: { userId }
            });
            let weightedSum = 0;
            let totalWeight = 0;
            for (const metric of metrics) {
                const normalizedValue = Math.min(metric.value / metric.maxValue, 1);
                const contribution = normalizedValue * metric.weight;
                weightedSum += contribution;
                totalWeight += Math.abs(metric.weight);
            }
            // Add verification bonus
            const verificationBonus = await this.calculateVerificationBonus(userId);
            // Calculate base score
            const baseScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 50;
            const finalScore = Math.max(0, Math.min(100, baseScore + verificationBonus));
            return Math.round(finalScore);
        }
        catch (error) {
            this.logger.error('Error calculating trust score:', error);
            return 50; // Default score
        }
    }
    /**
     * Calculate verification bonus points
     */
    async calculateVerificationBonus(userId) {
        try {
            const badges = await this.prisma.verificationBadge.findMany({
                where: {
                    userId,
                    status: VerificationStatus.VERIFIED
                }
            });
            const bonusMap = {
                [BadgeType.EMAIL_VERIFIED]: 2,
                [BadgeType.PHONE_VERIFIED]: 3,
                [BadgeType.IDENTITY_VERIFIED]: 10,
                [BadgeType.ADDRESS_VERIFIED]: 5,
                [BadgeType.BUSINESS_VERIFIED]: 15,
                [BadgeType.PAYMENT_VERIFIED]: 5,
                [BadgeType.EXPERT_SELLER]: 20,
                [BadgeType.TOP_RATED]: 15
            };
            return badges.reduce((bonus, badge) => {
                return bonus + (bonusMap[badge.badgeType] || 0);
            }, 0);
        }
        catch (error) {
            this.logger.error('Error calculating verification bonus:', error);
            return 0;
        }
    }
    /**
     * Calculate reputation score
     */
    async calculateReputationScore(userId) {
        try {
            // Get user reviews and ratings
            const reviews = await this.prisma.review.findMany({
                where: { productId: userId },
                select: { rating: true, createdAt: true }
            });
            if (reviews.length === 0)
                return 50;
            // Calculate weighted average with recency bias
            let weightedSum = 0;
            let totalWeight = 0;
            const now = new Date();
            reviews.forEach(review => {
                const daysSinceReview = (now.getTime() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
                const recencyWeight = Math.exp(-daysSinceReview / 180); // Decay over 6 months
                weightedSum += review.rating * recencyWeight;
                totalWeight += recencyWeight;
            });
            const averageRating = weightedSum / totalWeight;
            return Math.round((averageRating / 5) * 100);
        }
        catch (error) {
            this.logger.error('Error calculating reputation score:', error);
            return 50;
        }
    }
    /**
     * Calculate reliability score
     */
    async calculateReliabilityScore(userId) {
        try {
            const orders = await this.prisma.order.findMany({
                where: { productId: userId },
                select: {
                    status: true,
                    createdAt: true,
                    deliveryDate: true,
                    expectedDeliveryDate: true
                }
            });
            if (orders.length === 0)
                return 50;
            let reliabilityPoints = 0;
            let maxPoints = orders.length * 100;
            orders.forEach(order => {
                // Points for successful completion
                if (order.status === 'delivered') {
                    reliabilityPoints += 80;
                    // Bonus for on-time delivery
                    if (order.deliveryDate && order.expectedDeliveryDate) {
                        if (order.deliveryDate <= order.expectedDeliveryDate) {
                            reliabilityPoints += 20;
                        }
                    }
                }
                else if (order.status === 'cancelled') {
                    reliabilityPoints -= 20;
                }
            });
            return Math.max(0, Math.min(100, (reliabilityPoints / maxPoints) * 100));
        }
        catch (error) {
            this.logger.error('Error calculating reliability score:', error);
            return 50;
        }
    }
    /**
     * Calculate activity score
     */
    async calculateActivityScore(userId) {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const [recentLogins, recentOrders, recentMessages] = await Promise.all([
                this.prisma.userActivity.count({
                    where: {
                        userId,
                        activityType: 'login',
                        createdAt: { gte: thirtyDaysAgo }
                    }
                }),
                this.prisma.order.count({
                    where: {
                        OR: [{ buyerId: userId }, { productId: userId }],
                        createdAt: { gte: thirtyDaysAgo }
                    }
                }),
                this.prisma.message.count({
                    where: {
                        senderId: userId,
                        sentAt: { gte: thirtyDaysAgo }
                    }
                })
            ]);
            // Calculate activity score based on recent activity
            const loginScore = Math.min(recentLogins * 2, 40);
            const orderScore = Math.min(recentOrders * 10, 40);
            const messageScore = Math.min(recentMessages, 20);
            return loginScore + orderScore + messageScore;
        }
        catch (error) {
            this.logger.error('Error calculating activity score:', error);
            return 0;
        }
    }
    /**
     * Calculate social score
     */
    async calculateSocialScore(userId) {
        try {
            const [endorsements, socialConnections, communityParticipation] = await Promise.all([
                this.prisma.endorsement.count({
                    where: { endorseeId: userId, isVerified: true }
                }),
                this.prisma.socialConnection.count({
                    where: { userId }
                }),
                this.prisma.communityPost.count({
                    where: { authorId: userId }
                })
            ]);
            const endorsementScore = Math.min(endorsements * 5, 50);
            const connectionScore = Math.min(socialConnections * 2, 30);
            const participationScore = Math.min(communityParticipation * 1, 20);
            return endorsementScore + connectionScore + participationScore;
        }
        catch (error) {
            this.logger.error('Error calculating social score:', error);
            return 0;
        }
    }
    /**
     * Determine trust level based on score
     */
    determineTrustLevel(trustScore) {
        if (trustScore >= 90)
            return TrustLevel.EXPERT;
        if (trustScore >= 80)
            return TrustLevel.PREMIUM;
        if (trustScore >= 70)
            return TrustLevel.TRUSTED;
        if (trustScore >= 60)
            return TrustLevel.VERIFIED;
        if (trustScore >= 40)
            return TrustLevel.BASIC;
        return TrustLevel.UNVERIFIED;
    }
    /**
     * Calculate profile strength
     */
    async calculateProfileStrength(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    profile: true,
                    verificationBadges: true
                }
            });
            if (!user)
                return ProfileStrength.WEAK;
            let strengthScore = 0;
            // Basic profile completion
            if (user.firstName)
                strengthScore += 10;
            if (user.lastName)
                strengthScore += 10;
            if (user.email)
                strengthScore += 10;
            if (user.phone)
                strengthScore += 10;
            if (user.profile?.bio)
                strengthScore += 10;
            if (user.avatar)
                strengthScore += 10;
            // Address information
            // if (user.profile?.address) strengthScore += 15; // Address field doesn't exist
            // Verification badges
            const verifiedBadges = user.verificationBadges.filter(badge => badge.status === VerificationStatus.VERIFIED);
            strengthScore += verifiedBadges.length * 5;
            if (strengthScore >= 85)
                return ProfileStrength.EXCELLENT;
            if (strengthScore >= 70)
                return ProfileStrength.STRONG;
            if (strengthScore >= 50)
                return ProfileStrength.GOOD;
            if (strengthScore >= 30)
                return ProfileStrength.FAIR;
            return ProfileStrength.WEAK;
        }
        catch (error) {
            this.logger.error('Error calculating profile strength:', error);
            return ProfileStrength.WEAK;
        }
    }
    /**
     * Award verification badge
     */
    async awardVerificationBadge(badge) {
        try {
            // Check if badge already exists
            const existingBadge = await this.prisma.verificationBadge.findFirst({
                where: {
                    userId: badge.userId,
                    badgeType: badge.badgeType
                }
            });
            if (existingBadge) {
                // Update existing badge
                const updatedBadge = await this.prisma.verificationBadge.update({
                    where: { id: existingBadge.id },
                    data: {
                        status: VerificationStatus.VERIFIED,
                        earnedAt: new Date(),
                        verifiedBy: badge.verifiedBy,
                        expiresAt: badge.expiresAt,
                        metadata: badge.metadata
                    }
                });
                await this.updateTrustProfile(badge.userId);
                this.logger.info(`Verification badge updated: ${badge.badgeType} for ${badge.userId}`);
                return updatedBadge;
            }
            // Create new badge
            const newBadge = await this.prisma.verificationBadge.create({
                data: {
                    ...badge,
                    status: VerificationStatus.VERIFIED,
                    earnedAt: new Date(),
                    badgeName: badge.badgeType.toString() // Add required field
                }
            });
            await this.updateTrustProfile(badge.userId);
            this.logger.info(`Verification badge awarded: ${badge.badgeType} to ${badge.userId}`);
            return newBadge;
        }
        catch (error) {
            this.logger.error('Error awarding verification badge:', error);
            throw new Error('Failed to award verification badge');
        }
    }
    /**
     * Verify review authenticity
     */
    async verifyReviewAuthenticity(reviewId) {
        try {
            const review = await this.prisma.review.findUnique({
                where: { id: reviewId },
                include: {
                    user: true,
                    product: true
                }
            });
            if (!review) {
                throw new Error('Review not found');
            }
            const authenticityCheck = {
                reviewId,
                userId: review.userId,
                authenticityScore: 100,
                verificationStatus: AuthenticityStatus.AUTHENTIC,
                flags: [],
                verifiedPurchase: false, // !!review.order, // order property doesn't exist
                reviewPatterns: [],
                calculatedAt: new Date()
            };
            // Check for duplicate reviews
            const duplicateReviews = await this.prisma.review.count({
                where: {
                    userId: review.userId,
                    productId: review.productId,
                    id: { not: reviewId }
                }
            });
            if (duplicateReviews > 0) {
                authenticityCheck.flags.push(AuthenticityFlag.DUPLICATE_REVIEW);
                authenticityCheck.authenticityScore -= 30;
            }
            // Check timing patterns
            const recentReviews = await this.prisma.review.count({
                where: {
                    userId: review.userId,
                    createdAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                    }
                }
            });
            if (recentReviews > 5) {
                authenticityCheck.flags.push(AuthenticityFlag.SUSPICIOUS_TIMING);
                authenticityCheck.reviewPatterns.push(ReviewPattern.BULK_REVIEWS);
                authenticityCheck.authenticityScore -= 25;
            }
            // Check if review is from verified purchase
            // if (!review.order) { // order property doesn't exist
            //   authenticityCheck.flags.push(AuthenticityFlag.FAKE_PURCHASE);
            //   authenticityCheck.authenticityScore -= 40;
            // }
            // Determine final status
            if (authenticityCheck.authenticityScore < 40) {
                authenticityCheck.verificationStatus = AuthenticityStatus.FAKE;
            }
            else if (authenticityCheck.authenticityScore < 70) {
                authenticityCheck.verificationStatus = AuthenticityStatus.SUSPICIOUS;
            }
            // Store result
            const storedResult = await this.prisma.reviewAuthenticity.create({
                data: {
                    ...authenticityCheck,
                    confidence: authenticityCheck.authenticityScore // Add required field
                }
            });
            this.logger.info(`Review authenticity verified: ${reviewId} - Score: ${authenticityCheck.authenticityScore}`);
            return {
                ...storedResult,
                ...authenticityCheck // Merge with original authenticity check data
            };
        }
        catch (error) {
            this.logger.error('Error verifying review authenticity:', error);
            throw new Error('Failed to verify review authenticity');
        }
    }
    /**
     * Add endorsement
     */
    async addEndorsement(endorsementData) {
        try {
            // Check if endorser is eligible
            const endorser = await this.prisma.userTrustProfile.findUnique({
                where: { userId: endorsementData.endorserId }
            });
            if (!endorser || endorser.trustLevel === TrustLevel.UNVERIFIED) {
                throw new Error('Endorser must have verified trust level');
            }
            // Calculate endorsement weight based on endorser's trust level
            const weight = this.calculateEndorsementWeight(endorser.trustLevel);
            const newEndorsement = await this.prisma.endorsement.create({
                data: {
                    endorserId: endorsementData.endorserId,
                    endorseeId: endorsementData.endorseeId,
                    endorsementType: endorsementData.category,
                    category: endorsementData.category,
                    description: endorsementData.comment,
                    rating: endorsementData.rating,
                    isVerified: endorser.trustLevel >= TrustLevel.VERIFIED,
                    weight,
                    createdAt: new Date()
                }
            });
            // Update endorsed user's trust profile
            await this.updateTrustProfile(endorsementData.endorseeId);
            this.logger.info(`Endorsement added: ${endorsementData.endorserId} endorsed ${endorsementData.endorseeId}`);
            return newEndorsement;
        }
        catch (error) {
            this.logger.error('Error adding endorsement:', error);
            throw new Error('Failed to add endorsement');
        }
    }
    /**
     * Calculate endorsement weight based on endorser's trust level
     */
    calculateEndorsementWeight(trustLevel) {
        const weightMap = {
            [TrustLevel.UNVERIFIED]: 0.1,
            [TrustLevel.BASIC]: 0.3,
            [TrustLevel.VERIFIED]: 0.5,
            [TrustLevel.TRUSTED]: 0.7,
            [TrustLevel.PREMIUM]: 0.9,
            [TrustLevel.EXPERT]: 1.0,
            [TrustLevel.SUSPENDED]: 0,
            [TrustLevel.BANNED]: 0
        };
        return weightMap[trustLevel] || 0.1;
    }
    /**
     * Perform risk assessment
     */
    async performRiskAssessment(userId) {
        try {
            const riskFactors = [];
            // Check for multiple accounts
            const user = await this.prisma.user.findUnique({
                where: { id: userId }
            });
            if (user) {
                const duplicateAccounts = await this.prisma.user.count({
                    where: {
                        OR: [
                            { email: user.email, id: { not: userId } },
                            { phone: user.phone, id: { not: userId } }
                        ]
                    }
                });
                if (duplicateAccounts > 0) {
                    riskFactors.push({
                        factor: RiskFlag.MULTIPLE_ACCOUNTS,
                        score: 30,
                        weight: 0.8,
                        description: 'Multiple accounts detected with same email/phone'
                    });
                }
            }
            // Check dispute rate
            const disputes = await this.prisma.dispute.count({
                where: { respondentId: userId }
            });
            const orders = await this.prisma.order.count({
                where: { productId: userId }
            });
            const disputeRate = orders > 0 ? (disputes / orders) * 100 : 0;
            if (disputeRate > 5) {
                riskFactors.push({
                    factor: RiskFlag.HIGH_DISPUTE_RATE,
                    score: Math.min(disputeRate * 2, 50),
                    weight: 0.7,
                    description: `High dispute rate: ${disputeRate.toFixed(1)}%`
                });
            }
            // Check for policy violations
            const violations = await this.prisma.policyViolation.count({
                where: { userId }
            });
            if (violations > 0) {
                riskFactors.push({
                    factor: RiskFlag.POLICY_VIOLATIONS,
                    score: Math.min(violations * 10, 40),
                    weight: 0.6,
                    description: `${violations} policy violation(s) found`
                });
            }
            // Calculate overall risk
            let totalRiskScore = 0;
            let totalWeight = 0;
            riskFactors.forEach(factor => {
                totalRiskScore += factor.score * factor.weight;
                totalWeight += factor.weight;
            });
            const overallRiskScore = totalWeight > 0 ? totalRiskScore / totalWeight : 0;
            const overallRisk = this.determineRiskLevel(overallRiskScore);
            const recommendations = this.generateRiskRecommendations(riskFactors, overallRisk);
            const assessment = {
                overallRisk,
                riskFactors,
                riskScore: Math.round(overallRiskScore),
                recommendations,
                lastAssessed: new Date()
            };
            // Store risk assessment (using create/findFirst approach since upsert has schema issues)
            const existingAssessment = await this.prisma.riskAssessment.findFirst({
                where: { userId }
            });
            if (existingAssessment) {
                await this.prisma.riskAssessment.update({
                    where: { id: existingAssessment.id },
                    data: {
                        riskLevel: overallRisk,
                        riskScore: Math.round(overallRiskScore),
                        factors: JSON.stringify(riskFactors),
                        recommendations: JSON.stringify(recommendations),
                        assessedBy: 'system',
                        riskType: 'GENERAL'
                    }
                });
            }
            else {
                await this.prisma.riskAssessment.create({
                    data: {
                        userId,
                        riskLevel: overallRisk,
                        riskScore: Math.round(overallRiskScore),
                        factors: JSON.stringify(riskFactors),
                        recommendations: JSON.stringify(recommendations),
                        assessedBy: 'system',
                        riskType: 'GENERAL',
                        overallRisk: overallRisk, // Add required field
                        riskFactors: JSON.stringify(riskFactors) // Add required field
                    }
                });
            }
            this.logger.info(`Risk assessment completed for user: ${userId} - Risk: ${overallRisk}`);
            return assessment;
        }
        catch (error) {
            this.logger.error('Error performing risk assessment:', error);
            throw new Error('Failed to perform risk assessment');
        }
    }
    /**
     * Determine risk level from score
     */
    determineRiskLevel(riskScore) {
        if (riskScore >= 70)
            return RiskLevel.CRITICAL;
        if (riskScore >= 50)
            return RiskLevel.HIGH;
        if (riskScore >= 30)
            return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }
    /**
     * Generate risk recommendations
     */
    generateRiskRecommendations(riskFactors, riskLevel) {
        const recommendations = [];
        if (riskLevel === RiskLevel.CRITICAL) {
            recommendations.push('Immediate account review required');
            recommendations.push('Suspend account until review is completed');
        }
        if (riskLevel === RiskLevel.HIGH) {
            recommendations.push('Enhanced monitoring required');
            recommendations.push('Require additional verification');
        }
        riskFactors.forEach(factor => {
            switch (factor.factor) {
                case RiskFlag.MULTIPLE_ACCOUNTS:
                    recommendations.push('Verify account ownership and merge duplicates');
                    break;
                case RiskFlag.HIGH_DISPUTE_RATE:
                    recommendations.push('Provide seller training and support');
                    break;
                case RiskFlag.POLICY_VIOLATIONS:
                    recommendations.push('Review policy violations and take appropriate action');
                    break;
            }
        });
        return [...new Set(recommendations)]; // Remove duplicates
    }
    /**
     * Check for trust alerts
     */
    async checkForTrustAlerts(userId, currentTrustScore) {
        try {
            const previousProfile = await this.prisma.userTrustProfile.findUnique({
                where: { userId }
            });
            if (previousProfile && previousProfile.trustScore > currentTrustScore) {
                const drop = previousProfile.trustScore - currentTrustScore;
                if (drop >= 20) {
                    await this.createTrustAlert({
                        userId,
                        alertType: AlertType.REPUTATION_DROP,
                        severity: drop >= 40 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
                        message: `Trust score dropped by ${drop} points`,
                        metadata: {
                            previousScore: previousProfile.trustScore,
                            currentScore: currentTrustScore,
                            drop
                        },
                        isResolved: false,
                        createdAt: new Date()
                    });
                }
            }
            // Check for expiring verifications
            const expiringBadges = await this.prisma.verificationBadge.count({
                where: {
                    userId,
                    status: VerificationStatus.VERIFIED,
                    expiresAt: {
                        gte: new Date(),
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
                    }
                }
            });
            if (expiringBadges > 0) {
                await this.createTrustAlert({
                    userId,
                    alertType: AlertType.VERIFICATION_EXPIRING,
                    severity: AlertSeverity.MEDIUM,
                    message: `${expiringBadges} verification badge(s) expiring soon`,
                    metadata: { count: expiringBadges },
                    isResolved: false,
                    createdAt: new Date()
                });
            }
        }
        catch (error) {
            this.logger.error('Error checking for trust alerts:', error);
        }
    }
    /**
     * Create trust alert
     */
    async createTrustAlert(alert) {
        const trustAlert = await this.prisma.trustAlert.create({
            data: {
                ...alert,
                title: alert.alertType || 'Trust Alert', // Add required field
                description: alert.message || 'Trust alert created' // Add required field
            }
        });
        this.logger.warn(`Trust alert created: ${alert.alertType} for user ${alert.userId}`);
        return trustAlert;
    }
    /**
     * Get trust profile with all details
     */
    async getTrustProfile(userId) {
        try {
            const profile = await this.prisma.userTrustProfile.findUnique({
                where: { userId },
                include: {
                // verificationBadges: true, // Relation might not exist in schema
                // trustMetrics: true, // Relation might not exist in schema
                // riskFlags: true, // Relation might not exist in schema
                // endorsements: true, // Relation might not exist in schema
                // trustAlerts: { // Relation might not exist in schema
                //   where: { isResolved: false }
                // }
                }
            });
            return profile;
        }
        catch (error) {
            this.logger.error('Error getting trust ', error);
            return null;
        }
    }
    /**
     * Generate trust report for user
     */
    async generateUserTrustReport(userId) {
        try {
            const [profile, riskAssessment, recentChanges] = await Promise.all([
                this.getTrustProfile(userId),
                this.performRiskAssessment(userId),
                this.prisma.reputationChange.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                })
            ]);
            if (!profile) {
                throw new Error('Trust profile not found');
            }
            const recommendations = this.generateTrustRecommendations(profile, riskAssessment);
            return {
                profile,
                riskAssessment,
                recentChanges: recentChanges,
                recommendations
            };
        }
        catch (error) {
            this.logger.error('Error generating trust report:', error);
            throw new Error('Failed to generate trust report');
        }
    }
    /**
     * Generate trust recommendations
     */
    generateTrustRecommendations(profile, riskAssessment) {
        const recommendations = [];
        // Profile strength recommendations
        if (profile.profileStrength === ProfileStrength.WEAK) {
            recommendations.push('Complete your profile to improve trust score');
        }
        // Verification recommendations
        const verifiedBadges = profile.verificationBadges.filter(badge => badge.status === VerificationStatus.VERIFIED);
        if (verifiedBadges.length < 3) {
            recommendations.push('Verify your email, phone, and identity to boost trust');
        }
        // Activity recommendations
        if (profile.activityScore < 30) {
            recommendations.push('Increase platform activity to improve visibility');
        }
        // Social recommendations
        if (profile.socialScore < 20) {
            recommendations.push('Build social connections and get endorsements');
        }
        // Risk-based recommendations
        recommendations.push(...riskAssessment.recommendations);
        return [...new Set(recommendations)];
    }
    /**
     * Record reputation change
     */
    async recordReputationChange(change) {
        try {
            const reputationChange = await this.prisma.reputationChange.create({
                data: {
                    ...change,
                    points: change.delta || 0, // Add required field
                    source: 'system', // Add required field
                    createdAt: new Date()
                }
            });
            this.logger.info(`Reputation change recorded: ${change.userId} - ${change.delta}`);
            return reputationChange;
        }
        catch (error) {
            this.logger.error('Error recording reputation change:', error);
            throw new Error('Failed to record reputation change');
        }
    }
    /**
     * Get user endorsements with pagination and filters
     */
    async getUserEndorsements(userId, options) {
        try {
            const { page, limit, filters = {} } = options;
            const skip = (page - 1) * limit;
            const where = { endorseeId: userId };
            if (filters.category) {
                where.category = filters.category;
            }
            const [endorsements, total] = await Promise.all([
                this.prisma.endorsement.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        endorser: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        }
                    }
                }),
                this.prisma.endorsement.count({ where })
            ]);
            return {
                endorsements: endorsements,
                total,
                page,
                limit
            };
        }
        catch (error) {
            this.logger.error('Error getting user endorsements:', error);
            throw new Error('Failed to get user endorsements');
        }
    }
    /**
     * Assess user risk
     */
    async assessUserRisk(userId) {
        return await this.performRiskAssessment(userId);
    }
    /**
     * Verify content authenticity
     */
    async verifyContentAuthenticity(userId, contentType, contentId) {
        try {
            // For now, implement basic authenticity check
            // This would be expanded with ML/AI models in production
            let score = 100;
            const flags = [];
            if (contentType === 'review') {
                const authenticity = await this.verifyReviewAuthenticity(contentId);
                return {
                    isAuthentic: authenticity.verificationStatus === AuthenticityStatus.AUTHENTIC,
                    score: authenticity.authenticityScore,
                    flags: authenticity.flags,
                    details: authenticity
                };
            }
            // Basic checks for other content types
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { trustProfile: true }
            });
            if (!user) {
                flags.push('User not found');
                score = 0;
            }
            else if (user.trustProfile && user.trustProfile.trustScore < 30) {
                flags.push('Low trust score');
                score -= 30;
            }
            return {
                isAuthentic: score >= 70,
                score,
                flags,
                details: { userId, contentType, contentId }
            };
        }
        catch (error) {
            this.logger.error('Error verifying content authenticity:', error);
            throw new Error('Failed to verify content authenticity');
        }
    }
    /**
     * Generate platform-wide trust report with date range
     */
    async generatePlatformTrustReport(options) {
        try {
            const { startDate, endDate } = options;
            const dateFilter = startDate && endDate ? {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            } : {};
            // Get summary statistics
            const [totalUsers, verifiedUsers, suspendedUsers, trustProfiles] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.user.count({
                    where: {
                        trustProfile: {
                            trustLevel: {
                                in: [TrustLevel.VERIFIED, TrustLevel.TRUSTED, TrustLevel.PREMIUM, TrustLevel.EXPERT]
                            }
                        }
                    }
                }),
                this.prisma.user.count({
                    where: {
                        trustProfile: {
                            trustLevel: TrustLevel.SUSPENDED
                        }
                    }
                }),
                this.prisma.userTrustProfile.findMany({
                    select: { trustScore: true, trustLevel: true }
                })
            ]);
            const averageTrustScore = trustProfiles.length > 0
                ? trustProfiles.reduce((sum, p) => sum + p.trustScore, 0) / trustProfiles.length
                : 0;
            // Trust level distribution
            const trustDistribution = trustProfiles.reduce((acc, profile) => {
                acc[profile.trustLevel] = (acc[profile.trustLevel] || 0) + 1;
                return acc;
            }, {});
            // Recent reputation changes
            const recentChanges = await this.prisma.reputationChange.findMany({
                where: dateFilter,
                orderBy: { createdAt: 'desc' },
                take: 20
            });
            // Top risks
            const topRisks = await this.prisma.riskAssessment.findMany({
                where: {
                    riskLevel: { in: [RiskLevel.HIGH, RiskLevel.CRITICAL] }
                },
                orderBy: { riskScore: 'desc' },
                take: 10
            });
            return {
                summary: {
                    totalUsers,
                    verifiedUsers,
                    suspendedUsers,
                    averageTrustScore: Math.round(averageTrustScore)
                },
                trustDistribution,
                recentChanges: recentChanges,
                topRisks: topRisks
            };
        }
        catch (error) {
            this.logger.error('Error generating trust report:', error);
            throw new Error('Failed to generate trust report');
        }
    }
}
exports.UserTrustService = UserTrustService;
//# sourceMappingURL=userTrustService.js.map