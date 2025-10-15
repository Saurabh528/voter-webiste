/**
 * High-performance CSV → PostgreSQL importer for massive datasets (4M+ rows)
 * Author: SamvedyaAI (Refined by GPT-5)
 *
 * Key Features:
 *  - Uses PostgreSQL COPY protocol for maximum throughput
 *  - Stream-based CSV parsing and sanitization (no memory buildup)
 *  - Robust error handling and graceful exit
 *  - Supports both local and cloud (Heroku, Render, Railway, etc.)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import csv from 'csv-parser';
import copyFrom from 'pg-copy-streams';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Try multiple possible paths for different deployment environments
const possiblePaths = [
  // Production paths - we're in /opt/render/project/src/backend, CSV files are in /opt/render/project/src/
  path.join(process.cwd(), '../advocates_voter_list_corrected.csv'),
  path.join(process.cwd(), '../sample_voter_data.csv'),
  // Alternative absolute paths
  '/opt/render/project/src/advocates_voter_list_corrected.csv',
  '/opt/render/project/src/sample_voter_data.csv',
  // Local development path
  path.join(__dirname, '../../../advocates_voter_list_corrected.csv'),
  path.join(__dirname, '../../../sample_voter_data.csv')
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

// Setup DB pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/voter_registration',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 60000,
  statement_timeout: 0, // no limit
});

/* ---------- SANITIZATION HELPERS ---------- */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
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
  if (!dateStr || typeof dateStr !== 'string') return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
}

/* ---------- MAIN IMPORT FUNCTION ---------- */
async function importLargeDataset() {
  console.log('🚀 Starting massive dataset import (streamed COPY)...');
  console.log('🗑️  Clearing existing voter data...');

  const client = await pool.connect();

  try {
    await client.query('TRUNCATE TABLE voters RESTART IDENTITY');
    console.log('✅ Table cleared.');

    // Create COPY stream to PostgreSQL
    const copyStream = client.query(copyFrom.from(`
      COPY voters (
        district, enrolment_no, reg_year, name, father_name, dob, address, age,
        community, phone, residence_no, office_no, office_address, chamber_address,
        email, cop_no, pincode, sub_district, sl_no
      ) FROM STDIN WITH (FORMAT csv)
    `));

    let count = 0;

    // Create transform stream: CSV → Sanitized CSV line
    const transform = new (class extends Transform {
      constructor() {
        super({ objectMode: true });
      }
      _transform(row, _, callback) {
        try {
          // Skip rows with missing critical data
          const enrollmentNo = sanitizeInput(row.enrolment_no);
          const name = sanitizeInput(row.NAME);
          
          if (!enrollmentNo || !name) {
            // Skip rows without enrollment number or name
            callback();
            return;
          }

          const clean = [
            sanitizeInput(row.DISTRICT),
            enrollmentNo,
            parseFloat(row.reg_year) || '',
            name,
            sanitizeInput(row.Father_Name),
            sanitizeDate(row.dob),
            sanitizeInput(row.ADDRESS),
            parseFloat(row.age) || '',
            sanitizeInput(row.COMMUNITY),
            sanitizePhone(row.phone),
            sanitizeInput(row.residence_no),
            sanitizeInput(row.office_no),
            sanitizeInput(row.office_address),
            sanitizeInput(row.chamber_address),
            sanitizeEmail(row.email),
            sanitizeInput(row.COP_NO),
            sanitizeInput(row.pincode),
            sanitizeInput(row.SUB_DISTRICT),
            sanitizeInput(row.Sl_No || ''),
          ];

          count++;
          if (count % 100000 === 0)
            console.log(`📈 Processed ${count.toLocaleString()} rows so far...`);

          // Properly escape CSV values
          const escaped = clean.map(value => {
            if (value === null || value === undefined) return '';
            const str = String(value);
            // If value contains comma, quote, or newline, wrap in quotes and escape quotes
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
              return '"' + str.replace(/"/g, '""') + '"';
            }
            return str;
          });

          callback(null, escaped.join(',') + '\n');
        } catch (err) {
          console.error('⚠️ Error sanitizing row:', err);
          callback(); // skip row
        }
      }
    })();

    // Run full stream pipeline
    await pipeline(
      fs.createReadStream(CSV_FILE_PATH),
      csv(),
      transform,
      copyStream
    );

    console.log(`✅ Successfully imported ${count.toLocaleString()} records!`);

    const res = await client.query('SELECT COUNT(*) as total FROM voters');
    console.log(`📊 Final database count: ${res.rows[0].total} voters`);

  } catch (err) {
    console.error('💥 Import failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

/* ---------- GLOBAL SAFETY ---------- */
process.on('uncaughtException', (err) => {
  console.error('🚨 Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('🚨 Unhandled promise rejection:', err);
  process.exit(1);
});

/* ---------- RUN ---------- */
importLargeDataset()
  .then(() => {
    console.log('🎉 Import process finished cleanly.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💣 Fatal error during import:', err);
    process.exit(1);
  });
