import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from the parent directory's .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  port: parseInt(process.env.BACKEND_PORT || '5000', 10),
  
  database: {
    url: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/georgy_marketplace'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10)
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173'
  },
  
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@georgy.com'
  },
  
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10) // limit each IP to 100 requests per windowMs
  }
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

console.log('✅ Configuration loaded successfully');
