"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionStatus = exports.ActionSeverity = exports.ActionType = exports.IncidentStatus = exports.IncidentSeverity = exports.IncidentType = exports.RiskFlag = exports.RiskLevel = exports.TrendDirection = exports.ActivityStatus = exports.ActivitySeverity = exports.ActivityType = exports.AlertStatus = exports.AlertSource = exports.AlertSeverity = exports.AlertType = exports.AdminSafetyDashboardService = void 0;
var AlertType;
(function (AlertType) {
    AlertType["SECURITY_INCIDENT"] = "security_incident";
    AlertType["USER_REPORT"] = "user_report";
    AlertType["FRAUD_DETECTION"] = "fraud_detection";
    AlertType["SYSTEM_ANOMALY"] = "system_anomaly";
    AlertType["COMPLIANCE_VIOLATION"] = "compliance_violation";
    AlertType["TRUST_DEGRADATION"] = "trust_degradation";
    AlertType["CONTENT_VIOLATION"] = "content_violation";
})(AlertType || (exports.AlertType = AlertType = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["LOW"] = "low";
    AlertSeverity["MEDIUM"] = "medium";
    AlertSeverity["HIGH"] = "high";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
var AlertSource;
(function (AlertSource) {
    AlertSource["AUTOMATED_SYSTEM"] = "automated_system";
    AlertSource["USER_REPORT"] = "user_report";
    AlertSource["MANUAL_DETECTION"] = "manual_detection";
    AlertSource["THIRD_PARTY"] = "third_party";
})(AlertSource || (exports.AlertSource = AlertSource = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["OPEN"] = "open";
    AlertStatus["INVESTIGATING"] = "investigating";
    AlertStatus["RESOLVED"] = "resolved";
    AlertStatus["DISMISSED"] = "dismissed";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var ActivityType;
(function (ActivityType) {
    ActivityType["USER_SUSPENDED"] = "user_suspended";
    ActivityType["USER_BANNED"] = "user_banned";
    ActivityType["CONTENT_REMOVED"] = "content_removed";
    ActivityType["DISPUTE_CREATED"] = "dispute_created";
    ActivityType["FRAUD_DETECTED"] = "fraud_detected";
    ActivityType["SECURITY_BREACH"] = "security_breach";
    ActivityType["POLICY_UPDATED"] = "policy_updated";
})(ActivityType || (exports.ActivityType = ActivityType = {}));
var ActivitySeverity;
(function (ActivitySeverity) {
    ActivitySeverity["INFO"] = "info";
    ActivitySeverity["WARNING"] = "warning";
    ActivitySeverity["ERROR"] = "error";
    ActivitySeverity["CRITICAL"] = "critical";
})(ActivitySeverity || (exports.ActivitySeverity = ActivitySeverity = {}));
var ActivityStatus;
(function (ActivityStatus) {
    ActivityStatus["COMPLETED"] = "completed";
    ActivityStatus["IN_PROGRESS"] = "in_progress";
    ActivityStatus["FAILED"] = "failed";
    ActivityStatus["PENDING"] = "pending";
})(ActivityStatus || (exports.ActivityStatus = ActivityStatus = {}));
var TrendDirection;
(function (TrendDirection) {
    TrendDirection["UP"] = "up";
    TrendDirection["DOWN"] = "down";
    TrendDirection["STABLE"] = "stable";
})(TrendDirection || (exports.TrendDirection = TrendDirection = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var RiskFlag;
(function (RiskFlag) {
    RiskFlag["MULTIPLE_ACCOUNTS"] = "multiple_accounts";
    RiskFlag["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    RiskFlag["HIGH_DISPUTE_RATE"] = "high_dispute_rate";
    RiskFlag["POLICY_VIOLATIONS"] = "policy_violations";
    RiskFlag["FAKE_REVIEWS"] = "fake_reviews";
    RiskFlag["PAYMENT_ISSUES"] = "payment_issues";
})(RiskFlag || (exports.RiskFlag = RiskFlag = {}));
var IncidentType;
(function (IncidentType) {
    IncidentType["FRAUD"] = "fraud";
    IncidentType["HARASSMENT"] = "harassment";
    IncidentType["DATA_BREACH"] = "data_breach";
    IncidentType["SYSTEM_ABUSE"] = "system_abuse";
    IncidentType["POLICY_VIOLATION"] = "policy_violation";
})(IncidentType || (exports.IncidentType = IncidentType = {}));
var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["LOW"] = "low";
    IncidentSeverity["MEDIUM"] = "medium";
    IncidentSeverity["HIGH"] = "high";
    IncidentSeverity["CRITICAL"] = "critical";
})(IncidentSeverity || (exports.IncidentSeverity = IncidentSeverity = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["REPORTED"] = "reported";
    IncidentStatus["INVESTIGATING"] = "investigating";
    IncidentStatus["CONTAINED"] = "contained";
    IncidentStatus["RESOLVED"] = "resolved";
    IncidentStatus["CLOSED"] = "closed";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
var ActionType;
(function (ActionType) {
    ActionType["SUSPEND_USER"] = "suspend_user";
    ActionType["BAN_USER"] = "ban_user";
    ActionType["REMOVE_CONTENT"] = "remove_content";
    ActionType["BLOCK_IP"] = "block_ip";
    ActionType["FREEZE_ACCOUNT"] = "freeze_account";
    ActionType["REQUIRE_VERIFICATION"] = "require_verification";
    ActionType["LIMIT_FEATURES"] = "limit_features";
})(ActionType || (exports.ActionType = ActionType = {}));
var ActionSeverity;
(function (ActionSeverity) {
    ActionSeverity["MINOR"] = "minor";
    ActionSeverity["MODERATE"] = "moderate";
    ActionSeverity["SEVERE"] = "severe";
    ActionSeverity["CRITICAL"] = "critical";
})(ActionSeverity || (exports.ActionSeverity = ActionSeverity = {}));
var ActionStatus;
(function (ActionStatus) {
    ActionStatus["ACTIVE"] = "active";
    ActionStatus["EXPIRED"] = "expired";
    ActionStatus["REVOKED"] = "revoked";
    ActionStatus["COMPLETED"] = "completed";
})(ActionStatus || (exports.ActionStatus = ActionStatus = {}));
class AdminSafetyDashboardService {
    constructor(prisma, logger) {
        this.prisma = prisma;
        this.logger = logger;
    }
    /**
     * Get comprehensive safety dashboard
     */
    async getSafetyDashboard() {
        try {
            const [overview, metrics, alerts, recentActivity, trends] = await Promise.all([
                this.getSafetyOverview(),
                this.getSafetyMetrics(),
                this.getActiveAlerts(),
                this.getRecentActivity(),
                this.getSafetyTrends()
            ]);
            return {
                overview,
                metrics,
                alerts,
                recentActivity,
                trends
            };
        }
        catch (error) {
            this.logger.error('Error getting safety dashboard:', error);
            throw new Error('Failed to get safety dashboard');
        }
    }
    /**
     * Get safety overview
     */
    async getSafetyOverview() {
        try {
            const [totalUsers, activeIncidents, pendingReports, openDisputes, riskUsers, trustProfiles] = await Promise.all([
                this.prisma.user.count({ where: { isActive: true } }),
                this.prisma.safetyIncident.count({
                    where: {
                        status: { in: ['reported', 'investigating', 'contained'] }
                    }
                }),
                this.prisma.userReport.count({ where: { status: 'submitted' } }),
                this.prisma.dispute.count({
                    where: {
                        status: { in: ['submitted', 'under_review', 'investigation', 'mediation'] }
                    }
                }),
                this.prisma.userTrustProfile.count({
                    where: { trustLevel: { in: ['suspended', 'banned'] } }
                }),
                this.prisma.userTrustProfile.findMany({
                    select: { trustScore: true, trustLevel: true }
                })
            ]);
            // Calculate trust score distribution
            const trustDistribution = trustProfiles.reduce((acc, profile) => {
                acc[profile.trustLevel] = (acc[profile.trustLevel] || 0) + 1;
                return acc;
            }, {});
            const averageTrustScore = trustProfiles.length > 0
                ? trustProfiles.reduce((sum, p) => sum + p.trustScore, 0) / trustProfiles.length
                : 0;
            // Mock compliance score - would be calculated based on various factors
            const complianceScore = 92;
            return {
                totalUsers,
                activeIncidents,
                pendingReports,
                openDisputes,
                riskUsers,
                trustScore: {
                    average: Math.round(averageTrustScore),
                    distribution: trustDistribution
                },
                complianceScore,
                updatedAt: new Date()
            };
        }
        catch (error) {
            this.logger.error('Error getting safety overview:', error);
            throw error;
        }
    }
    /**
     * Get safety metrics
     */
    async getSafetyMetrics() {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const [
            // User safety metrics
            verifiedUsers, suspendedUsers, bannedUsers, totalUsers, identityVerified, 
            // Content safety metrics
            contentModerated, autoApproved, flaggedContent, removedContent, 
            // Transaction safety metrics
            fraudDetected, totalTransactions, disputes, paymentFailures, refundRequests, 
            // System security metrics
            securityIncidents, vulnerabilities, blockedIPs, failedLogins] = await Promise.all([
                // User safety
                this.prisma.user.count({
                    where: {
                        verificationBadges: { some: { status: 'verified' } }
                    }
                }),
                this.prisma.user.count({ where: { isSuspended: true } }),
                this.prisma.user.count({ where: { isBanned: true } }),
                this.prisma.user.count(),
                this.prisma.verificationBadge.count({
                    where: {
                        badgeType: 'identity_verified',
                        status: 'verified'
                    }
                }),
                // Content safety
                this.prisma.contentItem.count({
                    where: { createdAt: { gte: thirtyDaysAgo } }
                }),
                this.prisma.contentItem.count({
                    where: {
                        createdAt: { gte: thirtyDaysAgo },
                        status: 'auto_approved'
                    }
                }),
                this.prisma.contentFlag.count({
                    where: { flaggedAt: { gte: thirtyDaysAgo } }
                }),
                this.prisma.contentItem.count({
                    where: {
                        createdAt: { gte: thirtyDaysAgo },
                        status: 'rejected'
                    }
                }),
                // Transaction safety
                this.prisma.fraudDetection.count({
                    where: { detectedAt: { gte: thirtyDaysAgo } }
                }),
                this.prisma.payment.count({
                    where: { createdAt: { gte: thirtyDaysAgo } }
                }),
                this.prisma.dispute.count({
                    where: { createdAt: { gte: thirtyDaysAgo } }
                }),
                this.prisma.payment.count({
                    where: {
                        createdAt: { gte: thirtyDaysAgo },
                        status: 'failed'
                    }
                }),
                this.prisma.paymentRefund.count({
                    where: { createdAt: { gte: thirtyDaysAgo } }
                }),
                // System security
                this.prisma.securityIncident.count({
                    where: { detectedAt: { gte: thirtyDaysAgo } }
                }),
                this.prisma.vulnerabilityAssessment.count({
                    where: {
                        discoveredAt: { gte: thirtyDaysAgo },
                        status: 'open'
                    }
                }),
                this.prisma.blockedIP.count({
                    where: { isActive: true }
                }),
                this.prisma.securityLog.count({
                    where: {
                        createdAt: { gte: thirtyDaysAgo },
                        eventType: 'login_failure'
                    }
                })
            ]);
            return {
                userSafety: {
                    verifiedUsers,
                    suspendedUsers,
                    bannedUsers,
                    identityVerificationRate: totalUsers > 0 ? (identityVerified / totalUsers) * 100 : 0
                },
                contentSafety: {
                    contentModerated,
                    autoApprovalRate: contentModerated > 0 ? (autoApproved / contentModerated) * 100 : 0,
                    flaggedContent,
                    removedContent
                },
                transactionSafety: {
                    fraudDetected,
                    disputeRate: totalTransactions > 0 ? (disputes / totalTransactions) * 100 : 0,
                    paymentFailures,
                    refundRequests
                },
                systemSecurity: {
                    securityIncidents,
                    vulnerabilities,
                    blockedIPs,
                    failedLogins
                }
            };
        }
        catch (error) {
            this.logger.error('Error getting safety metrics:', error);
            throw error;
        }
    }
    /**
     * Get active safety alerts
     */
    async getActiveAlerts(limit = 50) {
        try {
            const alerts = await this.prisma.safetyAlert.findMany({
                where: {
                    status: { in: ['open', 'investigating'] }
                },
                orderBy: [
                    { severity: 'desc' },
                    { createdAt: 'desc' }
                ],
                take: limit
            });
            return alerts.map(alert => ({
                id: alert.id,
                type: alert.type,
                severity: alert.severity,
                title: alert.title,
                description: alert.description || '',
                source: alert.source,
                affectedCount: alert.affectedCount,
                status: alert.status,
                createdAt: alert.createdAt,
                assignedTo: alert.assignedTo || undefined,
                dueDate: alert.dueDate || undefined,
                metadata: alert.metadata
            }));
        }
        catch (error) {
            this.logger.error('Error getting active alerts:', error);
            return [];
        }
    }
    /**
     * Get recent safety activity
     */
    async getRecentActivity(limit = 100) {
        try {
            // Combine different types of activities
            const [userSuspensions, userBans, contentRemovals, newDisputes, fraudDetections] = await Promise.all([
                this.prisma.user.findMany({
                    where: {
                        isSuspended: true,
                        suspendedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    },
                    select: { id: true, firstName: true, lastName: true, suspendedAt: true },
                    take: 20
                }),
                this.prisma.user.findMany({
                    where: {
                        isBanned: true,
                        bannedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    },
                    select: { id: true, firstName: true, lastName: true, bannedAt: true },
                    take: 20
                }),
                this.prisma.contentItem.findMany({
                    where: {
                        status: 'rejected',
                        moderatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    },
                    select: { id: true, contentType: true, moderatedAt: true, authorId: true },
                    take: 20
                }),
                this.prisma.dispute.findMany({
                    where: {
                        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    },
                    select: { id: true, disputeType: true, createdAt: true, complainantId: true },
                    take: 20
                }),
                this.prisma.fraudDetection.findMany({
                    where: {
                        detectedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    },
                    select: { id: true, fraudType: true, detectedAt: true, userId: true },
                    take: 20
                })
            ]);
            const activities = [];
            // Add user suspensions
            userSuspensions.forEach(user => {
                activities.push({
                    id: `suspension-${user.id}`,
                    type: ActivityType.USER_SUSPENDED,
                    description: `User ${user.firstName} ${user.lastName} was suspended`,
                    user: user.id,
                    createdAt: user.suspendedAt,
                    severity: ActivitySeverity.WARNING,
                    status: ActivityStatus.COMPLETED
                });
            });
            // Add user bans
            userBans.forEach(user => {
                activities.push({
                    id: `ban-${user.id}`,
                    type: ActivityType.USER_BANNED,
                    description: `User ${user.firstName} ${user.lastName} was banned`,
                    user: user.id,
                    createdAt: user.bannedAt,
                    severity: ActivitySeverity.ERROR,
                    status: ActivityStatus.COMPLETED
                });
            });
            // Add content removals
            contentRemovals.forEach(content => {
                activities.push({
                    id: `content-removal-${content.id}`,
                    type: ActivityType.CONTENT_REMOVED,
                    description: `${content.contentType} content was removed`,
                    user: content.authorId,
                    createdAt: content.moderatedAt,
                    severity: ActivitySeverity.WARNING,
                    status: ActivityStatus.COMPLETED
                });
            });
            // Add new disputes
            newDisputes.forEach(dispute => {
                activities.push({
                    id: `dispute-${dispute.id}`,
                    type: ActivityType.DISPUTE_CREATED,
                    description: `New ${dispute.disputeType} dispute created`,
                    user: dispute.complainantId,
                    createdAt: dispute.createdAt,
                    severity: ActivitySeverity.INFO,
                    status: ActivityStatus.IN_PROGRESS
                });
            });
            // Add fraud detections
            fraudDetections.forEach(fraud => {
                activities.push({
                    id: `fraud-${fraud.id}`,
                    type: ActivityType.FRAUD_DETECTED,
                    description: `${fraud.fraudType} fraud detected`,
                    user: fraud.userId || undefined,
                    createdAt: fraud.detectedAt,
                    severity: ActivitySeverity.CRITICAL,
                    status: ActivityStatus.COMPLETED
                });
            });
            // Sort by timestamp and limit
            return activities
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, limit);
        }
        catch (error) {
            this.logger.error('Error getting recent activity:', error);
            return [];
        }
    }
    /**
     * Get safety trends
     */
    async getSafetyTrends() {
        try {
            const trends = [];
            // Get user registration trend (last 30 days)
            const userRegistrationTrend = await this.calculateTrend('user_registrations', 'daily', 30, async (startDate, endDate) => {
                return await this.prisma.user.count({
                    where: {
                        createdAt: { gte: startDate, lt: endDate }
                    }
                });
            });
            trends.push(userRegistrationTrend);
            // Get incident trend
            const incidentTrend = await this.calculateTrend('safety_incidents', 'daily', 30, async (startDate, endDate) => {
                return await this.prisma.safetyIncident.count({
                    where: {
                        createdAt: { gte: startDate, lt: endDate }
                    }
                });
            });
            trends.push(incidentTrend);
            // Get dispute trend
            const disputeTrend = await this.calculateTrend('disputes', 'daily', 30, async (startDate, endDate) => {
                return await this.prisma.dispute.count({
                    where: {
                        createdAt: { gte: startDate, lt: endDate }
                    }
                });
            });
            trends.push(disputeTrend);
            return trends;
        }
        catch (error) {
            this.logger.error('Error getting safety trends:', error);
            return [];
        }
    }
    /**
     * Calculate trend data
     */
    async calculateTrend(metric, timeframe, days, dataFetcher) {
        const data = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
            try {
                const value = await dataFetcher(date, nextDate);
                data.push({
                    createdAt: date,
                    value,
                    label: date.toISOString().split('T')[0]
                });
            }
            catch (error) {
                data.push({
                    createdAt: date,
                    value: 0,
                    label: date.toISOString().split('T')[0]
                });
            }
        }
        // Calculate trend direction
        const recentValues = data.slice(-7).map(d => d.value);
        const olderValues = data.slice(-14, -7).map(d => d.value);
        const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
        const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / (olderValues.length || 1);
        let trend = TrendDirection.STABLE;
        let changePercentage = 0;
        if (olderAvg > 0) {
            changePercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
            if (Math.abs(changePercentage) > 5) {
                trend = changePercentage > 0 ? TrendDirection.UP : TrendDirection.DOWN;
            }
        }
        return {
            metric,
            timeframe,
            data,
            trend,
            changePercentage: Math.round(changePercentage * 100) / 100
        };
    }
    /**
     * Get high-risk users
     */
    async getHighRiskUsers(limit = 50) {
        try {
            const riskAssessments = await this.prisma.riskAssessment.findMany({
                where: {
                    overallRisk: { in: ['high', 'critical'] }
                },
                orderBy: { riskScore: 'desc' },
                take: limit,
                include: {
                    user: {
                        include: {
                            trustProfile: true
                        }
                    }
                }
            });
            return riskAssessments.map(assessment => ({
                userId: assessment.userId,
                userName: `${assessment.user.firstName} ${assessment.user.lastName}`,
                email: assessment.user.email,
                riskScore: assessment.riskScore,
                riskLevel: assessment.overallRisk,
                riskFactors: typeof assessment.riskFactors === 'string' ? JSON.parse(assessment.riskFactors) : assessment.riskFactors,
                trustScore: assessment.user.trustProfile?.trustScore || 0,
                lastActivity: assessment.user.lastLoginAt || assessment.user.createdAt,
                accountAge: Math.floor((Date.now() - assessment.user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
                flags: typeof assessment.riskFactors === 'string' ? JSON.parse(assessment.riskFactors) : assessment.riskFactors,
                recommendations: typeof assessment.recommendations === 'string' ? [assessment.recommendations] : assessment.recommendations || []
            }));
        }
        catch (error) {
            this.logger.error('Error getting high-risk users:', error);
            return [];
        }
    }
    /**
     * Get incident summaries
     */
    async getIncidentSummaries(status, limit = 100) {
        try {
            const incidents = await this.prisma.safetyIncident.findMany({
                where: status ? { status } : undefined,
                orderBy: [
                    { severity: 'desc' },
                    { createdAt: 'desc' }
                ],
                take: limit
            });
            return incidents.map(incident => ({
                id: incident.id,
                type: incident.incidentType,
                severity: incident.severity,
                title: incident.title || `${incident.incidentType} incident`,
                description: incident.description,
                status: incident.status,
                affectedUsers: incident.affectedUsers.length,
                reportedAt: incident.timestamp,
                assignedTo: incident.investigatedBy || undefined,
                estimatedResolution: incident.estimatedResolution || undefined,
                tags: Array.isArray(incident.tags) ? incident.tags : (incident.tags ? JSON.parse(incident.tags) : [])
            }));
        }
        catch (error) {
            this.logger.error('Error getting incident summaries:', error);
            return [];
        }
    }
    /**
     * Generate compliance report
     */
    async generateComplianceReport(startDate, endDate) {
        try {
            const [dataExportRequests, dataDeletionRequests, consentWithdrawals, moderatedContent, policyViolations, appealedDecisions, suspiciousTransactions, fraudPrevented, complianceChecks] = await Promise.all([
                this.prisma.dataExportRequest.count({
                    where: { requestedBy: { gte: startDate, lte: endDate } }
                }),
                this.prisma.dataDeletionRequest.count({
                    where: { requestedBy: { gte: startDate, lte: endDate } }
                }),
                this.prisma.consentRecord.count({
                    where: {
                        withdrawnAt: { gte: startDate, lte: endDate },
                        consentGiven: false
                    }
                }),
                this.prisma.contentItem.count({
                    where: { createdAt: { gte: startDate, lte: endDate } }
                }),
                this.prisma.policyViolation.count({
                    where: { detectedAt: { gte: startDate, lte: endDate } }
                }),
                this.prisma.contentReview.count({
                    where: {
                        verifiedAt: { gte: startDate, lte: endDate },
                        decision: 'appeal'
                    }
                }),
                this.prisma.fraudDetection.count({
                    where: { detectedAt: { gte: startDate, lte: endDate } }
                }),
                this.prisma.fraudDetection.count({
                    where: {
                        detectedAt: { gte: startDate, lte: endDate },
                        actionTaken: { not: null }
                    }
                }),
                this.prisma.complianceCheck.count({
                    where: { performedAt: { gte: startDate, lte: endDate } }
                })
            ]);
            // Calculate scores and rates
            const gdprCompliance = {
                dataExportRequests,
                dataDeletionRequests,
                consentWithdrawals,
                complianceScore: 95 // Mock score - would be calculated based on response times, etc.
            };
            const contentCompliance = {
                moderatedContent,
                policyViolations,
                appealedDecisions,
                accuracyRate: moderatedContent > 0 ? ((moderatedContent - appealedDecisions) / moderatedContent) * 100 : 100
            };
            const financialCompliance = {
                suspiciousTransactions,
                fraudPrevented,
                complianceChecks,
                passRate: complianceChecks > 0 ? ((complianceChecks - suspiciousTransactions) / complianceChecks) * 100 : 100
            };
            // Generate recommendations
            const recommendations = [];
            if (gdprCompliance.complianceScore < 90) {
                recommendations.push('Improve GDPR compliance response times');
            }
            if (contentCompliance.accuracyRate < 95) {
                recommendations.push('Review content moderation accuracy');
            }
            if (financialCompliance.passRate < 98) {
                recommendations.push('Enhance financial compliance monitoring');
            }
            return {
                period: { start: startDate, end: endDate },
                gdprCompliance,
                contentCompliance,
                financialCompliance,
                recommendations
            };
        }
        catch (error) {
            this.logger.error('Error generating compliance report:', error);
            throw new Error('Failed to generate compliance report');
        }
    }
    /**
     * Execute safety action
     */
    async executeSafetyAction(action) {
        try {
            const safetyAction = await this.prisma.safetyAction.create({
                data: {
                    actionType: action.type, // Using actionType as required
                    type: action.type, // Also include type
                    targetId: action.target, // Using targetId as required
                    target: action.target, // Also include target
                    performedBy: action.executedBy, // Using performedBy as required
                    executedBy: action.executedBy, // Also include executedBy
                    reason: action.reason,
                    severity: action.severity,
                    executedAt: new Date(),
                    // expiresAt: action.expiresAt, // Field might not exist
                    // metadata: action.metadata, // Field not in schema
                    // notes: action.notes // Field not in schema
                }
            });
            // Execute the actual action
            await this.performSafetyAction(safetyAction);
            // Log the action
            await this.logActivity({
                type: this.mapActionToActivityType(action.type),
                description: `${action.type} executed on ${action.target}: ${action.reason}`,
                user: action.target,
                createdAt: new Date(),
                severity: this.mapActionSeverityToActivitySeverity(action.severity),
                status: ActivityStatus.COMPLETED,
                details: { actionId: safetyAction.id, reason: action.reason }
            });
            this.logger.info(`Safety action executed: ${action.type} on ${action.target}`);
            return safetyAction;
        }
        catch (error) {
            this.logger.error('Error executing safety action:', error);
            throw new Error('Failed to execute safety action');
        }
    }
    /**
     * Perform the actual safety action
     */
    async performSafetyAction(action) {
        switch (action.type) {
            case ActionType.SUSPEND_USER:
                await this.prisma.user.update({
                    where: { id: action.target },
                    data: {
                        isSuspended: true,
                        suspendedAt: new Date(),
                        // suspensionEnd: action.expiresAt, // Field might not exist
                        // suspensionReason: action.reason // Field not in schema
                    }
                });
                break;
            case ActionType.BAN_USER:
                await this.prisma.user.update({
                    where: { id: action.target },
                    data: {
                        isBanned: true,
                        bannedAt: new Date(),
                        // bannedReason: action.reason // Field might not exist
                    }
                });
                break;
            case ActionType.REMOVE_CONTENT:
                await this.prisma.contentItem.update({
                    where: { id: action.target },
                    data: {
                        status: 'rejected',
                        isRemoved: true,
                        // moderatedBy: action.executedBy // Field might not exist
                    }
                });
                break;
            case ActionType.BLOCK_IP:
                await this.prisma.blockedIP.create({
                    data: {
                        ipAddress: action.target,
                        reason: action.reason,
                        blockedBy: action.executedBy,
                        blockedAt: new Date(),
                        expiresAt: action.expiresAt,
                        isActive: true
                    }
                });
                break;
            case ActionType.FREEZE_ACCOUNT:
                await this.prisma.user.update({
                    where: { id: action.target },
                    data: {
                        isFrozen: true,
                        frozenAt: new Date(),
                        // frozenReason: action.reason // Field might not exist
                    }
                });
                break;
        }
    }
    /**
     * Log activity
     */
    async logActivity(activity) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    type: activity.type,
                    action: activity.type, // Required field
                    details: JSON.stringify(activity.details || {}), // Required field
                    userId: activity.user,
                    createdAt: activity.createdAt,
                    metadata: activity.details
                }
            });
        }
        catch (error) {
            this.logger.error('Error logging activity:', error);
        }
    }
    /**
     * Map action type to activity type
     */
    mapActionToActivityType(actionType) {
        switch (actionType) {
            case ActionType.SUSPEND_USER:
                return ActivityType.USER_SUSPENDED;
            case ActionType.BAN_USER:
                return ActivityType.USER_BANNED;
            case ActionType.REMOVE_CONTENT:
                return ActivityType.CONTENT_REMOVED;
            default:
                return ActivityType.USER_SUSPENDED; // Default fallback
        }
    }
    /**
     * Map action severity to activity severity
     */
    mapActionSeverityToActivitySeverity(actionSeverity) {
        switch (actionSeverity) {
            case ActionSeverity.MINOR:
                return ActivitySeverity.INFO;
            case ActionSeverity.MODERATE:
                return ActivitySeverity.WARNING;
            case ActionSeverity.SEVERE:
                return ActivitySeverity.ERROR;
            case ActionSeverity.CRITICAL:
                return ActivitySeverity.CRITICAL;
            default:
                return ActivitySeverity.INFO;
        }
    }
    /**
     * Create safety alert
     */
    async createSafetyAlert(alert) {
        try {
            const safetyAlert = await this.prisma.safetyAlert.create({
                data: {
                    alertType: alert.type, // Using alertType as required
                    type: alert.type, // Also including type
                    message: alert.description, // Using message instead of description 
                    title: alert.title || 'Safety Alert',
                    userId: alert.assignedTo || '',
                    severity: alert.severity,
                    source: alert.source,
                    affectedCount: alert.affectedCount,
                    metadata: alert.metadata,
                    createdAt: new Date()
                }
            });
            this.logger.info(`Safety alert created: ${alert.type} - ${alert.severity}`);
            return safetyAlert;
        }
        catch (error) {
            this.logger.error('Error creating safety alert:', error);
            throw new Error('Failed to create safety alert');
        }
    }
    /**
     * Update alert status
     */
    async updateAlertStatus(alertId, status, assignedTo) {
        try {
            await this.prisma.safetyAlert.update({
                where: { id: alertId },
                data: {
                    status,
                    assignedTo,
                    updatedAt: new Date()
                }
            });
            this.logger.info(`Safety alert ${alertId} status updated to: ${status}`);
        }
        catch (error) {
            this.logger.error('Error updating alert status:', error);
            throw new Error('Failed to update alert status');
        }
    }
    /**
     * Get safety statistics for a specific period
     */
    async getSafetyStatistics(startDate, endDate) {
        try {
            const [metrics, trends] = await Promise.all([
                this.getSafetyMetrics(),
                this.getSafetyTrends()
            ]);
            return {
                userSafety: metrics.userSafety,
                contentSafety: metrics.contentSafety,
                transactionSafety: metrics.transactionSafety,
                systemSecurity: metrics.systemSecurity,
                trends
            };
        }
        catch (error) {
            this.logger.error('Error getting safety statistics:', error);
            throw new Error('Failed to get safety statistics');
        }
    }
}
exports.AdminSafetyDashboardService = AdminSafetyDashboardService;
//# sourceMappingURL=adminSafetyDashboardService.js.map