import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import loadVoterData from './loadData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (will be loaded from JSON)
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

// Search by enrollment number
app.post('/api/search/enrollment', (req, res) => {
  try {
    const { enrollmentNumber, phoneNumber } = req.body;
    
    if (!enrollmentNumber) {
      return res.status(400).json({ 
        error: 'Enrollment number is required' 
      });
    }

    // Log search
    searchLogs.push({
      type: 'enrollment',
      query: enrollmentNumber,
      phoneNumber: phoneNumber || null,
      timestamp: new Date().toISOString()
    });

    // Search in database
    const normalizedSearch = normalizeString(enrollmentNumber);
    const result = votersDB.find(voter => 
      normalizeString(voter.enrollmentNo) === normalizedSearch ||
      normalizeString(voter.enrollmentNo).includes(normalizedSearch)
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
app.post('/api/search/name-district', (req, res) => {
  try {
    const { name, district, phoneNumber } = req.body;
    
    if (!name || !district) {
      return res.status(400).json({ 
        error: 'Name and district are required' 
      });
    }

    // Log search
    searchLogs.push({
      type: 'name-district',
      query: { name, district },
      phoneNumber: phoneNumber || null,
      timestamp: new Date().toISOString()
    });

    // Search in database
    const normalizedName = normalizeString(name);
    const normalizedDistrict = normalizeString(district);
    
    const results = votersDB.filter(voter => 
      normalizeString(voter.name).includes(normalizedName) &&
      normalizeString(voter.district) === normalizedDistrict
    );

    if (results.length > 0) {
      // Return first match (or you could return all matches)
      const result = results[0];
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
        },
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
app.post('/api/phone-capture', (req, res) => {
  try {
    const { phoneNumber, source } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        error: 'Phone number is required' 
      });
    }

    phoneCaptures.push({
      phoneNumber,
      source: source || 'modal',
      timestamp: new Date().toISOString()
    });

    // In production, save to database
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
  console.log(`\n📍 API Endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/search/enrollment`);
  console.log(`   - POST /api/search/name-district`);
  console.log(`   - POST /api/phone-capture`);
  console.log(`   - GET  /api/stats`);
  console.log(`\n✅ Backend is ready!\n`);
});

export default app;

