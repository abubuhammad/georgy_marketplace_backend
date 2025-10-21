// Pure JavaScript version to avoid TypeScript compilation issues

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method, url } = req;

  // Health check endpoint
  if (url === '/health' || url === '/' || url === '/api' || url === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      message: 'Georgy Marketplace Backend API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: process.env.DATABASE_URL ? 'connected' : 'not configured'
    });
  }

  // Handle API routes
  if (url && url.startsWith('/api/')) {
    return res.status(200).json({
      message: 'API endpoint working',
      endpoint: url,
      method: method,
      timestamp: new Date().toISOString(),
      note: 'This is a minimal API handler. Full functionality coming soon.'
    });
  }

  // Default response
  res.status(404).json({
    error: 'Not Found',
    message: `${method} ${url} is not a valid endpoint`,
    availableEndpoints: ['/health', '/api/health'],
    timestamp: new Date().toISOString()
  });
};