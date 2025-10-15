import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/voter_registration',
  ssl: false
});

async function checkAnitaGara() {
  try {
    // Check phone_captures table
    const phoneCapturesResult = await pool.query(
      `SELECT * FROM phone_captures ORDER BY timestamp DESC LIMIT 50`
    );

    console.log('\n=== Phone Numbers Captured from Website ===\n');
    if (phoneCapturesResult.rows.length > 0) {
      phoneCapturesResult.rows.forEach((row, idx) => {
        console.log(`Capture ${idx + 1}:`);
        console.log(`  Phone Number: ${row.phone_number}`);
        console.log(`  Source: ${row.source}`);
        console.log(`  Timestamp: ${row.timestamp}`);
        console.log('');
      });
      console.log(`Total captures: ${phoneCapturesResult.rows.length}\n`);
    } else {
      console.log('No phone captures found\n');
    }

    // Also check search_logs with phone numbers
    const searchLogsResult = await pool.query(
      `SELECT * FROM search_logs WHERE phone_number IS NOT NULL ORDER BY timestamp DESC LIMIT 20`
    );

    console.log('\n=== Search Logs with Phone Numbers ===\n');
    if (searchLogsResult.rows.length > 0) {
      searchLogsResult.rows.forEach((row, idx) => {
        console.log(`Search ${idx + 1}:`);
        console.log(`  Search Type: ${row.search_type}`);
        console.log(`  Name Searched: ${row.name_searched || 'N/A'}`);
        console.log(`  Enrollment: ${row.enrollment_number || 'N/A'}`);
        console.log(`  District: ${row.district_searched || 'N/A'}`);
        console.log(`  Phone Number: ${row.phone_number}`);
        console.log(`  Result Found: ${row.result_found}`);
        console.log(`  Timestamp: ${row.timestamp}`);
        console.log('');
      });
      console.log(`Total search logs with phone: ${searchLogsResult.rows.length}\n`);
    } else {
      console.log('No search logs with phone numbers found\n');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkAnitaGara();
