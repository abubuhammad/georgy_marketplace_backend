const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Testing database connection...');
    
    // Test 1: Basic connection
    const connectionTest = await prisma.$queryRaw`SELECT NOW() as current_time, version() as db_version`;
    console.log('Connection test result:', connectionTest);

    // Test 2: Check if tables exist
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    console.log('Tables found:', tableCheck);

    // Test 3: Try to count users (if table exists)
    let userCount = 0;
    try {
      userCount = await prisma.user.count();
      console.log('User count:', userCount);
    } catch (error) {
      console.log('Users table does not exist yet:', error.message);
    }

    // Test 4: Environment check
    const dbUrl = process.env.DATABASE_URL;
    const dbUrlMasked = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'Not set';

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      tests: {
        connection: {
          status: 'success',
          current_time: connectionTest[0]?.current_time,
          db_version: connectionTest[0]?.db_version?.substring(0, 50) + '...'
        },
        tables: {
          status: 'success',
          count: tableCheck.length,
          tables: tableCheck.map(t => t.table_name).slice(0, 10) // First 10 tables
        },
        users: {
          status: userCount >= 0 ? 'success' : 'table_not_found',
          count: userCount
        },
        environment: {
          database_url: dbUrlMasked,
          node_env: process.env.NODE_ENV || 'development'
        }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Database test failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: {
        database_url: process.env.DATABASE_URL ? 'Set' : 'Not set',
        node_env: process.env.NODE_ENV || 'development'
      }
    });
  } finally {
    await prisma.$disconnect();
  }
};