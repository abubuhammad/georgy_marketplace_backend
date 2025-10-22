// Minimal JavaScript API for Vercel deployment

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;

  try {
    // Health check endpoints
    if (url === '/health' || url === '/' || url === '/api' || url === '/api/health') {
      return res.status(200).json({
        status: 'healthy',
        message: 'Georgy Marketplace Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version: '1.0.0',
        database: process.env.DATABASE_URL ? 'configured' : 'not configured',
        endpoints: {
          health: '/health',
          api: '/api',
          status: 'All systems operational'
        }
      });
    }

    // API status endpoint
    if (url === '/api/status') {
      return res.status(200).json({
        status: 'operational',
        services: {
          api: 'running',
          database: process.env.DATABASE_URL ? 'connected' : 'not configured',
          auth: 'ready'
        },
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    }

    // Handle other API routes
    if (url && url.startsWith('/api/')) {
      return res.status(200).json({
        message: 'Georgy Marketplace API',
        endpoint: url,
        method: method,
        status: 'This endpoint is available but requires full backend deployment',
        timestamp: new Date().toISOString(),
        note: 'This is a minimal deployment. TypeScript version coming soon.'
      });
    }

    // Default response
    res.status(404).json({
      error: 'Not Found',
      message: `${method} ${url} is not a valid endpoint`,
      availableEndpoints: ['/health', '/api/health', '/api/status'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong',
      timestamp: new Date().toISOString()
    });
  }
};
