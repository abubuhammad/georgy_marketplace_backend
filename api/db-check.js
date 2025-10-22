const { Client } = require('pg');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    // Test basic query
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('Time query result:', timeResult.rows[0]);

    // Check database version
    const versionResult = await client.query('SELECT version() as db_version');
    console.log('Version query result:', versionResult.rows[0]);

    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Tables found:', tablesResult.rows.length);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      connection: 'successful',
      database: {
        current_time: timeResult.rows[0].current_time,
        version: versionResult.rows[0].db_version.substring(0, 50) + '...',
        tables_count: tablesResult.rows.length,
        tables: tablesResult.rows.map(row => row.table_name).slice(0, 10)
      },
      message: 'Vercel is successfully connected to Supabase!'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Database connection failed:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
      database_url_set: !!process.env.DATABASE_URL
    });
  } finally {
    try {
      await client.end();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error closing connection:', error);
    }
  }
};