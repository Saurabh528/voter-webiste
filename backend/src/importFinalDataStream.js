import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the final corrected CSV file
const CSV_FILE_PATH = path.join(__dirname, '../../../advocates_voter_list_corrected.csv');

async function importFinalDataStream() {
  console.log('🗑️ Clearing existing voter data...');
  const client = await pool.connect();
  await client.query('DELETE FROM voters');
  client.release();
  
  console.log('📊 Starting streaming import of final corrected voter data...');
  
  let rowCount = 0;
  const batchSize = 25; // Very small batch size
  
  return new Promise((resolve, reject) => {
    const rows = [];
    
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // Clean the data
        const cleanRow = {
          district: (row.DISTRICT || '').replace(/[<>'"`;]/g, '').trim(),
          enrolment_no: (row.enrolment_no || '').replace(/[<>'"`;]/g, '').trim(),
          reg_year: parseFloat(row.reg_year) || null,
          name: (row.NAME || '').replace(/[<>'"`;]/g, '').trim(),
          father_name: (row.Father_Name || '').replace(/[<>'"`;]/g, '').trim(),
          dob: parseDate(row.dob),
          address: (row.ADDRESS || '').replace(/[<>'"`;]/g, '').trim(),
          age: parseFloat(row.age) || null,
          community: (row.COMMUNITY || '').replace(/[<>'"`;]/g, '').trim(),
          phone: (row.phone || '').replace(/[^\d\s+\-]/g, '').substring(0, 20),
          residence_no: (row.residence_no || '').replace(/[<>'"`;]/g, '').trim(),
          office_no: (row.office_no || '').replace(/[<>'"`;]/g, '').trim(),
          office_address: (row.office_address || '').replace(/[<>'"`;]/g, '').trim(),
          chamber_address: (row.chamber_address || '').replace(/[<>'"`;]/g, '').trim(),
          email: sanitizeEmail(row.email),
          cop_no: (row.COP_NO || '').replace(/[<>'"`;]/g, '').trim(),
          pincode: (row.pincode || '').replace(/[<>'"`;]/g, '').trim(),
          sub_district: (row.SUB_DISTRICT || '').replace(/[<>'"`;]/g, '').trim()
        };
        
        rows.push(cleanRow);
        
        if (rows.length >= batchSize) {
          processBatch(rows.splice(0, batchSize))
            .then((count) => {
              rowCount += count;
              console.log(`📝 Imported ${rowCount} records...`);
            })
            .catch((error) => {
              console.error('Batch error:', error);
              reject(error);
            });
        }
      })
      .on('end', async () => {
        try {
          // Process remaining rows
          if (rows.length > 0) {
            const count = await processBatch(rows);
            rowCount += count;
          }
          
          console.log(`✅ Successfully imported ${rowCount} voter records`);
          resolve(rowCount);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

function sanitizeEmail(email) {
  if (!email) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.replace(/[<>'"`;]/g, '').trim();
  return emailRegex.test(cleaned) ? cleaned : '';
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
    return batch.length;
    
  } finally {
    client.release();
  }
}

// Run the import
importFinalDataStream()
  .then((count) => {
    console.log(`🎉 Stream import completed! ${count} records imported.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Stream import failed:', error);
    process.exit(1);
  });
