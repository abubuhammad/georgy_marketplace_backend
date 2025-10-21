import express from 'express';
import './types'; // Ensure type definitions are loaded
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { artisanRoutes } from './routes/artisans';
import { jobRoutes } from './routes/jobs';
import { realEstateRoutes } from './routes/realEstate';
import { userRoutes } from './routes/users';
import { paymentRoutes } from './routes/payments';
import { deliveryRoutes } from './routes/delivery';
import deliveryAnalyticsRoutes from './routes/deliveryAnalytics';
import { adminRoutes } from './routes/adminRoutes';
import { notificationRoutes } from './routes/notifications';
import { chatRoutes } from './routes/chat';
import { legalRoutes } from './routes/legal';
import { safetyRoutes } from './routes/safety';
import { disputeRoutes } from './routes/disputes';
import { moderationRoutes } from './routes/moderation';
import { uploadRoutes } from './routes/uploadRoutes';
import { initializeSocketService } from './services/socketService';
import path from 'path';

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    config.frontend.url, // Web frontend
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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan(config.isDevelopment ? 'dev' : 'combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/real-estate', realEstateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/delivery-analytics', deliveryAnalyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// API Health check endpoint (for frontend services)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
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
app.use(errorHandler);

const PORT = config.port || 5000;

// Initialize Socket.io service
const socketService = initializeSocketService(server);

server.listen(PORT, () => {
  console.log(`🚀 Georgy Backend API server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💊 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
});

export default app;
export { socketService };
