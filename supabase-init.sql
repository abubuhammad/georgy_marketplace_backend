-- Basic tables for Georgy Marketplace
-- Run this in Supabase SQL Editor

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
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    "categoryId" TEXT NOT NULL,
    category TEXT DEFAULT '',
    condition TEXT DEFAULT 'new',
    images TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    "isActive" BOOLEAN DEFAULT true,
    location TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS products_seller_idx ON products("sellerId");
CREATE INDEX IF NOT EXISTS products_category_idx ON products("categoryId");

-- Insert a test user (optional)
INSERT INTO users (id, email, password, "firstName", "lastName", role) 
VALUES ('test-user-1', 'test@example.com', '$2a$12$hash', 'Test', 'User', 'customer')
ON CONFLICT (email) DO NOTHING;