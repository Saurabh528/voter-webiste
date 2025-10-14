import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a dedicated connection pool for import
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/voter_registration',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 5, // Limit connections for import
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Path to the final corrected CSV file
const CSV_FILE_PATH = path.join(__dirname, '../../../advocates_voter_list_corrected.csv');

/**
 * Sanitizes input to prevent SQL injection
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>'"`;]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi, '')
    .trim()
    .substring(0, 255);
}

function sanitizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  const cleaned = phone.replace(/[^\d\s+\-]/g, '');
  return cleaned.substring(0, 20);
}

function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = sanitizeInput(email);
  return emailRegex.test(cleaned) ? cleaned : '';
}

function sanitizeDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

async function importFinalData() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️ Clearing existing voter data...');
    await client.query('DELETE FROM voters');
    
    console.log('📊 Starting optimized import of final corrected voter data...');
    
    let rowCount = 0;
    const batchSize = 50; // Small batch size for stability
    let batch = [];
    
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Clean and validate data
            const cleanRow = {
              district: sanitizeInput(row.DISTRICT || ''),
              enrolment_no: sanitizeInput(row.enrolment_no || ''),
              reg_year: parseFloat(row.reg_year) || null,
              name: sanitizeInput(row.NAME || ''),
              father_name: sanitizeInput(row.Father_Name || ''),
              dob: sanitizeDate(row.dob),
              address: sanitizeInput(row.ADDRESS || ''),
              age: parseFloat(row.age) || null,
              community: sanitizeInput(row.COMMUNITY || ''),
              phone: sanitizePhone(row.phone),
              residence_no: sanitizeInput(row.residence_no || ''),
              office_no: sanitizeInput(row.office_no || ''),
              office_address: sanitizeInput(row.office_address || ''),
              chamber_address: sanitizeInput(row.chamber_address || ''),
              email: sanitizeEmail(row.email),
              cop_no: sanitizeInput(row.COP_NO || ''),
              pincode: sanitizeInput(row.pincode || ''),
              sub_district: sanitizeInput(row.SUB_DISTRICT || '')
            };
            
            batch.push(cleanRow);
            
            if (batch.length >= batchSize) {
              // Process batch synchronously
              insertBatch(client, batch)
                .then(() => {
                  rowCount += batch.length;
                  console.log(`📝 Imported ${rowCount} records...`);
                })
                .catch((error) => {
                  console.error('Error inserting batch:', error);
                  stream.destroy();
                  reject(error);
                });
              
              batch = [];
            }
          } catch (error) {
            console.error('Error processing row:', error);
          }
        })
        .on('end', async () => {
          try {
            // Insert remaining records
            if (batch.length > 0) {
              await insertBatch(client, batch);
              rowCount += batch.length;
            }
            
            console.log(`✅ Successfully imported ${rowCount} voter records from final corrected CSV`);
            
            // Update statistics
            const result = await client.query('SELECT COUNT(*) as total FROM voters');
            console.log(`📊 Total voters in database: ${result.rows[0].total}`);
            
            resolve(rowCount);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('Stream error:', error);
          reject(error);
        });
    });
    
  } catch (error) {
    console.error('❌ Error importing final data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function insertBatch(client, batch) {
  if (batch.length === 0) return;
  
  const values = [];
  const placeholders = [];
  
  batch.forEach((row, index) => {
    const baseIndex = index * 18;
    placeholders.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9}, $${baseIndex + 10}, $${baseIndex + 11}, $${baseIndex + 12}, $${baseIndex + 13}, $${baseIndex + 14}, $${baseIndex + 15}, $${baseIndex + 16}, $${baseIndex + 17}, $${baseIndex + 18})`);
    
    values.push(
      row.district, row.enrolment_no, row.reg_year, row.name, row.father_name,
      row.dob, row.address, row.age, row.community, row.phone,
      row.residence_no, row.office_no, row.office_address, row.chamber_address,
      row.email, row.cop_no, row.pincode, row.sub_district
    );
  });
  
  const query = `
    INSERT INTO voters (
      district, enrolment_no, reg_year, name, father_name, dob, address, age, 
      community, phone, residence_no, office_no, office_address, chamber_address, 
      email, cop_no, pincode, sub_district
    ) VALUES ${placeholders.join(', ')}
  `;
  
  await client.query(query, values);
}

// Run the import
importFinalData()
  .then((count) => {
    console.log(`🎉 Import completed successfully! ${count} records imported.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });
