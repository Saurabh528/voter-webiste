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
    
    // Check if voters table exists and has data
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'voters'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      const countResult = await client.query('SELECT COUNT(*) FROM voters');
      const count = parseInt(countResult.rows[0].count);
      
      if (count > 0) {
        console.log(`✅ Voters table exists with ${count} records - skipping schema recreation`);
        return;
      }
    }
    
    // Drop existing voters table only if it's empty or doesn't exist
    await client.query('DROP TABLE IF EXISTS voters CASCADE');
    
    // Create voters table with new schema matching the final CSV
    await client.query(`
      CREATE TABLE voters (
        id SERIAL PRIMARY KEY,
        district VARCHAR(100),
        enrolment_no VARCHAR(100) NOT NULL,
        reg_year DECIMAL(5,1),
        name VARCHAR(255) NOT NULL,
        father_name VARCHAR(255),
        dob DATE,
        address TEXT,
        age DECIMAL(5,1),
        community VARCHAR(100),
        phone VARCHAR(20),
        residence_no VARCHAR(50),
        office_no VARCHAR(50),
        office_address TEXT,
        chamber_address TEXT,
        email VARCHAR(255),
        cop_no VARCHAR(50),
        pincode VARCHAR(10),
        sub_district VARCHAR(100),
        sl_no VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for fast searching
    await client.query(`
      CREATE INDEX idx_enrolment_no ON voters(enrolment_no);
      CREATE INDEX idx_name ON voters(name);
      CREATE INDEX idx_district ON voters(district);
      CREATE INDEX idx_cop_no ON voters(cop_no);
      CREATE INDEX idx_phone ON voters(phone);
      CREATE INDEX idx_sub_district ON voters(sub_district);
    `);
    
    // Create fuzzy search indexes for partial matching
    await client.query(`
      CREATE INDEX idx_enrolment_fuzzy ON voters USING gin(to_tsvector('english', enrolment_no));
      CREATE INDEX idx_name_fuzzy ON voters USING gin(to_tsvector('english', name));
      CREATE INDEX idx_district_fuzzy ON voters USING gin(to_tsvector('english', district));
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

