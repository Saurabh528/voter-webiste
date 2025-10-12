import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_DIR = path.join(__dirname, '../data/logs');
const SEARCH_LOGS_CSV = path.join(CSV_DIR, 'search-logs.csv');
const PHONE_CAPTURES_CSV = path.join(CSV_DIR, 'phone-captures.csv');

// Ensure logs directory exists
if (!fs.existsSync(CSV_DIR)) {
  fs.mkdirSync(CSV_DIR, { recursive: true });
}

// CSV Writer for Search Logs
const searchLogsWriter = createObjectCsvWriter({
  path: SEARCH_LOGS_CSV,
  header: [
    { id: 'timestamp', title: 'Timestamp' },
    { id: 'type', title: 'Search Type' },
    { id: 'enrollmentNumber', title: 'Enrollment Number' },
    { id: 'name', title: 'Name Searched' },
    { id: 'district', title: 'District' },
    { id: 'phoneNumber', title: 'Phone Number' },
    { id: 'resultFound', title: 'Result Found' }
  ],
  append: true
});

// CSV Writer for Phone Captures
const phoneCapturesWriter = createObjectCsvWriter({
  path: PHONE_CAPTURES_CSV,
  header: [
    { id: 'timestamp', title: 'Timestamp' },
    { id: 'phoneNumber', title: 'Phone Number' },
    { id: 'source', title: 'Source' }
  ],
  append: true
});

// Function to save search log to CSV
export async function saveSearchLogToCSV(logData) {
  try {
    const record = {
      timestamp: logData.timestamp,
      type: logData.type,
      enrollmentNumber: logData.type === 'enrollment' ? logData.query : (logData.enrollmentNumber || ''),
      name: logData.type === 'name-district' ? logData.query.name : '',
      district: logData.type === 'name-district' ? logData.query.district : '',
      phoneNumber: logData.phoneNumber || '',
      resultFound: logData.resultFound ? 'Yes' : 'No'
    };

    await searchLogsWriter.writeRecords([record]);
    console.log('✓ Search log saved to CSV');
  } catch (error) {
    console.error('Error saving search log to CSV:', error);
  }
}

// Function to save phone capture to CSV
export async function savePhoneCaptureToCSV(captureData) {
  try {
    const record = {
      timestamp: captureData.timestamp,
      phoneNumber: captureData.phoneNumber,
      source: captureData.source || 'unknown'
    };

    await phoneCapturesWriter.writeRecords([record]);
    console.log('✓ Phone capture saved to CSV');
  } catch (error) {
    console.error('Error saving phone capture to CSV:', error);
  }
}

// Function to read search logs from CSV
export function loadSearchLogsFromCSV() {
  try {
    if (!fs.existsSync(SEARCH_LOGS_CSV)) {
      console.log('No existing search logs CSV found');
      return [];
    }

    const content = fs.readFileSync(SEARCH_LOGS_CSV, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length <= 1) {
      return []; // Only header or empty
    }

    const logs = [];
    // Skip header (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCSVLine(line);
      
      if (values.length >= 7) {
        const log = {
          timestamp: values[0],
          type: values[1],
          query: values[1] === 'enrollment' 
            ? values[2] 
            : { name: values[3], district: values[4] },
          phoneNumber: values[5] || null,
          resultFound: values[6] === 'Yes'
        };
        
        if (values[1] === 'enrollment' && values[2]) {
          log.enrollmentNumber = values[2];
        }
        
        logs.push(log);
      }
    }

    console.log(`Loaded ${logs.length} search logs from CSV`);
    return logs;
  } catch (error) {
    console.error('Error loading search logs from CSV:', error);
    return [];
  }
}

// Function to read phone captures from CSV
export function loadPhoneCapturesFromCSV() {
  try {
    if (!fs.existsSync(PHONE_CAPTURES_CSV)) {
      console.log('No existing phone captures CSV found');
      return [];
    }

    const content = fs.readFileSync(PHONE_CAPTURES_CSV, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length <= 1) {
      return []; // Only header or empty
    }

    const captures = [];
    // Skip header (first line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = parseCSVLine(line);
      
      if (values.length >= 3) {
        captures.push({
          timestamp: values[0],
          phoneNumber: values[1],
          source: values[2]
        });
      }
    }

    console.log(`Loaded ${captures.length} phone captures from CSV`);
    return captures;
  } catch (error) {
    console.error('Error loading phone captures from CSV:', error);
    return [];
  }
}

// Helper function to parse CSV line (handles quoted fields)
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

export function getCSVPaths() {
  return {
    searchLogs: SEARCH_LOGS_CSV,
    phoneCaptures: PHONE_CAPTURES_CSV
  };
}

