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
exports.config = void 0;
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
// Load environment variables from the parent directory's .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });
exports.config = {
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
//# sourceMappingURL=config.js.map