import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/voter_registration',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
});

// Initialize database schema
export async function initializeSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Initializing database schema...');
    
    // Create voters table
    await client.query(`
      CREATE TABLE IF NOT EXISTS voters (
        id SERIAL PRIMARY KEY,
        original_id VARCHAR(50),
        enrollment_no VARCHAR(100) UNIQUE NOT NULL,
        enrollment_date VARCHAR(50),
        cop_no VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        name_normalized VARCHAR(255),
        father_name VARCHAR(255),
        address TEXT,
        district VARCHAR(100),
        voter_district VARCHAR(100),
        practice_bar TEXT,
        normal_place_of_practice TEXT,
        date_of_birth VARCHAR(50),
        mobile VARCHAR(20),
        member_name VARCHAR(100),
        remark VARCHAR(100),
        form_status VARCHAR(50),
        source_file VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for fast searching
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_enrollment_no ON voters(enrollment_no);
      CREATE INDEX IF NOT EXISTS idx_name ON voters(name);
      CREATE INDEX IF NOT EXISTS idx_name_normalized ON voters(name_normalized);
      CREATE INDEX IF NOT EXISTS idx_district ON voters(district);
      CREATE INDEX IF NOT EXISTS idx_cop_no ON voters(cop_no);
      CREATE INDEX IF NOT EXISTS idx_mobile ON voters(mobile);
    `);
    
    // Create search_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS search_logs (
        id SERIAL PRIMARY KEY,
        search_type VARCHAR(50),
        enrollment_number VARCHAR(100),
        name_searched VARCHAR(255),
        district_searched VARCHAR(100),
        phone_number VARCHAR(20),
        result_found BOOLEAN,
        results_count INTEGER,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create phone_captures table
    await client.query(`
      CREATE TABLE IF NOT EXISTS phone_captures (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL,
        source VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database schema initialized');
    
  } catch (error) {
    console.error('Error initializing schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get total voter count
export async function getVoterCount() {
  const result = await pool.query('SELECT COUNT(*) FROM voters');
  return parseInt(result.rows[0].count);
}

// Check if voters table has data
export async function hasVoterData() {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM voters LIMIT 1');
    return parseInt(result.rows[0].count) > 0;
  } catch (error) {
    return false;
  }
}

export default pool;

