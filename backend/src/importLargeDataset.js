import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a dedicated connection pool for large dataset import
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/voter_registration',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // More connections for faster import
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 30000,
  statement_timeout: 300000, // 5 minutes per statement
});

// Path to the final corrected CSV file
// Try multiple possible paths for different deployment environments
const possiblePaths = [
  // Production paths
  '/opt/render/project/advocates_voter_list_corrected.csv',
  path.join(process.cwd(), '../../advocates_voter_list_corrected.csv'),
  path.join(process.cwd(), '../../../advocates_voter_list_corrected.csv'),
  // Local development path
  path.join(__dirname, '../../../advocates_voter_list_corrected.csv')
];

// Find the first existing file
let CSV_FILE_PATH = null;
for (const testPath of possiblePaths) {
  try {
    if (fs.existsSync(testPath)) {
      CSV_FILE_PATH = testPath;
      break;
    }
  } catch (error) {
    // Continue to next path
  }
}

// Debug: Log the path being used
console.log('🔍 Current working directory:', process.cwd());
console.log('🔍 __dirname:', __dirname);
console.log('🔍 CSV_FILE_PATH found:', CSV_FILE_PATH);

// Check if file exists
if (!CSV_FILE_PATH || !fs.existsSync(CSV_FILE_PATH)) {
  console.error('❌ CSV file not found! Tried paths:', possiblePaths);
  process.exit(1);
}

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

async function importLargeDataset() {
  console.log('🚀 Starting large dataset import (4M+ records)...');
  console.log('🗑️ Clearing existing voter data...');
  
  const client = await pool.connect();
  await client.query('DELETE FROM voters');
  client.release();
  
  console.log('📊 Starting optimized import of large dataset...');
  
  let rowCount = 0;
  const batchSize = 500; // Larger batch size for efficiency
  const maxBatches = 100; // Process in chunks to avoid memory issues
  let batchNumber = 0;
  
  return new Promise((resolve, reject) => {
    const rows = [];
    let isProcessing = false;
    
    const stream = fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', async (row) => {
        // Clean the data
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
        
        rows.push(cleanRow);
        
        // Process batch when it reaches the batch size
        if (rows.length >= batchSize && !isProcessing) {
          isProcessing = true;
          const batchToProcess = rows.splice(0, batchSize);
          
          try {
            await processBatch(batchToProcess);
            rowCount += batchToProcess.length;
            batchNumber++;
            
            console.log(`📝 Processed batch ${batchNumber}: ${rowCount} total records imported...`);
            
            // Pause briefly every 10 batches to prevent overwhelming the database
            if (batchNumber % 10 === 0) {
              console.log(`⏸️  Pausing briefly after ${batchNumber} batches...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            isProcessing = false;
          } catch (error) {
            console.error(`❌ Error processing batch ${batchNumber}:`, error);
            isProcessing = false;
            // Continue with next batch instead of failing completely
          }
        }
      })
      .on('end', async () => {
        try {
          // Process remaining rows
          if (rows.length > 0) {
            await processBatch(rows);
            rowCount += rows.length;
            batchNumber++;
            console.log(`📝 Final batch ${batchNumber}: ${rowCount} total records imported...`);
          }
          
          console.log(`✅ Successfully imported ${rowCount} voter records from large dataset`);
          
          // Get final count
          const finalClient = await pool.connect();
          const result = await finalClient.query('SELECT COUNT(*) as total FROM voters');
          finalClient.release();
          
          console.log(`📊 Final database count: ${result.rows[0].total} voters`);
          resolve(rowCount);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('❌ Stream error:', error);
        reject(error);
      });
  });
}

async function processBatch(batch) {
  const client = await pool.connect();
  
  try {
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
    
  } finally {
    client.release();
  }
}

// Run the import
importLargeDataset()
  .then((count) => {
    console.log(`🎉 Large dataset import completed! ${count} records imported.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Large dataset import failed:', error);
    process.exit(1);
  });
