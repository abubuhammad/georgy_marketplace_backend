-- Complete Database Migration for Georgy Marketplace
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    avatar TEXT,
    "emailVerified" BOOLEAN DEFAULT false,
    "phoneVerified" BOOLEAN DEFAULT false,
    "identityVerified" BOOLEAN DEFAULT false,
    "addressVerified" BOOLEAN DEFAULT false,
    "isActive" BOOLEAN DEFAULT true,
    "isSuspended" BOOLEAN DEFAULT false,
    "suspendedAt" TIMESTAMP,
    "isBanned" BOOLEAN DEFAULT false,
    "bannedAt" TIMESTAMP,
    "isFrozen" BOOLEAN DEFAULT false,
    "frozenAt" TIMESTAMP,
    "isDeleted" BOOLEAN DEFAULT false,
    "deletedAt" TIMESTAMP,
    "verifiedDate" TIMESTAMP,
    "lastLoginAt" TIMESTAMP,
    specializations TEXT,
    "activeDisputes" INTEGER DEFAULT 0,
    "storeCredit" DECIMAL(10,2) DEFAULT 0,
    "moderationStats" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Password Resets
CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Sellers
CREATE TABLE IF NOT EXISTS sellers (
    id TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessDescription" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "businessPhone" TEXT,
    "businessEmail" TEXT,
    logo TEXT,
    rating DECIMAL(3,2),
    "reviewCount" INTEGER DEFAULT 0,
    "isVerified" BOOLEAN DEFAULT false,
    documents TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "productName" TEXT,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    brand TEXT,
    condition TEXT DEFAULT 'new',
    images TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    "isActive" BOOLEAN DEFAULT true,
    location TEXT,
    "locationCity" TEXT,
    "locationState" TEXT,
    "locationCountry" TEXT,
    "isNegotiable" BOOLEAN DEFAULT false,
    "viewCount" INTEGER DEFAULT 0,
    rating DECIMAL(3,2),
    "reviewCount" INTEGER DEFAULT 0,
    "dynamicFields" TEXT,
    category TEXT DEFAULT '',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("sellerId") REFERENCES sellers(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    "paymentStatus" TEXT DEFAULT 'pending',
    "paymentMethod" TEXT,
    "shippingAddress" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP,
    "expectedDeliveryDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY ("buyerId") REFERENCES users(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    rating INTEGER NOT NULL,
    comment TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("productId") REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Listings
CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10,2),
    negotiable BOOLEAN DEFAULT false,
    condition TEXT DEFAULT 'new',
    images TEXT NOT NULL,
    location TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL,
    "propertyType" TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    area DECIMAL(8,2),
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    images TEXT NOT NULL,
    "virtualTour" TEXT,
    amenities TEXT,
    "ownerId" TEXT NOT NULL,
    "agentId" TEXT,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'available',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("ownerId") REFERENCES users(id) ON DELETE CASCADE
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    salary DECIMAL(10,2),
    "salaryType" TEXT,
    requirements TEXT NOT NULL,
    benefits TEXT,
    "employerId" TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("employerId") REFERENCES users(id) ON DELETE CASCADE
);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
    id TEXT PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "coverLetter" TEXT,
    resume TEXT,
    status TEXT DEFAULT 'applied',
    score INTEGER,
    notes TEXT,
    "appliedAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("jobId") REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY ("applicantId") REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT DEFAULT 'normal',
    "isRead" BOOLEAN DEFAULT false,
    read BOOLEAN DEFAULT false,
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    metadata TEXT,
    "scheduledFor" TIMESTAMP,
    "sentAt" TIMESTAMP,
    "readAt" TIMESTAMP,
    "expiresAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Payment System
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    "sellerId" TEXT,
    "orderId" TEXT,
    "serviceRequestId" TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    provider TEXT NOT NULL,
    "providerRef" TEXT,
    description TEXT,
    escrow BOOLEAN DEFAULT false,
    "escrowStatus" TEXT,
    "platformCut" DECIMAL(8,2) DEFAULT 0,
    "sellerNet" DECIMAL(10,2) DEFAULT 0,
    "processingFee" DECIMAL(8,2) DEFAULT 0,
    tax DECIMAL(8,2) DEFAULT 0,
    metadata TEXT,
    "paidAt" TIMESTAMP,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Delivery Agents
