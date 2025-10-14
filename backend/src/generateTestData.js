import { Pool } from 'pg';

// Create a dedicated connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/voter_registration',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
});

console.log('🚀 Generating test voter data...');

// Sample voter data for testing
const testVoters = [
  {
    enrolment_no: 'UP04815/22',
    name: 'ARUN KUMAR TRIPATHI',
    cop_no: 'COP001234',
    address: '123 Main Street, Varanasi',
    district: 'VARANASI',
    father_name: 'RAM TRIPATHI',
    phone: '9415300191',
    reg_year: '2022',
    age: '35',
    community: 'General'
  },
  {
    enrolment_no: 'UP10579/13',
    name: 'ANITA KUMARI',
    cop_no: null,
    address: '456 Park Road, Lucknow',
    district: 'LUCKNOW',
    father_name: 'SURESH KUMAR',
    phone: '7905748686',
    reg_year: '2013',
    age: '28',
    community: 'OBC'
  },
  {
    enrolment_no: 'UP12345/20',
    name: 'RAJESH SHARMA',
    cop_no: 'COP005678',
    address: '789 Gandhi Nagar, Kanpur',
    district: 'KANPUR NAGAR',
    father_name: 'MOHAN SHARMA',
    phone: '9415451856',
    reg_year: '2020',
    age: '42',
    community: 'SC'
  },
  {
    enrolment_no: 'UP99999/21',
    name: 'PRIYA SINGH',
    cop_no: null,
    address: '321 Nehru Place, Agra',
    district: 'AGRA',
    father_name: 'VIJAY SINGH',
    phone: '9415819786',
    reg_year: '2021',
    age: '31',
    community: 'General'
  },
  {
    enrolment_no: 'UP4815/22',
    name: 'TEST VOTER',
    cop_no: 'COP009999',
    address: 'Test Address, Test City',
    district: 'VARANASI',
    father_name: 'TEST FATHER',
    phone: '9721777720',
    reg_year: '2022',
    age: '30',
    community: 'General'
  }
];

async function generateTestData() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️ Clearing existing voter data...');
    await client.query('TRUNCATE TABLE voters RESTART IDENTITY CASCADE;');
    
    console.log('📊 Inserting test voter data...');
    
    for (const voter of testVoters) {
      const query = `
        INSERT INTO voters (
          enrolment_no, name, cop_no, address, district, 
          father_name, phone, reg_year, age, community
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;
      
      await client.query(query, [
        voter.enrolment_no,
        voter.name,
        voter.cop_no,
        voter.address,
        voter.district,
        voter.father_name,
        voter.phone,
        voter.reg_year,
        voter.age,
        voter.community
      ]);
    }
    
    console.log(`✅ Successfully inserted ${testVoters.length} test voter records`);
    
    // Verify the data
    const result = await client.query('SELECT COUNT(*) FROM voters');
    console.log(`📊 Total voters in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
generateTestData()
  .then(() => {
    console.log('🎉 Test data generation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test data generation failed:', error);
    process.exit(1);
  });
