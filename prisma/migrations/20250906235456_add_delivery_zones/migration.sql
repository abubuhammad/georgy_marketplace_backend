-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'customer',
    `avatar` VARCHAR(191) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_resets_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `condition` VARCHAR(191) NOT NULL DEFAULT 'new',
    `images` TEXT NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `location` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `buyerId` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `paymentMethod` VARCHAR(191) NULL,
    `shippingAddress` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `requestedBy` VARCHAR(191) NOT NULL,
    `processedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` TINYINT NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `listings` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NULL,
    `negotiable` BOOLEAN NOT NULL DEFAULT false,
    `condition` VARCHAR(191) NOT NULL DEFAULT 'new',
    `images` TEXT NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `properties` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `propertyType` VARCHAR(191) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `bedrooms` INTEGER NULL,
    `bathrooms` INTEGER NULL,
    `area` DECIMAL(8, 2) NULL,
    `location` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `images` TEXT NOT NULL,
    `virtualTour` TEXT NULL,
    `amenities` TEXT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `agentId` VARCHAR(191) NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'available',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `property_viewings` (
    `id` VARCHAR(191) NOT NULL,
    `propertyId` VARCHAR(191) NOT NULL,
    `viewerId` VARCHAR(191) NOT NULL,
    `agentId` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled',
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `salary` DECIMAL(10, 2) NULL,
    `salaryType` VARCHAR(191) NULL,
    `requirements` TEXT NOT NULL,
    `benefits` TEXT NULL,
    `employerId` VARCHAR(191) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_applications` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `applicantId` VARCHAR(191) NOT NULL,
    `coverLetter` TEXT NULL,
    `resume` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'applied',
    `score` TINYINT NULL,
    `notes` TEXT NULL,
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `artisan_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `skills` TEXT NOT NULL,
    `experience` INTEGER NOT NULL,
    `hourlyRate` DECIMAL(8, 2) NULL,
    `location` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `portfolio` TEXT NULL,
    `bio` TEXT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `rating` DECIMAL(3, 2) NULL,
    `totalJobs` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `artisan_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_requests` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `artisanId` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `budget` DECIMAL(10, 2) NULL,
    `urgency` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `images` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `scheduledAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `service_quotes` (
    `id` VARCHAR(191) NOT NULL,
    `serviceRequestId` VARCHAR(191) NOT NULL,
    `artisanId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `description` TEXT NOT NULL,
    `estimatedDuration` VARCHAR(191) NOT NULL,
    `materials` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `validUntil` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chats` (
    `id` VARCHAR(191) NOT NULL,
    `serviceRequestId` VARCHAR(191) NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `artisanId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `lastMessageAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `chatId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `messageType` VARCHAR(191) NOT NULL DEFAULT 'text',
    `fileUrl` VARCHAR(191) NULL,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `legal_documents` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `effectiveDate` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_consents` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `documentVersion` VARCHAR(191) NOT NULL,
    `consentGiven` BOOLEAN NOT NULL,
    `consentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `withdrawnAt` DATETIME(3) NULL,
    `method` VARCHAR(191) NOT NULL DEFAULT 'explicit',

    UNIQUE INDEX `user_consents_userId_documentId_documentVersion_key`(`userId`, `documentId`, `documentVersion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gdpr_requests` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `requestType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `reason` TEXT NULL,
    `requestData` LONGTEXT NULL,
    `processedBy` VARCHAR(191) NULL,
    `processedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_privacy_settings` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `profileVisible` BOOLEAN NOT NULL DEFAULT true,
    `emailVisible` BOOLEAN NOT NULL DEFAULT false,
    `phoneVisible` BOOLEAN NOT NULL DEFAULT false,
    `locationVisible` BOOLEAN NOT NULL DEFAULT true,
    `activityVisible` BOOLEAN NOT NULL DEFAULT true,
    `marketingConsent` BOOLEAN NOT NULL DEFAULT false,
    `analyticsConsent` BOOLEAN NOT NULL DEFAULT true,
    `thirdPartySharing` BOOLEAN NOT NULL DEFAULT false,
    `dataRetentionConsent` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_privacy_settings_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_verifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `identityVerified` BOOLEAN NOT NULL DEFAULT false,
    `phoneVerified` BOOLEAN NOT NULL DEFAULT false,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `addressVerified` BOOLEAN NOT NULL DEFAULT false,
    `documentsVerified` BOOLEAN NOT NULL DEFAULT false,
    `backgroundCheck` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `verificationScore` INTEGER NOT NULL DEFAULT 0,
    `lastVerifiedAt` DATETIME(3) NULL,
    `verificationNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_verifications_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_safety_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `safetyScore` INTEGER NOT NULL DEFAULT 50,
    `riskLevel` VARCHAR(191) NOT NULL DEFAULT 'low',
    `emergencyContact` TEXT NULL,
    `safetyPreferences` TEXT NULL,
    `blockedUsers` TEXT NULL,
    `lastSafetyUpdate` DATETIME(3) NULL,
    `safetyAlerts` BOOLEAN NOT NULL DEFAULT true,
    `locationSharing` BOOLEAN NOT NULL DEFAULT false,
    `meetingPreferences` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_safety_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `safety_incidents` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `incidentType` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'low',
    `status` VARCHAR(191) NOT NULL DEFAULT 'reported',
    `description` TEXT NOT NULL,
    `evidence` TEXT NULL,
    `location` VARCHAR(191) NULL,
    `reportedBy` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `resolvedBy` VARCHAR(191) NULL,
    `resolution` TEXT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `followUpDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_reports` (
    `id` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `reportedUser` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `evidence` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `assignedTo` VARCHAR(191) NULL,
    `resolution` TEXT NULL,
    `actionTaken` VARCHAR(191) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_audits` (
    `id` VARCHAR(191) NOT NULL,
    `auditType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled',
    `severity` VARCHAR(191) NOT NULL DEFAULT 'info',
    `category` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `findings` LONGTEXT NULL,
    `recommendations` LONGTEXT NULL,
    `remediation` TEXT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `nextAuditDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `security_incidents` (
    `id` VARCHAR(191) NOT NULL,
    `incidentType` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'detected',
    `description` TEXT NOT NULL,
    `affectedSystems` TEXT NULL,
    `affectedUsers` INTEGER NOT NULL DEFAULT 0,
    `detectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `containedAt` DATETIME(3) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `assignedTo` VARCHAR(191) NULL,
    `response` TEXT NULL,
    `lessons` TEXT NULL,
    `publicNotice` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `access_controls` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `permission` VARCHAR(191) NOT NULL,
    `granted` BOOLEAN NOT NULL DEFAULT false,
    `grantedBy` VARCHAR(191) NULL,
    `grantedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `reason` TEXT NULL,
    `conditions` TEXT NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `access_controls_userId_resource_permission_key`(`userId`, `resource`, `permission`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disputes` (
    `id` VARCHAR(191) NOT NULL,
    `disputeNumber` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'open',
    `priority` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `subject` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `amount` DECIMAL(10, 2) NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `claimantId` VARCHAR(191) NOT NULL,
    `respondentId` VARCHAR(191) NOT NULL,
    `assignedTo` VARCHAR(191) NULL,
    `category` VARCHAR(191) NOT NULL,
    `subcategory` VARCHAR(191) NULL,
    `relatedOrder` VARCHAR(191) NULL,
    `relatedItem` VARCHAR(191) NULL,
    `evidence` LONGTEXT NULL,
    `timeline` LONGTEXT NULL,
    `resolution` TEXT NULL,
    `compensation` DECIMAL(10, 2) NULL,
    `resolvedAt` DATETIME(3) NULL,
    `escalatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `disputes_disputeNumber_key`(`disputeNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispute_messages` (
    `id` VARCHAR(191) NOT NULL,
    `disputeId` VARCHAR(191) NOT NULL,
    `senderId` VARCHAR(191) NOT NULL,
    `messageType` VARCHAR(191) NOT NULL DEFAULT 'message',
    `content` TEXT NOT NULL,
    `attachments` TEXT NULL,
    `isInternal` BOOLEAN NOT NULL DEFAULT false,
    `readBy` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dispute_mediations` (
    `id` VARCHAR(191) NOT NULL,
    `disputeId` VARCHAR(191) NOT NULL,
    `mediatorId` VARCHAR(191) NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `startedAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled',
    `type` VARCHAR(191) NOT NULL DEFAULT 'video',
    `meetingLink` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `outcome` VARCHAR(191) NULL,
    `agreementTerms` TEXT NULL,
    `nextSteps` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `content_moderation` (
    `id` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `contentId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `moderationType` VARCHAR(191) NOT NULL DEFAULT 'automated',
    `flaggedReason` VARCHAR(191) NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'low',
    `confidence` FLOAT NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `action` VARCHAR(191) NULL,
    `actionReason` TEXT NULL,
    `appeal` BOOLEAN NOT NULL DEFAULT false,
    `appealReason` TEXT NULL,
    `appealedAt` DATETIME(3) NULL,
    `appealReviewed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_rules` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `conditions` LONGTEXT NOT NULL,
    `actions` LONGTEXT NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'medium',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `createdBy` VARCHAR(191) NOT NULL,
    `lastUsed` DATETIME(3) NULL,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_queue` (
    `id` VARCHAR(191) NOT NULL,
    `contentType` VARCHAR(191) NOT NULL,
    `contentId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `priority` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `assignedTo` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `flaggedBy` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `metadata` TEXT NULL,
    `assignedAt` DATETIME(3) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_trust_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `trustScore` INTEGER NOT NULL DEFAULT 50,
    `verificationBadges` TEXT NOT NULL,
    `reputationScore` INTEGER NOT NULL DEFAULT 0,
    `reliabilityScore` INTEGER NOT NULL DEFAULT 50,
    `riskLevel` VARCHAR(191) NOT NULL DEFAULT 'low',
    `accountAge` INTEGER NOT NULL DEFAULT 0,
    `lastActivity` DATETIME(3) NULL,
    `profileCompletion` INTEGER NOT NULL DEFAULT 0,
    `transactionCount` INTEGER NOT NULL DEFAULT 0,
    `disputeRate` FLOAT NOT NULL DEFAULT 0.0,
    `positiveReviews` INTEGER NOT NULL DEFAULT 0,
    `negativeReviews` INTEGER NOT NULL DEFAULT 0,
    `endorsementCount` INTEGER NOT NULL DEFAULT 0,
    `warnings` INTEGER NOT NULL DEFAULT 0,
    `restrictions` TEXT NULL,
    `notes` TEXT NULL,
    `lastUpdated` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_trust_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_endorsements` (
    `id` VARCHAR(191) NOT NULL,
    `endorserId` VARCHAR(191) NOT NULL,
    `endorseeId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `relatedOrder` VARCHAR(191) NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `helpful` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_endorsements_endorserId_endorseeId_category_key`(`endorserId`, `endorseeId`, `category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `trust_alerts` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `alertType` VARCHAR(191) NOT NULL,
    `severity` VARCHAR(191) NOT NULL DEFAULT 'info',
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `actionRequired` BOOLEAN NOT NULL DEFAULT false,
    `dismissed` BOOLEAN NOT NULL DEFAULT false,
    `dismissedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_agents` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NULL,
    `vehicleType` VARCHAR(191) NOT NULL,
    `licensePlate` VARCHAR(191) NULL,
    `licenseNumber` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `emergencyContact` VARCHAR(191) NULL,
    `bankDetails` TEXT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `currentLocation` TEXT NULL,
    `rating` DECIMAL(3, 2) NULL,
    `totalDeliveries` INTEGER NOT NULL DEFAULT 0,
    `earnings` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastActiveAt` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `delivery_agents_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipments` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NULL,
    `serviceRequestId` VARCHAR(191) NULL,
    `trackingNumber` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `shippingOption` VARCHAR(191) NOT NULL,
    `estimatedDelivery` DATETIME(3) NULL,
    `actualDelivery` DATETIME(3) NULL,
    `pickupAddress` TEXT NOT NULL,
    `deliveryAddress` TEXT NOT NULL,
    `pickupCoordinates` TEXT NULL,
    `deliveryCoordinates` TEXT NULL,
    `recipientName` VARCHAR(191) NOT NULL,
    `recipientPhone` VARCHAR(191) NOT NULL,
    `deliveryNotes` TEXT NULL,
    `packageDetails` TEXT NOT NULL,
    `deliveryFee` DECIMAL(8, 2) NOT NULL,
    `agentId` VARCHAR(191) NULL,
    `zoneId` VARCHAR(191) NULL,
    `assignedAt` DATETIME(3) NULL,
    `pickedUpAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `deliveryProof` TEXT NULL,
    `rating` TINYINT NULL,
    `feedback` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `shipments_trackingNumber_key`(`trackingNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delivery_zones` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `coordinates` TEXT NOT NULL,
    `baseFee` DECIMAL(8, 2) NOT NULL,
    `feePerKm` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    `maxDistance` INTEGER NOT NULL DEFAULT 50,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NULL,
    `orderId` VARCHAR(191) NULL,
    `serviceRequestId` VARCHAR(191) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `method` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `provider` VARCHAR(191) NOT NULL,
    `providerRef` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `escrow` BOOLEAN NOT NULL DEFAULT false,
    `escrowStatus` VARCHAR(191) NULL,
    `platformCut` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    `sellerNet` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `processingFee` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    `tax` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    `metadata` TEXT NULL,
    `paidAt` DATETIME(3) NULL,
    `failureReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_reference_key`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_refunds` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `providerRef` VARCHAR(191) NULL,
    `processedBy` VARCHAR(191) NULL,
    `requestedBy` VARCHAR(191) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `failureReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payouts` (
    `id` VARCHAR(191) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `status` VARCHAR(191) NOT NULL DEFAULT 'scheduled',
    `provider` VARCHAR(191) NOT NULL,
    `providerRef` VARCHAR(191) NULL,
    `bankDetails` TEXT NOT NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `processedAt` DATETIME(3) NULL,
    `failureReason` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payout_items` (
    `id` VARCHAR(191) NOT NULL,
    `payoutId` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `commission` DECIMAL(8, 2) NOT NULL,
    `net` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `payout_items_payoutId_paymentId_key`(`payoutId`, `paymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invoices` (
    `id` VARCHAR(191) NOT NULL,
    `paymentId` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `tax` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'issued',
    `dueDate` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `details` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `invoices_invoiceNumber_key`(`invoiceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tax_rules` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `rate` DECIMAL(5, 4) NOT NULL,
    `category` VARCHAR(191) NULL,
    `region` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `revenue_share_schemes` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `platformPercentage` DECIMAL(5, 4) NOT NULL,
    `sellerPercentage` DECIMAL(5, 4) NOT NULL,
    `minimumFee` DECIMAL(8, 2) NOT NULL DEFAULT 0,
    `maximumFee` DECIMAL(8, 2) NULL,
    `userType` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `effectiveFrom` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `effectiveTo` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `listings` ADD CONSTRAINT `listings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `properties` ADD CONSTRAINT `properties_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `property_viewings` ADD CONSTRAINT `property_viewings_propertyId_fkey` FOREIGN KEY (`propertyId`) REFERENCES `properties`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `job_applications` ADD CONSTRAINT `job_applications_applicantId_fkey` FOREIGN KEY (`applicantId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `artisan_profiles` ADD CONSTRAINT `artisan_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_requests` ADD CONSTRAINT `service_requests_artisanId_fkey` FOREIGN KEY (`artisanId`) REFERENCES `artisan_profiles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_quotes` ADD CONSTRAINT `service_quotes_serviceRequestId_fkey` FOREIGN KEY (`serviceRequestId`) REFERENCES `service_requests`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_serviceRequestId_fkey` FOREIGN KEY (`serviceRequestId`) REFERENCES `service_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_chatId_fkey` FOREIGN KEY (`chatId`) REFERENCES `chats`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_consents` ADD CONSTRAINT `user_consents_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `legal_documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gdpr_requests` ADD CONSTRAINT `gdpr_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_privacy_settings` ADD CONSTRAINT `user_privacy_settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_verifications` ADD CONSTRAINT `user_verifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_safety_profiles` ADD CONSTRAINT `user_safety_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `safety_incidents` ADD CONSTRAINT `safety_incidents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_safety_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_reports` ADD CONSTRAINT `user_reports_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_reports` ADD CONSTRAINT `user_reports_reportedUser_fkey` FOREIGN KEY (`reportedUser`) REFERENCES `user_safety_profiles`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disputes` ADD CONSTRAINT `disputes_claimantId_fkey` FOREIGN KEY (`claimantId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disputes` ADD CONSTRAINT `disputes_respondentId_fkey` FOREIGN KEY (`respondentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispute_messages` ADD CONSTRAINT `dispute_messages_disputeId_fkey` FOREIGN KEY (`disputeId`) REFERENCES `disputes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispute_messages` ADD CONSTRAINT `dispute_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispute_mediations` ADD CONSTRAINT `dispute_mediations_disputeId_fkey` FOREIGN KEY (`disputeId`) REFERENCES `disputes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dispute_mediations` ADD CONSTRAINT `dispute_mediations_mediatorId_fkey` FOREIGN KEY (`mediatorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `content_moderation` ADD CONSTRAINT `content_moderation_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_queue` ADD CONSTRAINT `moderation_queue_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_trust_profiles` ADD CONSTRAINT `user_trust_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_endorsements` ADD CONSTRAINT `user_endorsements_endorserId_fkey` FOREIGN KEY (`endorserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_endorsements` ADD CONSTRAINT `user_endorsements_endorseeId_fkey` FOREIGN KEY (`endorseeId`) REFERENCES `user_trust_profiles`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `trust_alerts` ADD CONSTRAINT `trust_alerts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user_trust_profiles`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_agents` ADD CONSTRAINT `delivery_agents_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `delivery_agents`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shipments` ADD CONSTRAINT `shipments_zoneId_fkey` FOREIGN KEY (`zoneId`) REFERENCES `delivery_zones`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payment_refunds` ADD CONSTRAINT `payment_refunds_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payout_items` ADD CONSTRAINT `payout_items_payoutId_fkey` FOREIGN KEY (`payoutId`) REFERENCES `payouts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