CREATE TABLE IF NOT EXISTS delivery_agents (
    id TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL,
    "businessName" TEXT,
    "vehicleType" TEXT NOT NULL,
    "licensePlate" TEXT,
    "licenseNumber" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "emergencyContact" TEXT,
    "bankDetails" TEXT,
    "isVerified" BOOLEAN DEFAULT false,
    "isAvailable" BOOLEAN DEFAULT true,
    "currentLocation" TEXT,
    rating DECIMAL(3,2),
    "totalDeliveries" INTEGER DEFAULT 0,
    earnings DECIMAL(10,2) DEFAULT 0,
    "joinedAt" TIMESTAMP DEFAULT NOW(),
    "lastActiveAt" TIMESTAMP,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Shipments
CREATE TABLE IF NOT EXISTS shipments (
    id TEXT PRIMARY KEY,
    "orderId" TEXT,
    "serviceRequestId" TEXT,
    "trackingNumber" TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    "shippingOption" TEXT NOT NULL,
    "estimatedDelivery" TIMESTAMP,
    "actualDelivery" TIMESTAMP,
    "pickupAddress" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "pickupCoordinates" TEXT,
    "deliveryCoordinates" TEXT,
    "currentLocation" TEXT,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "deliveryNotes" TEXT,
    "packageDetails" TEXT NOT NULL,
    "deliveryFee" DECIMAL(8,2) NOT NULL,
    "agentId" TEXT,
    "zoneId" TEXT,
    "assignedAt" TIMESTAMP,
    "pickedUpAt" TIMESTAMP,
    "deliveredAt" TIMESTAMP,
    "deliveryProof" TEXT,
    rating INTEGER,
    feedback TEXT,
    events TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("agentId") REFERENCES delivery_agents(id) ON DELETE SET NULL,
    FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE SET NULL
);

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    "userId" TEXT UNIQUE NOT NULL,
    bio TEXT,
    website TEXT,
    location TEXT,
    "dateOfBirth" TIMESTAMP,
    gender TEXT,
    interests TEXT,
    languages TEXT,
    timezone TEXT DEFAULT 'UTC',
    "profilePicture" TEXT,
    "coverPicture" TEXT,
    "socialLinks" TEXT,
    preferences TEXT,
    "isPublic" BOOLEAN DEFAULT true,
    "lastActiveAt" TIMESTAMP,
    "verifiedDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Basic Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products("sellerId");
CREATE INDEX IF NOT EXISTS idx_products_category ON products("categoryId");
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders("buyerId");
CREATE INDEX IF NOT EXISTS idx_orders_product ON orders("productId");
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications("userId");
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments("userId");
CREATE INDEX IF NOT EXISTS idx_shipments_agent ON shipments("agentId");

-- Sample Data (Optional)
INSERT INTO users (id, email, password, "firstName", "lastName", role) 
VALUES 
  ('user_1', 'admin@georgy.com', '$2a$12$hash', 'Admin', 'User', 'admin'),
  ('user_2', 'seller@georgy.com', '$2a$12$hash', 'Test', 'Seller', 'seller'),
  ('user_3', 'buyer@georgy.com', '$2a$12$hash', 'Test', 'Buyer', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Test seller
INSERT INTO sellers (id, "userId", "businessName", "businessDescription", "businessAddress")
VALUES ('seller_1', 'user_2', 'Test Business', 'A test business for marketplace', '{"address": "Test Address", "city": "Lagos"}')
ON CONFLICT ("userId") DO NOTHING;

-- Test product
INSERT INTO products (id, title, description, price, "categoryId", images, "sellerId")
VALUES ('product_1', 'Sample Product', 'A sample product for testing', 1000.00, 'electronics', '["https://example.com/image1.jpg"]', 'seller_1')
ON CONFLICT (id) DO NOTHING;