import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool, { initializeSchema, getVoterCount } from './db.js';
import { 
  normalizeDistrict, 
  containsHindi,
  getBilingualDistricts,
  getAllSpellingVariations
} from './bilingualHelper.js';
import { validateIndianMobileNumber, cleanPhoneInput, isInputSafe } from './phoneValidation.js';
import { 
  fuzzySearchEnrollment, 
  fuzzySearchNameDistrict, 
  getAllDistricts, 
  logSearch 
} from './enhancedSearch.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
async function initializeApp() {
  try {
    await initializeSchema();
    const count = await getVoterCount();
    console.log(`📊 Database has ${count.toLocaleString()} voter records`);
    
    if (count === 0) {
      console.log('\n⚠️  Database is empty. Run: npm run import-db');
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

initializeApp();

// Helper function to normalize strings for search
function normalizeString(str) {
  if (!str) return '';
  return str.toString().toLowerCase().trim();
}

// API Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const count = await getVoterCount();
    res.json({ 
      status: 'OK', 
      message: 'Voter Registration API is running (PostgreSQL)',
      totalRecords: count 
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection error' });
  }
});

// Test endpoint to demonstrate missing COP number functionality
app.post('/api/test/missing-cop', async (req, res) => {
  try {
    // Return a mock voter without COP number to test the UI
    res.json({
      found: true,
      noCopNumber: true,
      data: {
        name: "TEST VOTER WITHOUT COP",
        enrollmentNumber: "UP99999/99",
        copNumber: null,
        address: "Test Address, Test City, Test District",
        district: "LUCKNOW",
        fatherName: "Test Father",
        phone: null,
        regYear: "99",
        age: "30",
        community: "Other"
      }
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bilingual districts list
app.get('/api/districts', async (req, res) => {
  try {
    // Get districts from the actual database
    const dbDistricts = await getAllDistricts();
    
    // Also get bilingual mappings
    const bilingualDistricts = getBilingualDistricts();
    
    res.json({
      total: dbDistricts.length,
      districts: dbDistricts,
      bilingualMappings: bilingualDistricts
    });
  } catch (error) {
    console.error('Error getting districts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search by enrollment number with fuzzy matching
app.post('/api/search/enrollment', async (req, res) => {
  try {
    const { enrollmentNumber, phoneNumber } = req.body;

    if (!enrollmentNumber) {
      return res.status(400).json({
        error: 'Enrollment number is required'
      });
    }

    // Use enhanced fuzzy search
    const results = await fuzzySearchEnrollment(enrollmentNumber.trim(), 100);

    // Log the search with phone number
    await logSearch('enrollment', { enrollmentNumber, phoneNumber }, results.length > 0, results.length);

    const found = results.length > 0;

    if (found) {
      // Return ALL results (both with and without COP numbers)
      // Let the frontend handle the styling based on COP number availability
      if (results.length > 0) {
        if (results.length > 1) {
          const allResults = results.map(voter => {
            const copValue = voter.cop_no;
            const hasCOP = copValue !== null && copValue !== undefined && copValue !== '';

            return {
              name: voter.name,
              enrollmentNumber: voter.enrolment_no,
              copNumber: voter.cop_no,
              address: voter.address,
              district: voter.district,
              fatherName: voter.father_name,
              phone: voter.phone,
              regYear: voter.reg_year,
              age: voter.age,
              community: voter.community,
              slNo: voter.sl_no,
              noCopNumber: !hasCOP
            };
          });

          res.json({
            found: true,
            multipleResults: true,
            totalResults: results.length,
            allResults: allResults
          });
        } else {
          const voter = results[0];
          // Check if COP number is missing/null/empty
          const copValue = voter.cop_no;
          const hasCOP = copValue !== null && copValue !== undefined && copValue !== '';

          res.json({
            found: true,
            noCopNumber: !hasCOP,
            data: {
              name: voter.name,
              enrollmentNumber: voter.enrolment_no,
              copNumber: voter.cop_no, // This will be null/empty for voters without COP numbers
              address: voter.address,
              district: voter.district,
              fatherName: voter.father_name,
              phone: voter.phone,
              regYear: voter.reg_year,
              age: voter.age,
              community: voter.community,
              slNo: voter.sl_no
            }
          });
        }
      } else {
        res.json({
          found: false,
          message: 'No voter found with this enrollment number'
        });
      }
    } else {
      res.json({
        found: false,
        message: 'No voter found with this enrollment number'
      });
    }
  } catch (error) {
    console.error('Error in enrollment search:', error);
    if (error.message.includes('Invalid input detected')) {
      res.status(400).json({ error: 'Invalid input detected' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Search by name and district
app.post('/api/search/name-district', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { name, district, phoneNumber } = req.body;
    
    if (!name || !district) {
      return res.status(400).json({ 
        error: 'Name and district are required' 
      });
    }

    // Normalize district
    const normalizedDistrict = normalizeDistrict(district);
    
    // Get spelling variations for Hindi names
    let searchVariations = [];
    if (containsHindi(name)) {
      searchVariations = getAllSpellingVariations(name);
      console.log(`Hindi Search: "${name}" → Variations:`, searchVariations);
    } else {
      searchVariations = [name.toUpperCase().trim()];
    }

    // Build SQL query with all variations
    const searchWords = searchVariations[0].split(/\s+/).filter(w => w.length > 2);
    
    // Use name_normalized for faster searching
    let query = `
      SELECT * FROM voters 
      WHERE UPPER(district) = UPPER($1)
    `;
    
    const params = [normalizedDistrict];
    
    // Add name search conditions
    if (searchWords.length > 0) {
      const nameConditions = searchWords.map((word, index) => {
        params.push(`%${word.toLowerCase()}%`);
        return `LOWER(name) LIKE $${params.length}`;
      });
      
      query += ` AND (${nameConditions.join(' AND ')})`;
    }
    
    query += ` ORDER BY name LIMIT 50`; // Limit to 50 results for performance
    
    console.log(`Searching with query params:`, params);

    const result = await client.query(query, params);

    // Log search to database with phone number
    await client.query(`
      INSERT INTO search_logs (
        search_type, name_searched, district_searched, phone_number,
        result_found, results_count
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      'name-district',
      name,
      district,
      phoneNumber || null,
      result.rows.length > 0,
      result.rows.length
    ]);

    if (result.rows.length > 0) {
      const allMatches = result.rows.map(voter => {
        const copValue = voter.cop_no;
        const hasCOP = copValue !== null && copValue !== undefined && copValue !== '';

        return {
          name: voter.name,
          enrollmentNumber: voter.enrolment_no,
          copNumber: voter.cop_no,
          address: voter.address,
          district: voter.district,
          fatherName: voter.father_name,
          mobile: voter.phone,
          slNo: voter.sl_no,
          noCopNumber: !hasCOP
        };
      });

      res.json({
        found: true,
        data: allMatches[0],
        allResults: allMatches,
        totalResults: result.rows.length,
        noCopNumber: allMatches[0].noCopNumber
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
  } finally {
    client.release();
  }
});

// Save phone number
app.post('/api/phone-capture', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { phoneNumber, source } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ 
        error: 'Phone number is required' 
      });
    }

    // SECURITY: Check if input is safe first
    if (!isInputSafe(phoneNumber)) {
      console.log('SECURITY ALERT: Dangerous input detected:', phoneNumber);
      return res.status(400).json({ 
        error: 'Invalid input detected',
        isValid: false
      });
    }

    // Clean and validate the phone number
    const cleanedPhone = cleanPhoneInput(phoneNumber);
    const validation = validateIndianMobileNumber(cleanedPhone);
    
    if (!validation.isValid) {
      console.log('Invalid phone number rejected:', phoneNumber, '- Error:', validation.error);
      return res.status(400).json({ 
        error: validation.error || 'Invalid phone number',
        isValid: false
      });
    }

    await client.query(`
      INSERT INTO phone_captures (phone_number, source)
      VALUES ($1, $2)
    `, [cleanedPhone, source || 'modal']);

    console.log('Valid phone captured:', cleanedPhone);

    res.json({
      success: true,
      message: 'Phone number saved successfully',
      isValid: true
    });
  } catch (error) {
    console.error('Error saving phone number:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const voterCount = await client.query('SELECT COUNT(*) FROM voters');
    const searchCount = await client.query('SELECT COUNT(*) FROM search_logs');
    const phoneCount = await client.query('SELECT COUNT(*) FROM phone_captures');
    const enrollmentSearches = await client.query(`SELECT COUNT(*) FROM search_logs WHERE search_type = 'enrollment'`);
    const nameSearches = await client.query(`SELECT COUNT(*) FROM search_logs WHERE search_type = 'name-district'`);
    
    res.json({
      totalVoters: parseInt(voterCount.rows[0].count),
      totalSearches: parseInt(searchCount.rows[0].count),
      totalPhoneCaptures: parseInt(phoneCount.rows[0].count),
      searchesByType: {
        enrollment: parseInt(enrollmentSearches.rows[0].count),
        nameDistrict: parseInt(nameSearches.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Export search logs
app.get('/api/admin/search-logs', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM search_logs 
      ORDER BY timestamp DESC 
      LIMIT 1000
    `);
    
    res.json({
      total: result.rows.length,
      logs: result.rows
    });
  } catch (error) {
    console.error('Error getting search logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Export phone captures
app.get('/api/admin/phone-captures', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT * FROM phone_captures 
      ORDER BY timestamp DESC 
      LIMIT 1000
    `);
    
    res.json({
      total: result.rows.length,
      captures: result.rows
    });
  } catch (error) {
    console.error('Error getting phone captures:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Download CSV exports (from database)
app.get('/api/admin/download/search-logs-csv', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query('SELECT * FROM search_logs ORDER BY timestamp DESC');
    
    // Convert to CSV
    const headers = 'Timestamp,Search Type,Enrollment Number,Name Searched,District,Phone Number,Result Found,Results Count\n';
    const rows = result.rows.map(row => 
      `${row.timestamp},${row.search_type},${row.enrollment_number || ''},${row.name_searched || ''},${row.district_searched || ''},${row.phone_number || ''},${row.result_found},${row.results_count}`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=search-logs.csv');
    res.send(headers + rows);
  } catch (error) {
    console.error('Error exporting search logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
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
  console.log(`\n🚀 Voter Registration API Server (PostgreSQL) running on port ${PORT}`);
  console.log(`\n📍 API Endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/search/enrollment`);
  console.log(`   - POST /api/search/name-district`);
  console.log(`   - POST /api/phone-capture`);
  console.log(`   - GET  /api/stats`);
  console.log(`   - GET  /api/districts`);
  console.log(`\n💾 Admin Endpoints:`);
  console.log(`   - GET  /api/admin/search-logs`);
  console.log(`   - GET  /api/admin/phone-captures`);
  console.log(`   - GET  /api/admin/download/search-logs-csv`);
  console.log(`\n✅ Backend is ready with PostgreSQL!\n`);
});

export default app;

