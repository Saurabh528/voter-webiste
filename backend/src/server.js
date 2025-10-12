import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import loadVoterData from './loadData.js';
import { 
  saveSearchLogToCSV, 
  savePhoneCaptureToCSV, 
  loadSearchLogsFromCSV, 
  loadPhoneCapturesFromCSV,
  getCSVPaths 
} from './csvManager.js';
import { 
  normalizeDistrict, 
  normalizeName, 
  containsHindi,
  getBilingualDistricts,
  getAllSpellingVariations
} from './bilingualHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (will be loaded from JSON and CSV)
let votersDB = [];
let searchLogs = [];
let phoneCaptures = [];

// Load voter data on startup
function initializeDatabase() {
  try {
    const jsonPath = path.join(__dirname, '../data/voters.json');
    
    // Check if JSON file exists, if not create it from Excel
    if (!fs.existsSync(jsonPath)) {
      console.log('voters.json not found, loading from Excel...');
      votersDB = loadVoterData();
    } else {
      console.log('Loading data from voters.json...');
      const data = fs.readFileSync(jsonPath, 'utf-8');
      votersDB = JSON.parse(data);
      console.log(`Loaded ${votersDB.length} voter records from database`);
    }

    // Load existing CSV logs
    console.log('Loading existing CSV logs...');
    searchLogs = loadSearchLogsFromCSV();
    phoneCaptures = loadPhoneCapturesFromCSV();
    console.log(`Loaded ${searchLogs.length} search logs and ${phoneCaptures.length} phone captures from CSV`);
  } catch (error) {
    console.error('Error initializing database:', error);
    votersDB = [];
  }
}

// Initialize database
initializeDatabase();

// Helper function to normalize strings for search
function normalizeString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().trim();
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Voter Registration API is running',
    totalRecords: votersDB.length 
  });
});

