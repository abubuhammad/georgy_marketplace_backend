"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config/config");
const errorHandler_1 = require("./middleware/errorHandler");
// Import only the working routes
const auth_1 = require("./routes/auth");
const products_1 = require("./routes/products");
const artisans_1 = require("./routes/artisans");
const jobs_1 = require("./routes/jobs");
const realEstate_1 = require("./routes/realEstate");
const users_1 = require("./routes/users");
// Commented out problematic routes temporarily
// import { paymentRoutes } from './routes/payments';
// import { deliveryRoutes } from './routes/delivery';
// import deliveryAnalyticsRoutes from './routes/deliveryAnalytics';
// import { adminRoutes } from './routes/adminRoutes';
const notifications_1 = require("./routes/notifications");
const chat_1 = require("./routes/chat");
const legal_1 = require("./routes/legal");
// import { safetyRoutes } from './routes/safety';
// import { disputeRoutes } from './routes/disputes';
// import { moderationRoutes } from './routes/moderation';
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.frontend.url,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);
// Compression middleware
app.use((0, compression_1.default)());
// Logging middleware
app.use((0, morgan_1.default)(config_1.config.isDevelopment ? 'dev' : 'combined'));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Working API routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/products', products_1.productRoutes);
app.use('/api/artisans', artisans_1.artisanRoutes);
app.use('/api/jobs', jobs_1.jobRoutes);
app.use('/api/real-estate', realEstate_1.realEstateRoutes);
app.use('/api/users', users_1.userRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/delivery', deliveryRoutes);
// app.use('/api/delivery-analytics', deliveryAnalyticsRoutes);
// app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notifications_1.notificationRoutes);
app.use('/api/chat', chat_1.chatRoutes);
app.use('/api/legal', legal_1.legalRoutes);
// app.use('/api/safety', safetyRoutes);
// app.use('/api/disputes', disputeRoutes);
// app.use('/api/moderation', moderationRoutes);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.config.nodeEnv
    });
});
// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Georgy Marketplace API (Temporary)',
        version: '1.0.0',
        description: 'Backend API for Georgy Marketplace platform - Core routes only',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            artisans: '/api/artisans',
            jobs: '/api/jobs',
            realEstate: '/api/real-estate',
            users: '/api/users',
            notifications: '/api/notifications',
            chat: '/api/chat',
            legal: '/api/legal',
            health: '/health'
        },
        note: 'Some advanced features (payments, delivery, disputes, moderation, safety) are temporarily disabled'
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `${req.method} ${req.originalUrl} is not a valid endpoint`
    });
});
// Global error handler
app.use(errorHandler_1.errorHandler);
const PORT = config_1.config.port || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Georgy Backend API server running on port ${PORT}`);
    console.log(`📍 Environment: ${config_1.config.nodeEnv}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💊 Health Check: http://localhost:${PORT}/health`);
    console.log(`⚠️  Note: Advanced services temporarily disabled for stability`);
});
exports.default = app;
//# sourceMappingURL=server-temp.js.map