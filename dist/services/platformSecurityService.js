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
exports.MetricType = exports.SecurityEventType = exports.Permission = exports.IncidentStatus = exports.IncidentType = exports.VulnerabilityStatus = exports.AssessmentType = exports.FindingStatus = exports.FindingCategory = exports.AuditStatus = exports.SecuritySeverity = exports.AuditType = exports.PlatformSecurityService = void 0;
const rateLimit = __importStar(require("express-rate-limit"));
var AuditType;
(function (AuditType) {
    AuditType["SECURITY"] = "security";
    AuditType["COMPLIANCE"] = "compliance";
    AuditType["PENETRATION"] = "penetration";
    AuditType["CODE_REVIEW"] = "code_review";
    AuditType["INFRASTRUCTURE"] = "infrastructure";
})(AuditType || (exports.AuditType = AuditType = {}));
var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["CRITICAL"] = "critical";
    SecuritySeverity["HIGH"] = "high";
    SecuritySeverity["MEDIUM"] = "medium";
    SecuritySeverity["LOW"] = "low";
    SecuritySeverity["INFO"] = "info";
})(SecuritySeverity || (exports.SecuritySeverity = SecuritySeverity = {}));
var AuditStatus;
(function (AuditStatus) {
    AuditStatus["PLANNED"] = "planned";
    AuditStatus["IN_PROGRESS"] = "in_progress";
    AuditStatus["COMPLETED"] = "completed";
    AuditStatus["CANCELLED"] = "cancelled";
})(AuditStatus || (exports.AuditStatus = AuditStatus = {}));
var FindingCategory;
(function (FindingCategory) {
    FindingCategory["AUTHENTICATION"] = "authentication";
    FindingCategory["AUTHORIZATION"] = "authorization";
    FindingCategory["INPUT_VALIDATION"] = "input_validation";
    FindingCategory["DATA_PROTECTION"] = "data_protection";
    FindingCategory["CRYPTOGRAPHY"] = "cryptography";
    FindingCategory["SESSION_MANAGEMENT"] = "session_management";
    FindingCategory["ERROR_HANDLING"] = "error_handling";
    FindingCategory["LOGGING"] = "logging";
    FindingCategory["CONFIGURATION"] = "configuration";
    FindingCategory["NETWORK_SECURITY"] = "network_security";
})(FindingCategory || (exports.FindingCategory = FindingCategory = {}));
var FindingStatus;
(function (FindingStatus) {
    FindingStatus["OPEN"] = "open";
    FindingStatus["IN_PROGRESS"] = "in_progress";
    FindingStatus["RESOLVED"] = "resolved";
    FindingStatus["ACCEPTED_RISK"] = "accepted_risk";
    FindingStatus["FALSE_POSITIVE"] = "false_positive";
})(FindingStatus || (exports.FindingStatus = FindingStatus = {}));
var AssessmentType;
(function (AssessmentType) {
    AssessmentType["AUTOMATED"] = "automated";
    AssessmentType["MANUAL"] = "manual";
    AssessmentType["HYBRID"] = "hybrid";
})(AssessmentType || (exports.AssessmentType = AssessmentType = {}));
var VulnerabilityStatus;
(function (VulnerabilityStatus) {
    VulnerabilityStatus["OPEN"] = "open";
    VulnerabilityStatus["ACKNOWLEDGED"] = "acknowledged";
    VulnerabilityStatus["IN_PROGRESS"] = "in_progress";
    VulnerabilityStatus["PATCHED"] = "patched";
    VulnerabilityStatus["VERIFIED"] = "verified";
    VulnerabilityStatus["CLOSED"] = "closed";
})(VulnerabilityStatus || (exports.VulnerabilityStatus = VulnerabilityStatus = {}));
var IncidentType;
(function (IncidentType) {
    IncidentType["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
    IncidentType["DATA_BREACH"] = "data_breach";
    IncidentType["MALWARE"] = "malware";
    IncidentType["DDOS"] = "ddos";
    IncidentType["PHISHING"] = "phishing";
    IncidentType["INSIDER_THREAT"] = "insider_threat";
    IncidentType["SYSTEM_COMPROMISE"] = "system_compromise";
})(IncidentType || (exports.IncidentType = IncidentType = {}));
var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["DETECTED"] = "detected";
    IncidentStatus["INVESTIGATING"] = "investigating";
    IncidentStatus["CONTAINED"] = "contained";
    IncidentStatus["ERADICATED"] = "eradicated";
    IncidentStatus["RECOVERED"] = "recovered";
    IncidentStatus["CLOSED"] = "closed";
})(IncidentStatus || (exports.IncidentStatus = IncidentStatus = {}));
var Permission;
(function (Permission) {
    Permission["ALLOW"] = "allow";
    Permission["DENY"] = "deny";
    Permission["CONDITIONAL"] = "conditional";
})(Permission || (exports.Permission = Permission = {}));
var SecurityEventType;
(function (SecurityEventType) {
    SecurityEventType["LOGIN_ATTEMPT"] = "login_attempt";
    SecurityEventType["LOGIN_SUCCESS"] = "login_success";
    SecurityEventType["LOGIN_FAILURE"] = "login_failure";
    SecurityEventType["PASSWORD_CHANGE"] = "password_change";
    SecurityEventType["PERMISSION_CHANGE"] = "permission_change";
    SecurityEventType["DATA_ACCESS"] = "data_access";
    SecurityEventType["API_CALL"] = "api_call";
    SecurityEventType["SUSPICIOUS_ACTIVITY"] = "suspicious_activity";
    SecurityEventType["RATE_LIMIT_EXCEEDED"] = "rate_limit_exceeded";
})(SecurityEventType || (exports.SecurityEventType = SecurityEventType = {}));
var MetricType;
(function (MetricType) {
    MetricType["FAILED_LOGINS"] = "failed_logins";
    MetricType["BLOCKED_REQUESTS"] = "blocked_requests";
    MetricType["VULNERABILITY_COUNT"] = "vulnerability_count";
    MetricType["INCIDENT_COUNT"] = "incident_count";
    MetricType["RESPONSE_TIME"] = "response_time";
    MetricType["UPTIME"] = "uptime";
})(MetricType || (exports.MetricType = MetricType = {}));
class PlatformSecurityService {
    constructor(prisma, logger) {
        this.rateLimiters = new Map();
        this.prisma = prisma;
        this.logger = logger;
    }
    /**
     * Create security audit
     */
    async createSecurityAudit(audit) {
        try {
            const securityAudit = await this.prisma.securityAudit.create({
                data: {
                    category: audit.auditType,
                    description: 'Security audit', // Required field - using default since property doesn't exist
                    auditType: audit.auditType,
                    targetSystem: audit.targetSystem,
                    conductedBy: audit.conductedBy,
                    severity: audit.severity,
                    findings: JSON.stringify(audit.securityFindings || []),
                    recommendations: JSON.stringify(audit.recommendations || []),
                    // report: audit.report, // Field not in schema
                    completedAt: new Date(),
                    status: AuditStatus.PLANNED
                }
            });
            this.logger.info(`Security audit created: ${audit.auditType} - ${audit.targetSystem}`);
            return { ...securityAudit, securityFindings: JSON.parse(securityAudit.findings || '[]'), recommendations: JSON.parse(securityAudit.recommendations || '[]') };
        }
        catch (error) {
            this.logger.error('Error creating security audit:', error);
            throw new Error('Failed to create security audit');
        }
    }
    /**
     * Add security finding
     */
    async addSecurityFinding(finding) {
        try {
            const securityFinding = await this.prisma.securityFinding.create({
                data: {
                    findingType: finding.category,
                    title: finding.title,
                    description: finding.description,
                    status: FindingStatus.OPEN,
                    severity: finding.severity,
                    auditId: finding.auditId,
                    evidence: JSON.stringify(finding.evidence || []),
                    assignedTo: finding.assignedTo,
                    // resolvedAt: finding.resolvedAt // Field not in schema
                }
            });
            // Update parent audit status if needed
            await this.updateAuditProgress(finding.auditId);
            this.logger.info(`Security finding added: ${finding.title} - ${finding.severity}`);
            return {
                ...securityFinding,
                category: securityFinding.findingType,
                location: securityFinding.auditId,
                recommendation: securityFinding.description,
                evidence: JSON.parse(securityFinding.evidence || '[]')
            };
        }
        catch (error) {
            this.logger.error('Error adding security finding:', error);
            throw new Error('Failed to add security finding');
        }
    }
    /**
     * Update audit progress
     */
    async updateAuditProgress(auditId) {
        const audit = await this.prisma.securityAudit.findUnique({
            where: { id: auditId },
            include: { securityFindings: true }
        });
        if (!audit)
            return;
        if (audit.status === AuditStatus.PLANNED && audit.findings && JSON.parse(audit.findings).length > 0) {
            await this.prisma.securityAudit.update({
                where: { id: auditId },
                data: { status: AuditStatus.IN_PROGRESS }
            });
        }
    }
    /**
     * Create vulnerability assessment
     */
    async createVulnerabilityAssessment(vulnerability) {
        try {
            const assessment = await this.prisma.vulnerabilityAssessment.create({
                data: {
                    title: vulnerability.title,
                    description: vulnerability.description,
                    severity: vulnerability.severity,
                    affectedSystems: JSON.stringify([]), // Required field - using empty array since property doesn't exist
                    cveId: vulnerability.cveId,
                    cvssScore: vulnerability.cvssScore,
                    // exploitAvailable: vulnerability.exploitAvailable, // Field not in schema
                    // patchAvailable: vulnerability.patchAvailable, // Field not in schema
                    discoveredAt: new Date(),
                    resolvedAt: null,
                    status: VulnerabilityStatus.OPEN
                }
            });
            // Auto-escalate critical vulnerabilities
            if (vulnerability.severity === SecuritySeverity.CRITICAL) {
                await this.escalateCriticalVulnerability(assessment.id);
            }
            this.logger.info(`Vulnerability assessment created: ${vulnerability.title} - ${vulnerability.severity}`);
            return { ...assessment, target: assessment.title, assessmentType: 'automated', impact: assessment.severity, solution: assessment.description };
        }
        catch (error) {
            this.logger.error('Error creating vulnerability assessment:', error);
            throw new Error('Failed to create vulnerability assessment');
        }
    }
    /**
     * Escalate critical vulnerability
     */
    async escalateCriticalVulnerability(vulnerabilityId) {
        try {
            const vulnerability = await this.prisma.vulnerabilityAssessment.findUnique({
                where: { id: vulnerabilityId }
            });
            if (!vulnerability)
                return;
            // Create security incident
            await this.createSecurityIncident({
                incidentType: IncidentType.SYSTEM_COMPROMISE,
                severity: SecuritySeverity.CRITICAL,
                title: `Critical Vulnerability: ${vulnerability.title}`,
                description: vulnerability.description,
                affectedSystems: [vulnerability.title], // Use title instead of targetUrl
                detectedAt: new Date(),
                reportedBy: 'automated_scanner',
                status: IncidentStatus.DETECTED
            });
            // Send immediate alerts
            // await this.sendSecurityAlert(vulnerability);
            this.logger.critical(`Critical vulnerability escalated: ${vulnerabilityId}`);
        }
        catch (error) {
            this.logger.error('Error escalating critical vulnerability:', error);
        }
    }
    /**
     * Create security incident
     */
    async createSecurityIncident(incident) {
        try {
            const securityIncident = await this.prisma.securityIncident.create({
                data: {
                    incidentType: incident.incidentType,
                    severity: incident.severity,
                    title: incident.title,
                    description: incident.description,
                    affectedSystems: JSON.stringify(incident.affectedSystems),
                    detectedAt: incident.detectedAt,
                    reportedBy: incident.reportedBy,
                    status: incident.status
                }
            });
            // Auto-assign to security team if critical
            if (incident.severity === SecuritySeverity.CRITICAL) {
                // await this.assignToSecurityTeam(securityIncident.id);
            }
            this.logger.info(`Security incident created: ${incident.title} - ${incident.severity}`);
            return { ...securityIncident, affectedSystems: JSON.parse(securityIncident.affectedSystems || '[]') };
        }
        catch (error) {
            this.logger.error('Error creating security incident:', error);
            throw new Error('Failed to create security incident');
        }
    }
    /**
     * Log security event
     */
    async logSecurityEvent(event) {
        try {
            // Calculate risk score based on event details
            const riskScore = this.calculateRiskScore(event);
            const securityLog = await this.prisma.securityLog.create({
                data: {
                    ...event,
                    riskScore,
                    createdAt: new Date()
                }
            });
            // Check for suspicious patterns
            if (riskScore > 70) {
                await this.analyzeSecurityPattern(event.userId, event.ipAddress, event.eventType);
            }
            return securityLog;
        }
        catch (error) {
            this.logger.error('Error logging security event:', error);
            throw new Error('Failed to log security event');
        }
    }
    /**
     * Calculate risk score for security event
     */
    calculateRiskScore(event) {
        let score = 0;
        // Base score for event type
        switch (event.eventType) {
            case SecurityEventType.LOGIN_FAILURE:
                score += 20;
                break;
            case SecurityEventType.SUSPICIOUS_ACTIVITY:
                score += 60;
                break;
            case SecurityEventType.RATE_LIMIT_EXCEEDED:
                score += 40;
                break;
            case SecurityEventType.PERMISSION_CHANGE:
                score += 30;
                break;
            default:
                score += 10;
        }
        // Increase score for failures
        if (!event.success) {
            score += 20;
        }
        // Check for unusual patterns in details
        if (event.details) {
            if (event.details.multipleFailures)
                score += 30;
            if (event.details.unusualLocation)
                score += 25;
            if (event.details.suspiciousUserAgent)
                score += 15;
        }
        return Math.min(100, score);
    }
    /**
     * Analyze security patterns
     */
    async analyzeSecurityPattern(userId, ipAddress, eventType) {
        try {
            // Look for patterns in the last hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const recentEvents = await this.prisma.securityLog.findMany({
                where: {
                    OR: [
                        { userId },
                        { ipAddress }
                    ],
                    createdAt: { gte: oneHourAgo },
                    riskScore: { gte: 50 }
                }
            });
            if (recentEvents.length >= 5) {
                // Create security incident for suspicious pattern
                await this.createSecurityIncident({
                    incidentType: IncidentType.INSIDER_THREAT, // Using closest available enum value
                    severity: SecuritySeverity.HIGH,
                    title: 'Suspicious Activity Pattern Detected',
                    description: `Multiple high-risk events detected from ${userId ? 'user ' + userId : 'unknown user'} at IP ${ipAddress}`,
                    affectedSystems: ['authentication', 'api'],
                    detectedAt: new Date(),
                    reportedBy: 'automated_detection',
                    status: IncidentStatus.DETECTED
                });
                // Temporarily block IP if too many failures
                if (eventType === SecurityEventType.LOGIN_FAILURE && recentEvents.length >= 10) {
                    await this.blockIPAddress(ipAddress, 'Multiple failed login attempts', 3600); // 1 hour block
                }
            }
        }
        catch (error) {
            this.logger.error('Error analyzing security pattern:', error);
        }
    }
    /**
     * Block IP address
     */
    async blockIPAddress(ipAddress, reason, durationSeconds) {
        try {
            const expiresAt = new Date(Date.now() + (durationSeconds * 1000));
            await this.prisma.blockedIP.create({
                data: {
                    ipAddress,
                    reason,
                    blockedBy: 'system',
                    blockedAt: new Date(),
                    expiresAt,
                    isActive: true
                }
            });
            this.logger.warn(`IP address flagged: ${ipAddress} - ${reason}`);
        }
        catch (error) {
            this.logger.error('Error blocking IP address:', error);
        }
    }
    /**
     * Check if IP is blocked
     */
    async isIPBlocked(ipAddress) {
        try {
            const blocked = await this.prisma.blockedIP.findFirst({
                where: {
                    ipAddress,
                    isActive: true,
                    expiresAt: { gt: new Date() }
                }
            });
            return !!blocked;
        }
        catch (error) {
            this.logger.error('Error checking IP block status:', error);
            return false;
        }
    }
    /**
     * Create rate limiter middleware
     */
    createRateLimiter(rule) {
        const limiter = rateLimit.rateLimit({
            windowMs: rule.windowMs,
            max: rule.maxRequests,
            skipSuccessfulRequests: rule.skipSuccessfulRequests || false,
            skipFailedRequests: rule.skipFailedRequests || false,
            keyGenerator: (req) => {
                // Default to IP address, can be customized
                return req.ip || 'unknown';
            },
            handler: async (req, res) => {
                // Log rate limit exceeded
                await this.logSecurityEvent({
                    eventType: SecurityEventType.RATE_LIMIT_EXCEEDED,
                    userId: req.user?.id,
                    ipAddress: req.ip || 'unknown',
                    userAgent: req.get('User-Agent'),
                    resource: req.path,
                    action: req.method,
                    success: false,
                    createdAt: new Date(),
                    details: {
                        rule: rule.name,
                        limit: rule.maxRequests,
                        window: rule.windowMs
                    }
                });
                res.status(429).json({
                    error: 'Too many requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter: Math.ceil(rule.windowMs / 1000)
                });
            }
        });
        this.rateLimiters.set(rule.name, limiter);
        return limiter;
    }
    /**
     * Manage access control
     */
    async grantAccess(access) {
        try {
            const accessControl = await this.prisma.accessControl.create({
                data: {
                    ...access,
                    grantedAt: new Date(),
                    isActive: true
                }
            });
            this.logger.info(`Access granted: ${access.userId} - ${access.resource}:${access.action}`);
            return accessControl;
        }
        catch (error) {
            this.logger.error('Error granting access:', error);
            throw new Error('Failed to grant access');
        }
    }
    /**
     * Check access permission
     */
    async checkAccess(userId, resource, action) {
        try {
            const access = await this.prisma.accessControl.findFirst({
                where: {
                    userId,
                    resource,
                    action,
                    isActive: true,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } }
                    ]
                }
            });
            const hasAccess = access?.permission === Permission.ALLOW;
            // Log access check
            await this.logSecurityEvent({
                eventType: SecurityEventType.DATA_ACCESS,
                userId,
                ipAddress: 'system', // Would be actual IP in middleware
                resource,
                action,
                success: hasAccess,
                createdAt: new Date(),
                details: { permission: access?.permission || 'none' }
            });
            return hasAccess;
        }
        catch (error) {
            this.logger.error('Error checking access:', error);
            return false;
        }
    }
    /**
     * Get security metrics
     */
    async getSecurityMetrics(startDate, endDate) {
        try {
            const [failedLogins, blockedRequests, vulnerabilities, incidents] = await Promise.all([
                this.prisma.securityLog.count({
                    where: {
                        eventType: SecurityEventType.LOGIN_FAILURE,
                        createdAt: { gte: startDate, lte: endDate }
                    }
                }),
                this.prisma.securityLog.count({
                    where: {
                        flagged: true,
                        createdAt: { gte: startDate, lte: endDate }
                    }
                }),
                this.prisma.vulnerabilityAssessment.groupBy({
                    by: ['severity'],
                    where: {
                        discoveredAt: { gte: startDate, lte: endDate }
                    },
                    _count: true
                }),
                this.prisma.securityIncident.groupBy({
                    by: ['incidentType'],
                    where: {
                        detectedAt: { gte: startDate, lte: endDate }
                    },
                    _count: true
                })
            ]);
            const vulnerabilityMap = vulnerabilities.reduce((acc, v) => {
                acc[v.severity] = v._count;
                return acc;
            }, {});
            const incidentMap = incidents.reduce((acc, i) => {
                acc[i.incidentType] = i._count;
                return acc;
            }, {});
            // Get top threats (most common incident types)
            const topThreats = Object.entries(incidentMap)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([type]) => type);
            return {
                failedLogins,
                blockedRequests,
                vulnerabilities: vulnerabilityMap,
                incidents: incidentMap,
                topThreats
            };
        }
        catch (error) {
            this.logger.error('Error getting security metrics:', error);
            throw new Error('Failed to get security metrics');
        }
    }
    /**
     * Run security scan
     */
    async runSecurityScan(target, scanType = AssessmentType.AUTOMATED) {
        try {
            // Create scan job
            const scanJob = await this.prisma.securityScan.create({
                data: {
                    target,
                    scanType,
                    status: 'running',
                    startedAt: new Date()
                }
            });
            // Simulate security scan (in production, would integrate with actual security tools)
            setTimeout(async () => {
                const mockVulnerabilities = [
                    {
                        title: 'SQL Injection Vulnerability',
                        description: 'Potential SQL injection in user input validation',
                        severity: SecuritySeverity.HIGH,
                        cvssScore: 7.5
                    },
                    {
                        title: 'Cross-Site Scripting (XSS)',
                        description: 'Reflected XSS vulnerability in search parameter',
                        severity: SecuritySeverity.MEDIUM,
                        cvssScore: 5.4
                    }
                ];
                for (const vuln of mockVulnerabilities) {
                    await this.createVulnerabilityAssessment({
                        target: target,
                        assessmentType: scanType,
                        severity: vuln.severity,
                        cvssScore: vuln.cvssScore,
                        title: vuln.title,
                        description: vuln.description,
                        impact: 'Potential data compromise',
                        solution: 'Implement proper input validation and sanitization'
                    });
                }
                await this.prisma.securityScan.update({
                    where: { id: scanJob.id },
                    data: {
                        status: 'completed',
                        completedAt: new Date(),
                        findings: JSON.stringify(mockVulnerabilities)
                    }
                });
                this.logger.info(`Security scan completed: ${scanJob.id}`);
            }, 30000); // 30 seconds simulation
            return scanJob.id;
        }
        catch (error) {
            this.logger.error('Error running security scan:', error);
            throw new Error('Failed to run security scan');
        }
    }
    /**
     * Generate security report
     */
    async generateSecurityReport(startDate, endDate) {
        try {
            const [metrics, vulnerabilities, incidents] = await Promise.all([
                this.getSecurityMetrics(startDate, endDate),
                this.prisma.vulnerabilityAssessment.findMany({
                    where: {
                        discoveredAt: { gte: startDate, lte: endDate }
                    },
                    orderBy: { severity: 'desc' }
                }),
                this.prisma.securityIncident.findMany({
                    where: {
                        detectedAt: { gte: startDate, lte: endDate }
                    },
                    orderBy: { severity: 'desc' }
                })
            ]);
            const recommendations = [];
            if (metrics.failedLogins > 100) {
                recommendations.push('Consider implementing stronger authentication measures');
            }
            if (vulnerabilities.some(v => v.severity === SecuritySeverity.CRITICAL)) {
                recommendations.push('Address critical vulnerabilities immediately');
            }
            if (metrics.incidents[IncidentType.UNAUTHORIZED_ACCESS] > 0) {
                recommendations.push('Review and strengthen access controls');
            }
            return {
                period: { start: startDate, end: endDate },
                summary: metrics,
                vulnerabilities: vulnerabilities.map(v => ({
                    ...v,
                    target: v.title,
                    assessmentType: 'automated',
                    impact: v.severity,
                    solution: v.description
                })),
                incidents: incidents.map(i => ({
                    ...i,
                    affectedSystems: JSON.parse(i.affectedSystems || '[]')
                })),
                recommendations
            };
        }
        catch (error) {
            this.logger.error('Error generating security report:', error);
            throw new Error('Failed to generate security report');
        }
    }
    /**
     * Cleanup expired blocks and logs
     */
    async cleanupSecurityData() {
        try {
            // Remove expired IP blocks
            const expiredBlocks = await this.prisma.blockedIP.updateMany({
                where: {
                    expiresAt: { lt: new Date() },
                    isActive: true
                },
                data: { isActive: false }
            });
            // Archive old security logs (older than 90 days)
            const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            const oldLogs = await this.prisma.securityLog.count({
                where: {
                    createdAt: { lt: ninetyDaysAgo }
                }
            });
            // In production, would move to archive storage instead of deleting
            await this.prisma.securityLog.deleteMany({
                where: {
                    createdAt: { lt: ninetyDaysAgo }
                }
            });
            this.logger.info(`Security cleanup completed: ${expiredBlocks.count} blocks, ${oldLogs} logs archived`);
            return {
                blocksRemoved: expiredBlocks.count,
                logsArchived: oldLogs
            };
        }
        catch (error) {
            this.logger.error('Error cleaning up security data:', error);
            return { blocksRemoved: 0, logsArchived: 0 };
        }
    }
    /**
     * Get security audits with filters
     */
    async getSecurityAudits(options) {
        try {
            const { page, limit, filters = {} } = options;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.type)
                where.auditType = filters.type;
            if (filters.status)
                where.status = filters.status;
            const [audits, total] = await Promise.all([
                this.prisma.securityAudit.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        securityFindings: true
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                this.prisma.securityAudit.count({ where })
            ]);
            return {
                audits: audits.map(a => ({
                    ...a,
                    recommendations: JSON.parse(a.recommendations || '[]'), // Parse JSON string to array
                    securityFindings: a.securityFindings.map(f => ({
                        ...f,
                        category: f.findingType,
                        location: f.auditId,
                        recommendation: f.description,
                        evidence: JSON.parse(f.evidence || '[]')
                    }))
                })),
                total,
                page,
                limit
            };
        }
        catch (error) {
            this.logger.error('Error getting security audits:', error);
            throw new Error('Failed to get security audits');
        }
    }
    /**
     * Get security incidents with filters
     */
    async getSecurityIncidents(options) {
        try {
            const { page, limit, filters = {} } = options;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.type)
                where.incidentType = filters.type;
            if (filters.severity)
                where.severity = filters.severity;
            const [incidents, total] = await Promise.all([
                this.prisma.securityIncident.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { detectedAt: 'desc' }
                }),
                this.prisma.securityIncident.count({ where })
            ]);
            return {
                incidents: incidents.map(i => ({
                    ...i,
                    affectedSystems: JSON.parse(i.affectedSystems || '[]')
                })),
                total,
                page,
                limit
            };
        }
        catch (error) {
            this.logger.error('Error getting security incidents:', error);
            throw new Error('Failed to get security incidents');
        }
    }
    /**
     * Report security incident
     */
    async reportSecurityIncident(incidentData) {
        try {
            const incident = await this.createSecurityIncident({
                incidentType: incidentData.incidentType,
                title: incidentData.title,
                description: incidentData.description,
                severity: incidentData.severity,
                affectedSystems: incidentData.affectedSystems || [],
                reportedBy: incidentData.reportedBy || 'system',
                detectedAt: new Date(),
                status: IncidentStatus.DETECTED
            });
            this.logger.info(`Security incident reported: ${incident.id}`);
            return incident;
        }
        catch (error) {
            this.logger.error('Error reporting security incident:', error);
            throw new Error('Failed to report security incident');
        }
    }
}
exports.PlatformSecurityService = PlatformSecurityService;
//# sourceMappingURL=platformSecurityService.js.map