// Get bilingual districts list
app.get('/api/districts', (req, res) => {
  try {
    const districts = getBilingualDistricts();
    res.json({
      total: districts.length,
      districts: districts
    });
  } catch (error) {
    console.error('Error getting districts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search by enrollment number
app.post('/api/search/enrollment', async (req, res) => {
  try {
    const { enrollmentNumber, phoneNumber } = req.body;
    
    if (!enrollmentNumber) {
      return res.status(400).json({ 
        error: 'Enrollment number is required' 
      });
    }

    // Search in database
    const normalizedSearch = normalizeString(enrollmentNumber);
    const result = votersDB.find(voter => 
      normalizeString(voter.enrollmentNo) === normalizedSearch ||
      normalizeString(voter.enrollmentNo).includes(normalizedSearch)
    );

    // Create log entry
    const logEntry = {
      type: 'enrollment',
      query: enrollmentNumber,
      enrollmentNumber: enrollmentNumber,
      phoneNumber: phoneNumber || null,
      timestamp: new Date().toISOString(),
      resultFound: !!result
    };

    // Save to memory
    searchLogs.push(logEntry);

    // Save to CSV asynchronously (don't wait for it)
    saveSearchLogToCSV(logEntry).catch(err => 
      console.error('Failed to save to CSV:', err)
    );

    if (result) {
      res.json({
        found: true,
        data: {
          name: result.name,
          enrollmentNumber: result.enrollmentNo,
          copNumber: result.copNo,
          address: result.address,
          district: result.district,
          fatherName: result.fatherName,
          mobile: result.mobile
        }
      });
    } else {
      res.json({
        found: false,
        message: 'No voter found with this enrollment number'
      });
    }
  } catch (error) {
    console.error('Error in enrollment search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search by name and district
app.post('/api/search/name-district', async (req, res) => {
  try {
    const { name, district, phoneNumber } = req.body;
    
    if (!name || !district) {
      return res.status(400).json({ 
        error: 'Name and district are required' 
      });
    }

    // Normalize inputs to handle both English and Hindi
    const normalizedDistrictInput = normalizeDistrict(district);
    
    // If Hindi input, get all spelling variations
    let searchVariations = [];
    if (containsHindi(name)) {
      searchVariations = getAllSpellingVariations(name);
      console.log(`Hindi Search: "${name}" → Variations:`, searchVariations);
    } else {
      searchVariations = [name.toUpperCase().trim()];
      console.log(`English Search: "${name}"`);
    }
    
    console.log(`District: "${district}" (normalized: "${normalizedDistrictInput}")`);
    
    // Search in database with all spelling variations
    const results = votersDB.filter(voter => {
      const voterName = voter.name.toUpperCase();
      const voterDistrict = normalizeString(voter.district).toUpperCase();
      
      // Check district match first
      const districtMatches = voterDistrict === normalizedDistrictInput ||
                             voterDistrict === normalizeString(district).toUpperCase();
      
      if (!districtMatches) return false;
      
      // Try to match with any spelling variation
      const nameMatches = searchVariations.some(variation => {
        const searchWords = variation.split(/\s+/).filter(w => w.length > 2);
        
        // All words must match
        return searchWords.every(word => {
          // Direct match
          if (voterName.includes(word)) return true;
          
          // Fuzzy match for similar spellings
          if (word.length >= 4) {
            const wordCore = word.substring(0, Math.min(4, word.length));
            if (voterName.includes(wordCore)) return true;
          }
          
          return false;
        });
      });
      
      return nameMatches;
    });

    // Create log entry
    const logEntry = {
      type: 'name-district',
      query: { name, district },
      enrollmentNumber: results.length > 0 ? results[0].enrollmentNo : '',
      phoneNumber: phoneNumber || null,
      timestamp: new Date().toISOString(),
      resultFound: results.length > 0
    };

    // Save to memory
    searchLogs.push(logEntry);

    // Save to CSV asynchronously
    saveSearchLogToCSV(logEntry).catch(err => 
      console.error('Failed to save to CSV:', err)
    );

    if (results.length > 0) {
      // Return ALL matches
      const allMatches = results.map(result => ({
        name: result.name,
        enrollmentNumber: result.enrollmentNo,
        copNumber: result.copNo,
        address: result.address,
        district: result.district,
        fatherName: result.fatherName,
        mobile: result.mobile
      }));
      
      res.json({
        found: true,
        data: allMatches[0], // First result for backward compatibility
        allResults: allMatches, // All matching results
        totalMatches: results.length
      });
    } else {
      res.json({
        found: false,
        message: 'No voter found with this name and district'
      });
    }
  } catch (error) {
    console.error('Error in name-district search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Save phone number (for modal capture)
app.post('/api/phone-capture', async (req, res) => {
  try {
    const { phoneNumber, source } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        error: 'Phone number is required' 
      });
    }

    const captureEntry = {
      phoneNumber,
      source: source || 'modal',
      timestamp: new Date().toISOString()
    };

    // Save to memory
    phoneCaptures.push(captureEntry);

    // Save to CSV asynchronously
    savePhoneCaptureToCSV(captureEntry).catch(err => 
      console.error('Failed to save phone capture to CSV:', err)
    );

    console.log('Phone captured:', phoneNumber);

    res.json({
      success: true,
      message: 'Phone number saved successfully'
    });
  } catch (error) {
    console.error('Error saving phone number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get statistics (for admin/monitoring)
app.get('/api/stats', (req, res) => {
  try {
    res.json({
      totalVoters: votersDB.length,
      totalSearches: searchLogs.length,
      totalPhoneCaptures: phoneCaptures.length,
      searchesByType: {
        enrollment: searchLogs.filter(s => s.type === 'enrollment').length,
        nameDistrict: searchLogs.filter(s => s.type === 'name-district').length
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export search logs (for admin)
app.get('/api/admin/search-logs', (req, res) => {
  try {
    res.json({
      total: searchLogs.length,
      logs: searchLogs
    });
  } catch (error) {
    console.error('Error getting search logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export phone captures (for admin)
app.get('/api/admin/phone-captures', (req, res) => {
  try {
    res.json({
      total: phoneCaptures.length,
      captures: phoneCaptures
    });
  } catch (error) {
    console.error('Error getting phone captures:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download search logs CSV
app.get('/api/admin/download/search-logs', (req, res) => {
  try {
    const csvPaths = getCSVPaths();
    
    if (!fs.existsSync(csvPaths.searchLogs)) {
      return res.status(404).json({ error: 'Search logs CSV file not found' });
    }

    res.download(csvPaths.searchLogs, 'search-logs.csv', (err) => {
      if (err) {
        console.error('Error downloading search logs CSV:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error('Error in download search logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download phone captures CSV
app.get('/api/admin/download/phone-captures', (req, res) => {
  try {
    const csvPaths = getCSVPaths();
    
    if (!fs.existsSync(csvPaths.phoneCaptures)) {
      return res.status(404).json({ error: 'Phone captures CSV file not found' });
    }

    res.download(csvPaths.phoneCaptures, 'phone-captures.csv', (err) => {
      if (err) {
        console.error('Error downloading phone captures CSV:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Error downloading file' });
        }
      }
    });
  } catch (error) {
    console.error('Error in download phone captures:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Voter Registration API Server running on port ${PORT}`);
  console.log(`📊 Total voters in database: ${votersDB.length}`);
  console.log(`📝 Search logs: ${searchLogs.length} | Phone captures: ${phoneCaptures.length}`);
  console.log(`\n📍 API Endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/search/enrollment`);
  console.log(`   - POST /api/search/name-district`);
  console.log(`   - POST /api/phone-capture`);
  console.log(`   - GET  /api/stats`);
  console.log(`\n💾 CSV Export Endpoints:`);
  console.log(`   - GET  /api/admin/download/search-logs`);
  console.log(`   - GET  /api/admin/download/phone-captures`);
  console.log(`\n✅ Backend is ready! CSV auto-save enabled.\n`);
});

export default app;

