import { PrismaClient } from '@prisma/client';
import { Logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
interface SecurityAudit {
    id?: string;
    auditType: AuditType;
    targetSystem: string;
    severity: SecuritySeverity;
    securityFindings: SecurityFinding[];
    status: AuditStatus;
    conductedBy: string;
    completedAt?: Date;
    report?: string;
    recommendations: string[];
}
interface SecurityFinding {
    id?: string;
    auditId: string;
    category: FindingCategory;
    severity: SecuritySeverity;
    title: string;
    description: string;
    location: string;
    evidence?: string[];
    recommendation: string;
    status: FindingStatus;
    assignedTo?: string;
    resolvedAt?: Date;
}
interface VulnerabilityAssessment {
    id?: string;
    target: string;
    assessmentType: AssessmentType;
    severity: SecuritySeverity;
    cvssScore?: number;
    cveId?: string;
    title: string;
    description: string;
    impact: string;
    solution: string;
    status: VulnerabilityStatus;
    discoveredAt: Date;
    patchedAt?: Date;
    verifiedAt?: Date;
}
interface SecurityIncident {
    id?: string;
    incidentType: IncidentType;
    severity: SecuritySeverity;
    title: string;
    description: string;
    affectedSystems: string[];
    detectedAt: Date;
    reportedBy: string;
    status: IncidentStatus;
    assignedTo?: string;
    resolvedAt?: Date;
    rootCause?: string;
    remediation?: string;
    preventiveMeasures?: string[];
}
interface AccessControl {
    id?: string;
    userId: string;
    resource: string;
    action: string;
    permission: Permission;
    grantedBy: string;
    grantedAt: Date;
    expiresAt?: Date;
    conditions?: any;
    isActive: boolean;
}
interface SecurityLog {
    id?: string;
    eventType: SecurityEventType;
    userId?: string;
    ipAddress: string;
    userAgent?: string;
    resource: string;
    action: string;
    success: boolean;
    details: any;
    createdAt: Date;
    riskScore?: number;
    blocked?: boolean;
}
interface RateLimitRule {
    id?: string;
    name: string;
    endpoint: string;
    method: string;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    keyGenerator?: string;
    isActive: boolean;
    createdAt: Date;
}
interface SecurityMetrics {
    id?: string;
    metricType: MetricType;
    value: number;
    createdAt: Date;
    metadata?: any;
}
declare enum AuditType {
    SECURITY = "security",
    COMPLIANCE = "compliance",
    PENETRATION = "penetration",
    CODE_REVIEW = "code_review",
    INFRASTRUCTURE = "infrastructure"
}
declare enum SecuritySeverity {
    CRITICAL = "critical",
    HIGH = "high",
    MEDIUM = "medium",
    LOW = "low",
    INFO = "info"
}
declare enum AuditStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
declare enum FindingCategory {
    AUTHENTICATION = "authentication",
    AUTHORIZATION = "authorization",
    INPUT_VALIDATION = "input_validation",
    DATA_PROTECTION = "data_protection",
    CRYPTOGRAPHY = "cryptography",
    SESSION_MANAGEMENT = "session_management",
    ERROR_HANDLING = "error_handling",
    LOGGING = "logging",
    CONFIGURATION = "configuration",
    NETWORK_SECURITY = "network_security"
}
declare enum FindingStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    ACCEPTED_RISK = "accepted_risk",
    FALSE_POSITIVE = "false_positive"
}
declare enum AssessmentType {
    AUTOMATED = "automated",
    MANUAL = "manual",
    HYBRID = "hybrid"
}
declare enum VulnerabilityStatus {
    OPEN = "open",
    ACKNOWLEDGED = "acknowledged",
    IN_PROGRESS = "in_progress",
    PATCHED = "patched",
    VERIFIED = "verified",
    CLOSED = "closed"
}
declare enum IncidentType {
    UNAUTHORIZED_ACCESS = "unauthorized_access",
    DATA_BREACH = "data_breach",
    MALWARE = "malware",
    DDOS = "ddos",
    PHISHING = "phishing",
    INSIDER_THREAT = "insider_threat",
    SYSTEM_COMPROMISE = "system_compromise"
}
declare enum IncidentStatus {
    DETECTED = "detected",
    INVESTIGATING = "investigating",
    CONTAINED = "contained",
    ERADICATED = "eradicated",
    RECOVERED = "recovered",
    CLOSED = "closed"
}
declare enum Permission {
    ALLOW = "allow",
    DENY = "deny",
    CONDITIONAL = "conditional"
}
declare enum SecurityEventType {
    LOGIN_ATTEMPT = "login_attempt",
    LOGIN_SUCCESS = "login_success",
    LOGIN_FAILURE = "login_failure",
    PASSWORD_CHANGE = "password_change",
    PERMISSION_CHANGE = "permission_change",
    DATA_ACCESS = "data_access",
    API_CALL = "api_call",
    SUSPICIOUS_ACTIVITY = "suspicious_activity",
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
}
declare enum MetricType {
    FAILED_LOGINS = "failed_logins",
    BLOCKED_REQUESTS = "blocked_requests",
    VULNERABILITY_COUNT = "vulnerability_count",
    INCIDENT_COUNT = "incident_count",
    RESPONSE_TIME = "response_time",
    UPTIME = "uptime"
}
export declare class PlatformSecurityService {
    private prisma;
    private logger;
    private rateLimiters;
    constructor(prisma: PrismaClient, logger: Logger);
    /**
     * Create security audit
     */
    createSecurityAudit(audit: Omit<SecurityAudit, 'id' | 'conductedAt' | 'status'>): Promise<SecurityAudit>;
    /**
     * Add security finding
     */
    addSecurityFinding(finding: Omit<SecurityFinding, 'id' | 'status'>): Promise<SecurityFinding>;
    /**
     * Update audit progress
     */
    private updateAuditProgress;
    /**
     * Create vulnerability assessment
     */
    createVulnerabilityAssessment(vulnerability: Omit<VulnerabilityAssessment, 'id' | 'discoveredAt' | 'lastScanned' | 'status'>): Promise<VulnerabilityAssessment>;
    /**
     * Escalate critical vulnerability
     */
    private escalateCriticalVulnerability;
    /**
     * Create security incident
     */
    createSecurityIncident(incident: Omit<SecurityIncident, 'id'>): Promise<SecurityIncident>;
    /**
     * Log security event
     */
    logSecurityEvent(event: Omit<SecurityLog, 'id' | 'timestamp'>): Promise<SecurityLog>;
    /**
     * Calculate risk score for security event
     */
    private calculateRiskScore;
    /**
     * Analyze security patterns
     */
    private analyzeSecurityPattern;
    /**
     * Block IP address
     */
    blockIPAddress(ipAddress: string, reason: string, durationSeconds: number): Promise<void>;
    /**
     * Check if IP is blocked
     */
    isIPBlocked(ipAddress: string): Promise<boolean>;
    /**
     * Create rate limiter middleware
     */
    createRateLimiter(rule: RateLimitRule): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Manage access control
     */
    grantAccess(access: Omit<AccessControl, 'id' | 'grantedAt' | 'isActive'>): Promise<AccessControl>;
    /**
     * Check access permission
     */
    checkAccess(userId: string, resource: string, action: string): Promise<boolean>;
    /**
     * Get security metrics
     */
    getSecurityMetrics(startDate: Date, endDate: Date): Promise<{
        failedLogins: number;
        blockedRequests: number;
        vulnerabilities: {
            [key: string]: number;
        };
        incidents: {
            [key: string]: number;
        };
        topThreats: string[];
    }>;
    /**
     * Run security scan
     */
    runSecurityScan(target: string, scanType?: AssessmentType): Promise<string>;
    /**
     * Generate security report
     */
    generateSecurityReport(startDate: Date, endDate: Date): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        summary: any;
        vulnerabilities: VulnerabilityAssessment[];
        incidents: SecurityIncident[];
        recommendations: string[];
    }>;
    /**
     * Cleanup expired blocks and logs
     */
    cleanupSecurityData(): Promise<{
        blocksRemoved: number;
        logsArchived: number;
    }>;
    /**
     * Get security audits with filters
     */
    getSecurityAudits(options: {
        page: number;
        limit: number;
        filters?: {
            type?: string;
            status?: string;
        };
    }): Promise<{
        audits: SecurityAudit[];
        total: number;
        page: number;
        limit: number;
    }>;
    /**
     * Get security incidents with filters
     */
    getSecurityIncidents(options: {
        page: number;
        limit: number;
        filters?: {
            type?: string;
            severity?: string;
        };
    }): Promise<{
        incidents: SecurityIncident[];
        total: number;
        page: number;
        limit: number;
    }>;
    /**
     * Report security incident
     */
    reportSecurityIncident(incidentData: {
        incidentType: string;
        title: string;
        description: string;
        severity: string;
        affectedSystems?: string[];
        reportedBy?: string;
    }): Promise<SecurityIncident>;
}
export { AuditType, SecuritySeverity, AuditStatus, FindingCategory, FindingStatus, AssessmentType, VulnerabilityStatus, IncidentType, IncidentStatus, Permission, SecurityEventType, MetricType };
export type { SecurityAudit, SecurityFinding, VulnerabilityAssessment, SecurityIncident, AccessControl, SecurityLog, RateLimitRule, SecurityMetrics };
//# sourceMappingURL=platformSecurityService.d.ts.map