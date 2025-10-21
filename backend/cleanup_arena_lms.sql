-- Cleanup script to remove marketplace tables accidentally added to arena_lms database
-- This will restore arena_lms to its original LMS-only state

USE arena_lms;

-- Drop marketplace-specific tables that don't belong in LMS
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS compliance_checks;
DROP TABLE IF EXISTS content_flags;
DROP TABLE IF EXISTS content_items;
DROP TABLE IF EXISTS content_moderation;
DROP TABLE IF EXISTS content_reviews;
DROP TABLE IF EXISTS content_violations;
DROP TABLE IF EXISTS dispute_evidence;
DROP TABLE IF EXISTS dispute_mediations;
DROP TABLE IF EXISTS dispute_messages;
DROP TABLE IF EXISTS dispute_resolutions;
DROP TABLE IF EXISTS fraud_detections;
DROP TABLE IF EXISTS push_subscriptions;
DROP TABLE IF EXISTS safety_actions;
DROP TABLE IF EXISTS safety_alerts;
DROP TABLE IF EXISTS safety_incidents;
DROP TABLE IF EXISTS safety_settings;
DROP TABLE IF EXISTS scheduled_notifications;
DROP TABLE IF EXISTS security_audits;
DROP TABLE IF EXISTS security_findings;
DROP TABLE IF EXISTS security_incidents;
DROP TABLE IF EXISTS security_logs;
DROP TABLE IF EXISTS security_scans;
DROP TABLE IF EXISTS user_safety_profiles;
DROP TABLE IF EXISTS user_warnings;

-- Additional marketplace tables that might have been added
DROP TABLE IF EXISTS blocked_ips;
DROP TABLE IF EXISTS vulnerability_assessments;
DROP TABLE IF EXISTS moderation_queue;
DROP TABLE IF EXISTS moderation_rules;
DROP TABLE IF EXISTS disputes;
DROP TABLE IF EXISTS user_trust_profiles;
DROP TABLE IF EXISTS verification_badges;
DROP TABLE IF EXISTS trust_metrics;
DROP TABLE IF EXISTS policy_violations;
DROP TABLE IF EXISTS risk_assessments;
DROP TABLE IF EXISTS reputation_changes;
DROP TABLE IF EXISTS identity_verifications;
DROP TABLE IF EXISTS background_checks;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS emergency_contacts;
DROP TABLE IF EXISTS meeting_guidelines;

-- Marketplace-specific relations that might have been added to existing tables
-- Note: We need to be careful here and only remove columns that were added, not existing LMS columns

SET FOREIGN_KEY_CHECKS = 1;

-- Show remaining tables to verify cleanup
SHOW TABLES;
