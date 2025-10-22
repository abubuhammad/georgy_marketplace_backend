module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    const jwtSecret = process.env.JWT_SECRET;
    
    // Mask sensitive data
    const dbUrlMasked = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'Not set';
    const jwtMasked = jwtSecret ? jwtSecret.substring(0, 10) + '...' : 'Not set';

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      vercel_region: process.env.VERCEL_REGION || 'unknown',
      environment: {
        NODE_ENV: nodeEnv || 'not set',
        DATABASE_URL: dbUrlMasked,
        JWT_SECRET: jwtMasked,
        VERCEL: process.env.VERCEL || 'false'
      },
      connection_test: 'Environment check passed - ready for database test'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Environment test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};