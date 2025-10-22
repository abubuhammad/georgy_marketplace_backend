const { Client } = require('pg');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Try connection pooling endpoint (port 6543)
  const pooledUrl = process.env.DATABASE_URL.replace(':5432', ':6543');
  
  const client = new Client({
    connectionString: pooledUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to Supabase with connection pooling...');
    await client.connect();
    console.log('Connected successfully via pooled connection!');

    // Test basic query
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('Time query result:', timeResult.rows[0]);

    // Check existing tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      connection: 'successful via connection pooling',
      database: {
        current_time: timeResult.rows[0].current_time,
        tables_count: tablesResult.rows.length,
        tables: tablesResult.rows.map(row => row.table_name).slice(0, 10)
      },
      message: 'Vercel connected to Supabase via connection pooling!'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Pooled connection failed:', error);
    
    // If pooled fails, try direct connection with SSL
    const directClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      console.log('Trying direct connection with SSL...');
      await directClient.connect();
      
      const timeResult = await directClient.query('SELECT NOW() as current_time');
      
      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        connection: 'successful via direct connection with SSL',
        database: {
          current_time: timeResult.rows[0].current_time
        },
        message: 'Direct SSL connection worked!'
      });
      
      await directClient.end();
      
    } catch (directError) {
      res.status(500).json({
        success: false,
        pooled_error: error.message,
        direct_error: directError.message,
        timestamp: new Date().toISOString(),
        tried: ['connection_pooling_port_6543', 'direct_ssl_connection']
      });
    }
  } finally {
    try {
      await client.end();
    } catch (error) {
      console.error('Error closing pooled connection:', error);
    }
  }
};