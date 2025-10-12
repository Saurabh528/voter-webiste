import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Excel data and convert to JSON
function loadVoterData() {
  try {
    // Define all Excel files to load
    const excelFiles = [
      path.join(__dirname, '../../2025-09-24-Cop(1st).xlsx'),
      path.join(__dirname, '../../2025-09-24-Cop (2nd).xlsx'),
      path.join(__dirname, '../../2025-09-24-Cop (3rd).xlsx')
    ];
    
    let allVoters = [];
    const seenEnrollments = new Set(); // Track duplicates
    
    console.log('Loading data from 3 Excel files...\n');
    
    // Load each Excel file
    excelFiles.forEach((excelPath, fileIndex) => {
      try {
        if (!fs.existsSync(excelPath)) {
          console.log(`⚠️  File ${fileIndex + 1} not found: ${path.basename(excelPath)}`);
          return;
        }
        
        console.log(`Loading file ${fileIndex + 1}: ${path.basename(excelPath)}`);
        
        const workbook = xlsx.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = xlsx.utils.sheet_to_json(worksheet);
        
        console.log(`  Found ${jsonData.length} records`);
        
        // Normalize data for consistent querying
        const normalizedRecords = jsonData.map((row, index) => ({
          id: row.ID || `file${fileIndex + 1}_${index + 1}`,
          enrollmentNo: row.enrolment_no || row.enrollmentNo || '',
          enrollmentDate: row.enrolment_date || row.enrollmentDate || '',
          copNo: row.COP_NO || row.copNo || '',
          name: row.NAME || row.name || '',
          fatherName: row.Father_Name || row.fatherName || '',
          address: row.ADDRESS || row.address || '',
          district: row.DISTRICT || row.district || '',
          voterDistrict: row.VOTER_DISTRICT || row.voterDistrict || '',
          practiceBar: row.Practice_bar || row.practiceBar || '',
          normalPlaceOfPractice: row.Normal_place_of_practice || row.normalPlaceOfPractice || '',
          dateOfBirth: row.date_of_birth || row.dateOfBirth || '',
          mobile: row.MOB || row.mobile || '',
          memberName: row.Member_Name || row.memberName || '',
          remark: row.Remark || row.remark || '',
          formStatus: row.form_status || row.formStatus || '',
          sourceFile: path.basename(excelPath)
        }));
        
        // Add to allVoters, skip duplicates based on enrollment number
        let added = 0;
        let skipped = 0;
        
        normalizedRecords.forEach(record => {
          const enrollmentKey = record.enrollmentNo.toString().trim().toUpperCase();
          
          if (enrollmentKey && !seenEnrollments.has(enrollmentKey)) {
            allVoters.push(record);
            seenEnrollments.add(enrollmentKey);
            added++;
          } else if (enrollmentKey) {
            skipped++;
          }
        });
        
        console.log(`  Added ${added} unique records, skipped ${skipped} duplicates\n`);
        
      } catch (error) {
        console.error(`Error loading file ${fileIndex + 1}:`, error.message);
      }
    });
    
    console.log(`\n📊 TOTAL: ${allVoters.length} unique voter records loaded`);
    console.log(`   Duplicates removed: ${seenEnrollments.size - allVoters.length}`);
    
    // Save to JSON file for faster loading
    const jsonPath = path.join(__dirname, '../data/voters.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allVoters, null, 2));
    
    console.log(`✅ Data saved to voters.json`);
    console.log(`\nSample record from combined database:`);
    console.log(allVoters[0]);
    
    return allVoters;
  } catch (error) {
    console.error('Error loading voter data:', error);
    throw error;
  }
}

export default loadVoterData;

// Run if called directly (check if this is the main module)
if (process.argv[1] && process.argv[1].endsWith('loadData.js')) {
  console.log('Running data loader...');
  loadVoterData();
}

