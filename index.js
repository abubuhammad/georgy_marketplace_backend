// Main entrypoint for Vercel deployment
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Georgy Marketplace Backend API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    version: '1.0.0'
  });
});

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
});

// Database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    // This endpoint will initialize the database
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    if (!process.env.DATABASE_URL) {
      return res.status(400).json({
        error: 'DATABASE_URL not configured',
        message: 'Please set DATABASE_URL in environment variables'
      });
    }
    
    // Run Prisma commands to set up database
    await execAsync('npx prisma generate');
    await execAsync('npx prisma db push --force-reset');
    
    res.json({
      status: 'success',
      message: 'Database initialized successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      error: 'Database initialization failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Catch all API routes
app.all('/api/*', (req, res) => {
  res.json({
    message: 'Georgy Marketplace API endpoint',
    endpoint: req.path,
    method: req.method,
    status: 'coming soon',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Georgy Marketplace Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `${req.method} ${req.originalUrl} not found`,
    availableEndpoints: ['/', '/health', '/api/health'],
    timestamp: new Date().toISOString()
  });
});

// For Vercel
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}
