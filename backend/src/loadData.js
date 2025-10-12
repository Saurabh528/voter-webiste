import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Excel data and convert to JSON
function loadVoterData() {
  try {
    const excelPath = path.join(__dirname, '../data/dummy-cop-data.xlsx');
    console.log('Loading data from:', excelPath);
    
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Loaded ${jsonData.length} voter records`);
    
    // Normalize data for consistent querying
    const normalizedData = jsonData.map((row, index) => ({
      id: row.ID || index + 1,
      enrollmentNo: row.enrolment_no || row.enrollmentNo || '',
      enrollmentDate: row.enrolment_date || row.enrollmentDate || '',
      copNo: row.COP_NO || row.copNo || '',
      name: row.NAME || row.name || '',
      fatherName: row.Father_Name || row.fatherName || '',
      address: row.ADDRESS || row.address || '',
      district: row.DISTRICT || row.district || '',
      voterDistrict: row.VOTER_DISTRICT || row.voterDistrict || '',
      practiceBar: row.Practice_bar || row.practiceBar || '',
      mobile: row.MOB || row.mobile || '',
      memberName: row.Member_Name || row.memberName || '',
      remark: row.Remark || row.remark || '',
      formStatus: row.form_status || row.formStatus || ''
    }));
    
    // Save to JSON file for faster loading
    const jsonPath = path.join(__dirname, '../data/voters.json');
    fs.writeFileSync(jsonPath, JSON.stringify(normalizedData, null, 2));
    
    console.log('Data saved to voters.json');
    console.log('Sample record:', normalizedData[0]);
    
    return normalizedData;
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

