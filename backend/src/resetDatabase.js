import pool from './db.js';

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️ Dropping existing tables...');
    
    // Drop all existing tables
    await client.query('DROP TABLE IF EXISTS search_logs CASCADE');
    await client.query('DROP TABLE IF EXISTS phone_captures CASCADE');
    await client.query('DROP TABLE IF EXISTS voters CASCADE');
    
    console.log('✅ Tables dropped successfully');
    
    // Create voters table with correct schema matching the CSV
    console.log('📊 Creating voters table with new schema...');
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for fast searching
    console.log('🔍 Creating indexes...');
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
    console.log('📝 Creating search_logs table...');
    await client.query(`
      CREATE TABLE search_logs (
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
    console.log('📱 Creating phone_captures table...');
    await client.query(`
      CREATE TABLE phone_captures (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(20) NOT NULL,
        source VARCHAR(50),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database reset and schema created successfully');
    
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('🎉 Database reset completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database reset failed:', error);
    process.exit(1);
  });
