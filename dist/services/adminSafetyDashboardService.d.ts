import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
interface SafetyDashboard {
    overview: SafetyOverview;
    metrics: SafetyMetrics;
    alerts: SafetyAlert[];
    recentActivity: RecentActivity[];
    trends: SafetyTrend[];
}
interface SafetyOverview {
    totalUsers: number;
    activeIncidents: number;
    pendingReports: number;
    openDisputes: number;
    riskUsers: number;
    trustScore: {
        average: number;
        distribution: {
            [key: string]: number;
        };
    };
    complianceScore: number;
    updatedAt: Date;
}
interface SafetyMetrics {
    userSafety: {
        verifiedUsers: number;
        suspendedUsers: number;
        bannedUsers: number;
        identityVerificationRate: number;
    };
    contentSafety: {
        contentModerated: number;
        autoApprovalRate: number;
        flaggedContent: number;
        removedContent: number;
    };
    transactionSafety: {
        fraudDetected: number;
        disputeRate: number;
        paymentFailures: number;
        refundRequests: number;
    };
    systemSecurity: {
        securityIncidents: number;
        vulnerabilities: number;
        blockedIPs: number;
        failedLogins: number;
    };
}
interface SafetyAlert {
    id: string;
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    description: string;
    source: AlertSource;
    affectedCount: number;
    status: AlertStatus;
    createdAt: Date;
    assignedTo?: string;
    dueDate?: Date;
    metadata?: any;
}
interface RecentActivity {
    id: string;
    type: ActivityType;
    description: string;
    user?: string;
    createdAt: Date;
    severity: ActivitySeverity;
    status: ActivityStatus;
    details?: any;
}
interface SafetyTrend {
    metric: string;
    timeframe: string;
    data: TrendDataPoint[];
    trend: TrendDirection;
    changePercentage: number;
}
interface TrendDataPoint {
    createdAt: Date;
    value: number;
    label?: string;
}
interface UserRiskProfile {
    userId: string;
    userName: string;
    email: string;
    riskScore: number;
    riskLevel: RiskLevel;
    riskFactors: string[];
    trustScore: number;
    lastActivity: Date;
    accountAge: number;
    flags: RiskFlag[];
    recommendations: string[];
}
interface IncidentSummary {
    id: string;
    type: IncidentType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    status: IncidentStatus;
    affectedUsers: number;
    reportedAt: Date;
    assignedTo?: string;
    estimatedResolution?: Date;
    tags: string[];
}
interface ComplianceReport {
    period: {
        start: Date;
        end: Date;
    };
    gdprCompliance: {
        dataExportRequests: number;
        dataDeletionRequests: number;
        consentWithdrawals: number;
        complianceScore: number;
    };
    contentCompliance: {
        moderatedContent: number;
        policyViolations: number;
        appealedDecisions: number;
        accuracyRate: number;
    };
    financialCompliance: {
        suspiciousTransactions: number;
        fraudPrevented: number;
        complianceChecks: number;
        passRate: number;
    };
    recommendations: string[];
}
interface SafetyAction {
    id?: string;
    type: ActionType;
    target: string;
    reason: string;
    severity: ActionSeverity;
    executedBy: string;
    executedAt: Date;
    expiresAt?: Date;
    status: ActionStatus;
    metadata?: any;
    notes?: string;
}
declare enum AlertType {
    SECURITY_INCIDENT = "security_incident",
    USER_REPORT = "user_report",
    FRAUD_DETECTION = "fraud_detection",
    SYSTEM_ANOMALY = "system_anomaly",
    COMPLIANCE_VIOLATION = "compliance_violation",
    TRUST_DEGRADATION = "trust_degradation",
    CONTENT_VIOLATION = "content_violation"
}
declare enum AlertSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum AlertSource {
    AUTOMATED_SYSTEM = "automated_system",
    USER_REPORT = "user_report",
    MANUAL_DETECTION = "manual_detection",
    THIRD_PARTY = "third_party"
}
declare enum AlertStatus {
    OPEN = "open",
    INVESTIGATING = "investigating",
    RESOLVED = "resolved",
    DISMISSED = "dismissed"
}
declare enum ActivityType {
    USER_SUSPENDED = "user_suspended",
    USER_BANNED = "user_banned",
    CONTENT_REMOVED = "content_removed",
    DISPUTE_CREATED = "dispute_created",
    FRAUD_DETECTED = "fraud_detected",
    SECURITY_BREACH = "security_breach",
    POLICY_UPDATED = "policy_updated"
}
declare enum ActivitySeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
}
declare enum ActivityStatus {
    COMPLETED = "completed",
    IN_PROGRESS = "in_progress",
    FAILED = "failed",
    PENDING = "pending"
}
declare enum TrendDirection {
    UP = "up",
    DOWN = "down",
    STABLE = "stable"
}
declare enum RiskLevel {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum RiskFlag {
    MULTIPLE_ACCOUNTS = "multiple_accounts",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    HIGH_DISPUTE_RATE = "high_dispute_rate",
    POLICY_VIOLATIONS = "policy_violations",
    FAKE_REVIEWS = "fake_reviews",
    PAYMENT_ISSUES = "payment_issues"
}
declare enum IncidentType {
    FRAUD = "fraud",
    HARASSMENT = "harassment",
    DATA_BREACH = "data_breach",
    SYSTEM_ABUSE = "system_abuse",
    POLICY_VIOLATION = "policy_violation"
}
declare enum IncidentSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
declare enum IncidentStatus {
    REPORTED = "reported",
    INVESTIGATING = "investigating",
    CONTAINED = "contained",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
declare enum ActionType {
    SUSPEND_USER = "suspend_user",
    BAN_USER = "ban_user",
    REMOVE_CONTENT = "remove_content",
    BLOCK_IP = "block_ip",
    FREEZE_ACCOUNT = "freeze_account",
    REQUIRE_VERIFICATION = "require_verification",
    LIMIT_FEATURES = "limit_features"
}
declare enum ActionSeverity {
    MINOR = "minor",
    MODERATE = "moderate",
    SEVERE = "severe",
    CRITICAL = "critical"
}
declare enum ActionStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    REVOKED = "revoked",
    COMPLETED = "completed"
}
export declare class AdminSafetyDashboardService {
    private prisma;
    private logger;
    constructor(prisma: PrismaClient, logger: Logger);
    /**
     * Get comprehensive safety dashboard
     */
    getSafetyDashboard(): Promise<SafetyDashboard>;
    /**
     * Get safety overview
     */
    private getSafetyOverview;
    /**
     * Get safety metrics
     */
    private getSafetyMetrics;
    /**
     * Get active safety alerts
     */
    private getActiveAlerts;
    /**
     * Get recent safety activity
     */
    private getRecentActivity;
    /**
     * Get safety trends
     */
    private getSafetyTrends;
    /**
     * Calculate trend data
     */
    private calculateTrend;
    /**
     * Get high-risk users
     */
    getHighRiskUsers(limit?: number): Promise<UserRiskProfile[]>;
    /**
     * Get incident summaries
     */
    getIncidentSummaries(status?: IncidentStatus, limit?: number): Promise<IncidentSummary[]>;
    /**
     * Generate compliance report
     */
    generateComplianceReport(startDate: Date, endDate: Date): Promise<ComplianceReport>;
    /**
     * Execute safety action
     */
    executeSafetyAction(action: Omit<SafetyAction, 'id' | 'executedAt' | 'status'>): Promise<SafetyAction>;
    /**
     * Perform the actual safety action
     */
    private performSafetyAction;
    /**
     * Log activity
     */
    private logActivity;
    /**
     * Map action type to activity type
     */
    private mapActionToActivityType;
    /**
     * Map action severity to activity severity
     */
    private mapActionSeverityToActivitySeverity;
    /**
     * Create safety alert
     */
    createSafetyAlert(alert: Omit<SafetyAlert, 'id' | 'createdAt' | 'status'>): Promise<SafetyAlert>;
    /**
     * Update alert status
     */
    updateAlertStatus(alertId: string, status: AlertStatus, assignedTo?: string): Promise<void>;
    /**
     * Get safety statistics for a specific period
     */
    getSafetyStatistics(startDate: Date, endDate: Date): Promise<{
        userSafety: any;
        contentSafety: any;
        transactionSafety: any;
        systemSecurity: any;
        trends: any;
    }>;
}
export { AlertType, AlertSeverity, AlertSource, AlertStatus, ActivityType, ActivitySeverity, ActivityStatus, TrendDirection, RiskLevel, RiskFlag, IncidentType, IncidentSeverity, IncidentStatus, ActionType, ActionSeverity, ActionStatus };
export type { SafetyDashboard, SafetyOverview, SafetyMetrics, SafetyAlert, RecentActivity, SafetyTrend, TrendDataPoint, UserRiskProfile, IncidentSummary, ComplianceReport, SafetyAction };
//# sourceMappingURL=adminSafetyDashboardService.d.ts.map