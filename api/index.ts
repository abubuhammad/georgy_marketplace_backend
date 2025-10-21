import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
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
      version: '1.0.0'
    });
  }

  // Handle API routes
  if (url?.startsWith('/api/')) {
    return res.status(200).json({
      message: 'API endpoint working',
      endpoint: url,
      method: method,
      timestamp: new Date().toISOString()
    });
  }

  // Default response
  res.status(404).json({
    error: 'Not Found',
    message: `${method} ${url} is not a valid endpoint`,
    availableEndpoints: ['/health', '/api/health']
  });
}