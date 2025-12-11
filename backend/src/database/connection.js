// Database Connection Module
const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'diwan_maarifa',
  user: process.env.DB_USER || 'diwan_user',
  password: process.env.DB_PASSWORD || 'diwan_password_2024',
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,
  // SSL configuration for Supabase and other cloud providers
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
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
