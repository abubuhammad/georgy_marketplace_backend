import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { errorHandler } from './middleware/errorHandler';

// Import only the working routes
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { artisanRoutes } from './routes/artisans';
import { jobRoutes } from './routes/jobs';
import { realEstateRoutes } from './routes/realEstate';
import { userRoutes } from './routes/users';
// Commented out problematic routes temporarily
// import { paymentRoutes } from './routes/payments';
// import { deliveryRoutes } from './routes/delivery';
// import deliveryAnalyticsRoutes from './routes/deliveryAnalytics';
// import { adminRoutes } from './routes/adminRoutes';
import { notificationRoutes } from './routes/notifications';
import { chatRoutes } from './routes/chat';
import { legalRoutes } from './routes/legal';
// import { safetyRoutes } from './routes/safety';
// import { disputeRoutes } from './routes/disputes';
// import { moderationRoutes } from './routes/moderation';

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
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

// Working API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/artisans', artisanRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/real-estate', realEstateRoutes);
app.use('/api/users', userRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/delivery', deliveryRoutes);
// app.use('/api/delivery-analytics', deliveryAnalyticsRoutes);
// app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/legal', legalRoutes);
// app.use('/api/safety', safetyRoutes);
// app.use('/api/disputes', disputeRoutes);
// app.use('/api/moderation', moderationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
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
app.use(errorHandler);

const PORT = config.port || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Georgy Backend API server running on port ${PORT}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`💊 Health Check: http://localhost:${PORT}/health`);
  console.log(`⚠️  Note: Advanced services temporarily disabled for stability`);
});

export default app;
