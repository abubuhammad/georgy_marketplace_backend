"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
const express_1 = __importDefault(require("express"));
require("./types"); // Ensure type definitions are loaded
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config/config");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./routes/auth");
const products_1 = require("./routes/products");
const artisans_1 = require("./routes/artisans");
const jobs_1 = require("./routes/jobs");
const realEstate_1 = require("./routes/realEstate");
const users_1 = require("./routes/users");
const payments_1 = require("./routes/payments");
const delivery_1 = require("./routes/delivery");
const deliveryAnalytics_1 = __importDefault(require("./routes/deliveryAnalytics"));
const adminRoutes_1 = require("./routes/adminRoutes");
const notifications_1 = require("./routes/notifications");
const chat_1 = require("./routes/chat");
const legal_1 = require("./routes/legal");
const safety_1 = require("./routes/safety");
const disputes_1 = require("./routes/disputes");
const moderation_1 = require("./routes/moderation");
const uploadRoutes_1 = require("./routes/uploadRoutes");
const socketService_1 = require("./services/socketService");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        config_1.config.frontend.url, // Web frontend
        'http://localhost:8080', // Web frontend (alt port)
        'http://localhost:5173', // Web frontend (vite default)
        'http://192.168.0.171:8080', // Network IP for mobile/remote access
        'http://localhost:19006', // Expo mobile app
        'exp://localhost:19000', // Expo dev server
        'exp://192.168.0.171:19000', // Expo dev server (network IP)
    ],
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
// Static file serving for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// API routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/products', products_1.productRoutes);
app.use('/api/artisans', artisans_1.artisanRoutes);
app.use('/api/jobs', jobs_1.jobRoutes);
app.use('/api/real-estate', realEstate_1.realEstateRoutes);
app.use('/api/users', users_1.userRoutes);
app.use('/api/payments', payments_1.paymentRoutes);
app.use('/api/delivery', delivery_1.deliveryRoutes);
app.use('/api/delivery-analytics', deliveryAnalytics_1.default);
app.use('/api/admin', adminRoutes_1.adminRoutes);
app.use('/api/notifications', notifications_1.notificationRoutes);
app.use('/api/chat', chat_1.chatRoutes);
app.use('/api/legal', legal_1.legalRoutes);
app.use('/api/safety', safety_1.safetyRoutes);
app.use('/api/disputes', disputes_1.disputeRoutes);
app.use('/api/moderation', moderation_1.moderationRoutes);
app.use('/api/upload', uploadRoutes_1.uploadRoutes);
// Health check endpoints
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.config.nodeEnv
    });
});
// API Health check endpoint (for frontend services)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config_1.config.nodeEnv,
        api: 'Georgy Backend API v1.0.0'
    });
});
// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Georgy Marketplace API',
        version: '1.0.0',
        description: 'Backend API for Georgy Marketplace platform',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            artisans: '/api/artisans',
            jobs: '/api/jobs',
            realEstate: '/api/real-estate',
            users: '/api/users',
            payments: '/api/payments',
            delivery: '/api/delivery',
            deliveryAnalytics: '/api/delivery-analytics',
            admin: '/api/admin',
            notifications: '/api/notifications',
            chat: '/api/chat',
            legal: '/api/legal',
            safety: '/api/safety',
            disputes: '/api/disputes',
            moderation: '/api/moderation'
        }
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
// Initialize Socket.io service
const socketService = (0, socketService_1.initializeSocketService)(server);
exports.socketService = socketService;
server.listen(PORT, () => {
    console.log(`🚀 Georgy Backend API server running on port ${PORT}`);
    console.log(`📍 Environment: ${config_1.config.nodeEnv}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💊 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map