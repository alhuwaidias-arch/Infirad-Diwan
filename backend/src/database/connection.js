// Database Connection Module
const { Pool } = require('pg');
const dns = require('dns');

// Force IPv4 resolution to avoid IPv6 connectivity issues
dns.setDefaultResultOrder('ipv4first');

// Create connection pool
// Supports both DATABASE_URL (Render/Heroku style) and individual variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Test connection
async function connectDatabase() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('Database connected at:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

// Query function
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Query executed:', { text: text.substring(0, 100), duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Get a client from the pool (for transactions)
async function getClient() {
  return await pool.connect();
}

// Graceful shutdown
async function closePool() {
  await pool.end();
  console.log('Database pool closed');
}

module.exports = {
  connectDatabase,
  query,
  getClient,
  closePool,
  pool
};
