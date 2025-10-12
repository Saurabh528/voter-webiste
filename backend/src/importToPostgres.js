import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { initializeSchema } from './db.js';
import { normalizeName } from './bilingualHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Excel data to PostgreSQL
async function importVotersToPostgres() {
  const client = await pool.connect();
  
  try {
    // Initialize schema first
    await initializeSchema();
    
    // Check if data already exists
    const countResult = await client.query('SELECT COUNT(*) FROM voters');
    const existingCount = parseInt(countResult.rows[0].count);
    
    if (existingCount > 0) {
      console.log(`\n⚠️  Database already has ${existingCount} records.`);
      console.log('Do you want to:');
      console.log('  1. Skip import (keep existing data)');
      console.log('  2. Clear and re-import (destructive)');
      console.log('\nTo re-import, first run: DELETE FROM voters;');
      return;
    }
    
    // Define all Excel files to load
    const excelFiles = [
      path.join(__dirname, '../../2025-09-24-Cop(1st).xlsx'),
      path.join(__dirname, '../../2025-09-24-Cop (2nd).xlsx'),
      path.join(__dirname, '../../2025-09-24-Cop (3rd).xlsx')
    ];
    
    console.log('\n📊 Starting import of 3 Excel files to PostgreSQL...\n');
    
    let totalImported = 0;
    let totalSkipped = 0;
    
    // Start transaction for better performance
    await client.query('BEGIN');
    
    // Load each Excel file
    for (let fileIndex = 0; fileIndex < excelFiles.length; fileIndex++) {
      const excelPath = excelFiles[fileIndex];
      
      if (!fs.existsSync(excelPath)) {
        console.log(`⚠️  File ${fileIndex + 1} not found: ${path.basename(excelPath)}`);
        continue;
      }
      
      console.log(`Loading file ${fileIndex + 1}: ${path.basename(excelPath)}`);
      
      const workbook = xlsx.readFile(excelPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      console.log(`  Found ${jsonData.length} records`);
      
      let imported = 0;
      let skipped = 0;
      
      // Insert records in batches for better performance
      const batchSize = 100;
      for (let i = 0; i < jsonData.length; i += batchSize) {
        const batch = jsonData.slice(i, i + batchSize);
        
        for (const row of batch) {
          try {
            const enrollmentNo = (row.enrolment_no || row.enrollmentNo || '').toString().trim();
            
            if (!enrollmentNo) {
              skipped++;
              continue;
            }
            
            const name = (row.NAME || row.name || '').toString();
            const nameNormalized = normalizeName(name);
            
            await client.query(`
              INSERT INTO voters (
                original_id, enrollment_no, enrollment_date, cop_no,
                name, name_normalized, father_name, address,
                district, voter_district, practice_bar,
                normal_place_of_practice, date_of_birth,
                mobile, member_name, remark, form_status, source_file
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
              ON CONFLICT (enrollment_no) DO NOTHING
            `, [
              (row.ID || '').toString(),
              enrollmentNo,
              (row.enrolment_date || row.enrollmentDate || '').toString(),
              (row.COP_NO || row.copNo || '').toString(),
              name,
              nameNormalized,
              (row.Father_Name || row.fatherName || '').toString(),
              (row.ADDRESS || row.address || '').toString(),
              (row.DISTRICT || row.district || '').toString(),
              (row.VOTER_DISTRICT || row.voterDistrict || '').toString(),
              (row.Practice_bar || row.practiceBar || '').toString(),
              (row.Normal_place_of_practice || row.normalPlaceOfPractice || '').toString(),
              (row.date_of_birth || row.dateOfBirth || '').toString(),
              (row.MOB || row.mobile || '').toString(),
              (row.Member_Name || row.memberName || '').toString(),
              (row.Remark || row.remark || '').toString(),
              (row.form_status || row.formStatus || '').toString(),
              path.basename(excelPath)
            ]);
            
            imported++;
          } catch (err) {
            // Duplicate or error, skip
            skipped++;
          }
        }
        
        // Show progress
        if ((i + batchSize) % 1000 === 0) {
          process.stdout.write(`  Progress: ${Math.min(i + batchSize, jsonData.length)}/${jsonData.length}\r`);
        }
      }
      
      console.log(`  ✅ Imported ${imported} records, skipped ${skipped} duplicates\n`);
      totalImported += imported;
      totalSkipped += skipped;
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Get final count
    const finalCount = await client.query('SELECT COUNT(*) FROM voters');
    
    console.log(`\n🎉 IMPORT COMPLETE!`);
    console.log(`   Total records in database: ${finalCount.rows[0].count}`);
    console.log(`   New records imported: ${totalImported}`);
    console.log(`   Duplicates skipped: ${totalSkipped}`);
    
    // Show some stats
    const districtStats = await client.query(`
      SELECT district, COUNT(*) as count 
      FROM voters 
      WHERE district != '' 
      GROUP BY district 
      ORDER BY count DESC 
      LIMIT 5
    `);
    
    console.log(`\n📊 Top 5 Districts:`);
    districtStats.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.district}: ${row.count} voters`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error importing data:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('importToPostgres.js')) {
  console.log('🚀 Starting PostgreSQL import...\n');
  importVotersToPostgres()
    .then(() => {
      console.log('\n✅ Import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Import failed:', error);
      process.exit(1);
    });
}

export default importVotersToPostgres;

