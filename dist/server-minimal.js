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
const auth_1 = require("./routes/auth");
const products_1 = require("./routes/products");
const users_1 = require("./routes/users");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        config_1.config.frontend.url, // Web frontend
        'http://localhost:8080', // Web frontend (current port)
        'http://localhost:5173', // Web frontend (vite default)
        'http://localhost:3000', // Web frontend (react default)
        'http://192.168.0.171:8080', // Network IP for mobile/remote access
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
// Basic API routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/products', products_1.productRoutes);
app.use('/api/users', users_1.userRoutes);
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
        api: 'Georgy Backend API v1.0.0 (Minimal Mode)'
    });
});
// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Georgy Marketplace API',
        version: '1.0.0',
        description: 'Backend API for Georgy Marketplace platform - Minimal Version',
        endpoints: {
            auth: '/api/auth',
            products: '/api/products',
            users: '/api/users'
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
server.listen(PORT, () => {
    console.log(`🚀 Georgy Backend API server running on port ${PORT}`);
    console.log(`📍 Environment: ${config_1.config.nodeEnv}`);
    console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    console.log(`💊 Health Check: http://localhost:${PORT}/health`);
    console.log('🔧 Running in minimal mode - some features may be disabled');
});
exports.default = app;
//# sourceMappingURL=server-minimal.js.map