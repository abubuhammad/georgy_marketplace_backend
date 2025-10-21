/*
  Warnings:

  - A unique constraint covering the columns `[disputeId]` on the table `disputes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `message` to the `dispute_messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `complainantId` to the `disputes` table without a default value. This is not possible if the table is not empty.
  - The required column `disputeId` was added to the `disputes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `disputeType` to the `disputes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recipientId` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `affectedUsers` to the `safety_incidents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `security_incidents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message` to the `trust_alerts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `documentType` to the `user_consents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `user_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportType` to the `user_reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportedUserId` to the `user_reports` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_sellerId_fkey`;

-- AlterTable
ALTER TABLE `access_controls` ADD COLUMN `action` VARCHAR(191) NOT NULL DEFAULT 'read',
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `dispute_messages` ADD COLUMN `message` TEXT NOT NULL,
    ADD COLUMN `senderRole` VARCHAR(191) NULL,
    ADD COLUMN `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `disputes` ADD COLUMN `assignedMediatorId` VARCHAR(191) NULL,
    ADD COLUMN `complainantId` VARCHAR(191) NOT NULL,
    ADD COLUMN `disputeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `disputeType` VARCHAR(191) NOT NULL,
    ADD COLUMN `dueDate` DATETIME(3) NULL,
    ADD COLUMN `orderId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `legal_documents` ADD COLUMN `jurisdiction` VARCHAR(191) NOT NULL DEFAULT 'NG',
    ADD COLUMN `language` VARCHAR(191) NOT NULL DEFAULT 'en',
    ADD COLUMN `lastModified` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `modifiedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `messages` ADD COLUMN `recipientId` VARCHAR(191) NOT NULL,
    ADD COLUMN `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `moderation_queue` ADD COLUMN `contentItemId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `deliveryDate` DATETIME(3) NULL,
    ADD COLUMN `expectedDeliveryDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `brand` VARCHAR(191) NULL,
    ADD COLUMN `categoryId` VARCHAR(191) NOT NULL,
    ADD COLUMN `dynamicFields` TEXT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isNegotiable` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `locationCity` VARCHAR(191) NULL,
    ADD COLUMN `locationCountry` VARCHAR(191) NULL,
    ADD COLUMN `locationState` VARCHAR(191) NULL,
    ADD COLUMN `originalPrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `productName` VARCHAR(191) NULL,
    ADD COLUMN `rating` DECIMAL(3, 2) NULL,
    ADD COLUMN `reviewCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `subcategoryId` VARCHAR(191) NULL,
    ADD COLUMN `viewCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `category` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `location` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `safety_incidents` ADD COLUMN `affectedUsers` TEXT NOT NULL,
    ADD COLUMN `estimatedResolution` DATETIME(3) NULL,
    ADD COLUMN `investigatedBy` VARCHAR(191) NULL,
    ADD COLUMN `tags` TEXT NULL,
    ADD COLUMN `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `title` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `security_audits` ADD COLUMN `conductedAt` DATETIME(3) NULL,
    ADD COLUMN `conductedBy` VARCHAR(191) NULL,
    ADD COLUMN `targetSystem` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `security_incidents` ADD COLUMN `reportedBy` VARCHAR(191) NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `shipments` ADD COLUMN `currentLocation` TEXT NULL,
    ADD COLUMN `events` TEXT NULL;

-- AlterTable
ALTER TABLE `trust_alerts` ADD COLUMN `isResolved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `message` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `user_consents` ADD COLUMN `consentMethod` VARCHAR(191) NOT NULL DEFAULT 'explicit',
    ADD COLUMN `documentType` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user_reports` ADD COLUMN `description` TEXT NOT NULL,
    ADD COLUMN `reportType` VARCHAR(191) NOT NULL,
    ADD COLUMN `reportedUserId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user_trust_profiles` ADD COLUMN `activityScore` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `profileStrength` VARCHAR(191) NOT NULL DEFAULT 'weak',
    ADD COLUMN `riskFlags` TEXT NULL,
    ADD COLUMN `socialScore` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `trustLevel` VARCHAR(191) NOT NULL DEFAULT 'unverified';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `activeDisputes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `addressVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `bannedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `frozenAt` DATETIME(3) NULL,
    ADD COLUMN `identityVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isBanned` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isFrozen` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isSuspended` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
    ADD COLUMN `moderationStats` TEXT NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `phoneVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `specializations` TEXT NULL,
    ADD COLUMN `storeCredit` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `suspendedAt` DATETIME(3) NULL,
    ADD COLUMN `verifiedDate` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `sellers` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `businessDescription` TEXT NOT NULL,
    `businessAddress` TEXT NOT NULL,
    `businessPhone` VARCHAR(191) NULL,
    `businessEmail` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `rating` DECIMAL(3, 2) NULL,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `documents` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sellers_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `actionUrl` VARCHAR(191) NULL,
    `actionLabel` VARCHAR(191) NULL,
    `metadata` TEXT NULL,
    `scheduledFor` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `readAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notification_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `emailNotifications` BOOLEAN NOT NULL DEFAULT true,
    `smsNotifications` BOOLEAN NOT NULL DEFAULT true,
    `pushNotifications` BOOLEAN NOT NULL DEFAULT true,
    `orderUpdates` BOOLEAN NOT NULL DEFAULT true,
    `paymentAlerts` BOOLEAN NOT NULL DEFAULT true,
    `securityAlerts` BOOLEAN NOT NULL DEFAULT true,
    `marketingEmails` BOOLEAN NOT NULL DEFAULT false,
    `weeklyDigest` BOOLEAN NOT NULL DEFAULT true,
    `promotionalOffers` BOOLEAN NOT NULL DEFAULT true,
    `systemMaintenance` BOOLEAN NOT NULL DEFAULT true,
    `frequency` VARCHAR(191) NOT NULL DEFAULT 'immediate',
    `quietHoursStart` VARCHAR(191) NULL,
    `quietHoursEnd` VARCHAR(191) NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'UTC',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `notification_preferences_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_notification_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `email` BOOLEAN NOT NULL DEFAULT true,
    `sms` BOOLEAN NOT NULL DEFAULT true,
    `push` BOOLEAN NOT NULL DEFAULT true,
    `inApp` BOOLEAN NOT NULL DEFAULT true,
    `whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `categories` TEXT NULL,
    `quietHours` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_notification_preferences_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `data_export_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `requestType` VARCHAR(191) NOT NULL DEFAULT 'full_export',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `dataTypes` TEXT NOT NULL,
    `format` VARCHAR(191) NOT NULL DEFAULT 'json',
    `downloadUrl` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NULL,
    `requestedBy` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `fileSize` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `data_deletion_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `requestType` VARCHAR(191) NOT NULL DEFAULT 'full_deletion',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `reason` TEXT NULL,
    `dataTypes` TEXT NULL,
    `retentionPeriod` INTEGER NULL,
    `requestDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `requestedBy` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `scheduledDate` DATETIME(3) NULL,
    `scheduledFor` DATETIME(3) NULL,
    `verificationToken` VARCHAR(191) NULL,
    `deletionMethod` VARCHAR(191) NOT NULL DEFAULT 'soft_delete',
    `processedBy` VARCHAR(191) NULL,
    `processedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `backupCreated` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consent_records` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `consentType` VARCHAR(191) NOT NULL,
    `consentSource` VARCHAR(191) NOT NULL DEFAULT 'website',
    `consentGiven` BOOLEAN NOT NULL,
    `consentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `consentMethod` VARCHAR(191) NOT NULL DEFAULT 'explicit',
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `version` VARCHAR(191) NOT NULL,
    `withdrawnAt` DATETIME(3) NULL,
    `withdrawalReason` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `legalBasis` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chat_messages` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `roomId` VARCHAR(191) NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `recipientId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `messageType` VARCHAR(191) NOT NULL DEFAULT 'text',
    `attachments` TEXT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `isEdited` BOOLEAN NOT NULL DEFAULT false,
    `editedAt` DATETIME(3) NULL,
    `replyToId` VARCHAR(191) NULL,
    `reactions` TEXT NULL,
    `metadata` TEXT NULL,
    `readAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_badges` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `badgeType` VARCHAR(191) NOT NULL,
    `badgeName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `iconUrl` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL DEFAULT '#10B981',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `earnedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `verifiedBy` VARCHAR(191) NULL,
    `criteria` TEXT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `verification_badges_userId_badgeType_key`(`userId`, `badgeType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `endorsements` (
    `id` VARCHAR(191) NOT NULL,
    `endorserId` VARCHAR(191) NOT NULL,
    `endorseeId` VARCHAR(191) NOT NULL,
    `endorsementType` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `rating` TINYINT NOT NULL,
    `title` VARCHAR(191) NULL,
    `comment` TEXT NULL,
    `description` TEXT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `verifiedBy` VARCHAR(191) NULL,
    `relatedOrder` VARCHAR(191) NULL,
    `helpful` INTEGER NOT NULL DEFAULT 0,
    `reportCount` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `weight` FLOAT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `endorsements_endorserId_endorseeId_category_key`(`endorserId`, `endorseeId`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `social_connections` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `profileUrl` VARCHAR(191) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `followers` INTEGER NULL,
    `following` INTEGER NULL,
    `lastSynced` DATETIME(3) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `social_connections_userId_platform_key`(`userId`, `platform`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `community_posts` (
    `id` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `postType` VARCHAR(191) NOT NULL DEFAULT 'discussion',
    `category` VARCHAR(191) NULL,
    `tags` TEXT NULL,
    `images` TEXT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `likeCount` INTEGER NOT NULL DEFAULT 0,
    `commentCount` INTEGER NOT NULL DEFAULT 0,
    `shareCount` INTEGER NOT NULL DEFAULT 0,
    `reportCount` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'published',
    `moderatedAt` DATETIME(3) NULL,
    `moderatedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_authenticity` (
    `id` VARCHAR(191) NOT NULL,
    `reviewId` VARCHAR(191) NOT NULL,
    `authenticityScore` FLOAT NOT NULL,
    `confidence` FLOAT NOT NULL,
    `riskFactors` TEXT NULL,
    `verificationMethod` VARCHAR(191) NULL,
    `isAuthentic` BOOLEAN NULL,
    `flaggedReason` VARCHAR(191) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `review_authenticity_reviewId_key`(`reviewId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_findings` (
    `id` VARCHAR(191) NOT NULL,
    `auditId` VARCHAR(191) NOT NULL,
    `findingType` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `remediation` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `assignedTo` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `closedBy` VARCHAR(191) NULL,
    `evidence` TEXT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vulnerability_assessments` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `cvssScore` FLOAT NULL,
    `cveId` VARCHAR(191) NULL,
    `affectedSystems` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'identified',
    `discoveredBy` VARCHAR(191) NULL,
    `discoveredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `patchAvailable` BOOLEAN NOT NULL DEFAULT false,
    `patchVersion` VARCHAR(191) NULL,
    `mitigationSteps` TEXT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `resolvedBy` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `sessionId` VARCHAR(191) NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource` VARCHAR(191) NULL,
    `details` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `success` BOOLEAN NOT NULL,
    `errorCode` VARCHAR(191) NULL,
    `errorMessage` TEXT NULL,
    `metadata` TEXT NULL,
    `riskScore` INTEGER NULL DEFAULT 0,
    `flagged` BOOLEAN NOT NULL DEFAULT false,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `security_logs_userId_idx`(`userId`),
    INDEX `security_logs_eventType_idx`(`eventType`),
    INDEX `security_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocked_ips` (
    `id` VARCHAR(191) NOT NULL,
    `ipAddress` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `blockedBy` VARCHAR(191) NOT NULL,
    `blockedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `attempts` INTEGER NOT NULL DEFAULT 1,
    `lastAttempt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blocked_ips_ipAddress_key`(`ipAddress`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_scans` (
    `id` VARCHAR(191) NOT NULL,
    `scanType` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'queued',
    `findings` LONGTEXT NULL,
    `riskScore` INTEGER NULL DEFAULT 0,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `scanEngine` VARCHAR(191) NULL,
    `engineVersion` VARCHAR(191) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_activities` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `activityType` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource` VARCHAR(191) NULL,
    `metadata` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `duration` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_activities_userId_idx`(`userId`),
    INDEX `user_activities_activityType_idx`(`activityType`),
    INDEX `user_activities_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emergency_contacts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `relationship` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `safety_settings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `locationSharing` BOOLEAN NOT NULL DEFAULT false,
    `meetingReminders` BOOLEAN NOT NULL DEFAULT true,
    `emergencyContacts` BOOLEAN NOT NULL DEFAULT true,
    `safetyTips` BOOLEAN NOT NULL DEFAULT true,
    `incidentReporting` BOOLEAN NOT NULL DEFAULT true,
    `riskAssessment` BOOLEAN NOT NULL DEFAULT true,
    `backgroundChecks` BOOLEAN NOT NULL DEFAULT false,
    `identityVerification` BOOLEAN NOT NULL DEFAULT false,
    `twoFactorAuth` BOOLEAN NOT NULL DEFAULT false,
    `loginAlerts` BOOLEAN NOT NULL DEFAULT true,
    `profileVisibilityLevel` VARCHAR(191) NOT NULL DEFAULT 'public',
    `allowContactFromStrangers` BOOLEAN NOT NULL DEFAULT true,
    `shareLocationData` BOOLEAN NOT NULL DEFAULT false,
    `emergencyModeEnabled` BOOLEAN NOT NULL DEFAULT false,
    `safeWord` VARCHAR(191) NULL,
    `safeWordEnabled` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `safety_settings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_guidelines` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'general',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `audience` VARCHAR(191) NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `helpful` INTEGER NOT NULL DEFAULT 0,
    `notHelpful` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trust_metrics` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `metricType` VARCHAR(191) NOT NULL,
    `value` FLOAT NOT NULL,
    `maxValue` FLOAT NOT NULL DEFAULT 100.0,
    `weight` FLOAT NOT NULL,
    `lastCalculated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `period` VARCHAR(191) NOT NULL DEFAULT 'all_time',
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `trust_metrics_userId_metricType_period_key`(`userId`, `metricType`, `period`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `policy_violations` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `violationType` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'reported',
    `description` TEXT NOT NULL,
    `evidence` TEXT NULL,
    `reportedBy` VARCHAR(191) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `actionTaken` VARCHAR(191) NULL,
    `appealStatus` VARCHAR(191) NULL,
    `detectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `risk_assessments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `riskType` VARCHAR(191) NOT NULL,
    `riskScore` INTEGER NOT NULL,
    `riskLevel` VARCHAR(191) NOT NULL,
    `overallRisk` VARCHAR(191) NOT NULL,
    `factors` TEXT NOT NULL,
    `riskFactors` TEXT NOT NULL,
    `recommendations` TEXT NULL,
    `assessedBy` VARCHAR(191) NOT NULL,
    `validUntil` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reputation_changes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `changeType` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `previousScore` INTEGER NOT NULL DEFAULT 0,
    `newScore` INTEGER NOT NULL DEFAULT 0,
    `delta` INTEGER NOT NULL DEFAULT 0,
    `reason` TEXT NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `relatedEntity` VARCHAR(191) NULL,
    `triggeredBy` VARCHAR(191) NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metadata` TEXT NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `identity_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `documentType` VARCHAR(191) NOT NULL,
    `documentNumber` VARCHAR(191) NULL,
    `documentImages` TEXT NOT NULL,
    `selfieImage` VARCHAR(191) NULL,
    `verificationMethod` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `verificationType` VARCHAR(191) NOT NULL DEFAULT 'identity',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `confidence` FLOAT NULL,
    `verifiedBy` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `rejectionReason` TEXT NULL,
    `notes` TEXT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `background_checks` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `checkType` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NULL,
    `providerRef` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `result` VARCHAR(191) NULL,
    `score` INTEGER NULL,
    `findings` TEXT NULL,
    `requestedBy` VARCHAR(191) NOT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `cost` DECIMAL(8, 2) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bio` TEXT NULL,
    `website` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `gender` VARCHAR(191) NULL,
    `interests` TEXT NULL,
    `languages` TEXT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'UTC',
    `profilePicture` VARCHAR(191) NULL,
    `coverPicture` VARCHAR(191) NULL,
    `socialLinks` TEXT NULL,
    `preferences` TEXT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `lastActiveAt` DATETIME(3) NULL,
    `verifiedDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_items` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `title` VARCHAR(191) NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `autoModerationScore` FLOAT NULL,
    `moderatedAt` DATETIME(3) NULL,
    `isRemoved` BOOLEAN NOT NULL DEFAULT false,
    `isBlurred` BOOLEAN NOT NULL DEFAULT false,
    `visibilityRestricted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_flags` (
    `id` VARCHAR(191) NOT NULL,
    `contentId` VARCHAR(191) NOT NULL,
    `contentItemId` VARCHAR(191) NOT NULL,
    `flaggedBy` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `flagType` VARCHAR(191) NOT NULL DEFAULT 'inappropriate',
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewNotes` TEXT NULL,
    `description` TEXT NULL,
    `flaggedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_violations` (
    `id` VARCHAR(191) NOT NULL,
    `contentId` VARCHAR(191) NOT NULL,
    `violationType` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `confidence` DOUBLE NULL,
    `description` TEXT NOT NULL,
    `detectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `detectedBy` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_reviews` (
    `id` VARCHAR(191) NOT NULL,
    `contentId` VARCHAR(191) NOT NULL,
    `contentItemId` VARCHAR(191) NULL,
    `reviewerId` VARCHAR(191) NOT NULL,
    `decision` VARCHAR(191) NOT NULL,
    `confidence` VARCHAR(191) NULL,
    `reasoning` TEXT NULL,
    `actionsTaken` TEXT NULL,
    `reviewTime` INTEGER NULL,
    `qualityScore` FLOAT NULL,
    `notes` TEXT NULL,
    `reason` TEXT NULL,
    `reviewedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `verifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispute_evidence` (
    `id` VARCHAR(191) NOT NULL,
    `disputeId` VARCHAR(191) NOT NULL,
    `submittedBy` VARCHAR(191) NOT NULL,
    `evidenceType` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `fileUrls` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispute_resolutions` (
    `id` VARCHAR(191) NOT NULL,
    `disputeId` VARCHAR(191) NOT NULL,
    `resolvedBy` VARCHAR(191) NOT NULL,
    `resolutionType` VARCHAR(191) NOT NULL,
    `outcome` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `compensation` TEXT NULL,
    `resolvedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mediation_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `disputeId` VARCHAR(191) NOT NULL,
    `mediatorId` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `duration` INTEGER NOT NULL,
    `sessionType` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `meetingLink` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `push_subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(500) NOT NULL,
    `p256dh` VARCHAR(191) NULL,
    `auth` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `userAgent` TEXT NULL,
    `deviceInfo` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `push_subscriptions_userId_endpoint_key`(`userId`, `endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `scheduled_notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `scheduledFor` DATETIME(3) NOT NULL,
    `sent` BOOLEAN NOT NULL DEFAULT false,
    `sentAt` DATETIME(3) NULL,
    `data` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `safety_alerts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `alertType` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `description` TEXT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `source` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `acknowledged` BOOLEAN NOT NULL DEFAULT false,
    `affectedCount` INTEGER NOT NULL DEFAULT 1,
    `assignedTo` VARCHAR(191) NULL,
    `dueDate` DATETIME(3) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `safety_actions` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `actionType` VARCHAR(191) NOT NULL,
    `target` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `executedBy` VARCHAR(191) NOT NULL,
    `performedBy` VARCHAR(191) NOT NULL,
    `executedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` VARCHAR(191) NOT NULL DEFAULT 'completed',
    `data` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` TEXT NOT NULL,
    `metadata` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `compliance_checks` (
    `id` VARCHAR(191) NOT NULL,
    `checkType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `result` TEXT NULL,
    `performedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `scheduledAt` DATETIME(3) NOT NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fraud_detections` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `fraudType` VARCHAR(191) NULL,
    `riskScore` INTEGER NOT NULL,
    `riskFactors` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'flagged',
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `actionTaken` VARCHAR(191) NULL,
    `detectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_warnings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `contentItemId` VARCHAR(191) NULL,
    `reason` TEXT NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `issuedBy` VARCHAR(191) NOT NULL,
    `issuedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acknowledged` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `disputes_disputeId_key` ON `disputes`(`disputeId`);

-- AddForeignKey
ALTER TABLE `sellers` ADD CONSTRAINT `sellers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `sellers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_reports` ADD CONSTRAINT `user_reports_reportedUserId_fkey` FOREIGN KEY (`reportedUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disputes` ADD CONSTRAINT `disputes_complainantId_fkey` FOREIGN KEY (`complainantId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disputes` ADD CONSTRAINT `disputes_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_queue` ADD CONSTRAINT `moderation_queue_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_notification_preferences` ADD CONSTRAINT `user_notification_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `data_export_requests` ADD CONSTRAINT `data_export_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `data_deletion_requests` ADD CONSTRAINT `data_deletion_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `consent_records` ADD CONSTRAINT `consent_records_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_badges` ADD CONSTRAINT `verification_badges_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `endorsements` ADD CONSTRAINT `endorsements_endorserId_fkey` FOREIGN KEY (`endorserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `endorsements` ADD CONSTRAINT `endorsements_endorseeId_fkey` FOREIGN KEY (`endorseeId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `social_connections` ADD CONSTRAINT `social_connections_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `community_posts` ADD CONSTRAINT `community_posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_authenticity` ADD CONSTRAINT `review_authenticity_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `security_findings` ADD CONSTRAINT `security_findings_auditId_fkey` FOREIGN KEY (`auditId`) REFERENCES `security_audits`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_activities` ADD CONSTRAINT `user_activities_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emergency_contacts` ADD CONSTRAINT `emergency_contacts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `safety_settings` ADD CONSTRAINT `safety_settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_metrics` ADD CONSTRAINT `trust_metrics_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `policy_violations` ADD CONSTRAINT `policy_violations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `risk_assessments` ADD CONSTRAINT `risk_assessments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reputation_changes` ADD CONSTRAINT `reputation_changes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `identity_verifications` ADD CONSTRAINT `identity_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `background_checks` ADD CONSTRAINT `background_checks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_flags` ADD CONSTRAINT `content_flags_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_violations` ADD CONSTRAINT `content_violations_contentId_fkey` FOREIGN KEY (`contentId`) REFERENCES `content_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispute_resolutions` ADD CONSTRAINT `dispute_resolutions_disputeId_fkey` FOREIGN KEY (`disputeId`) REFERENCES `disputes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
