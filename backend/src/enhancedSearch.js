import pool from './db.js';

/**
 * Enhanced search module with fuzzy matching and security
 */

/**
 * Sanitizes input to prevent SQL injection
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove dangerous characters and patterns
  let sanitized = input
    .replace(/[<>'"`;]/g, '') // Remove HTML/XML and SQL dangerous chars
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi, '') // Remove SQL keywords
    .trim()
    .substring(0, 255); // Limit length

  // Auto-format UP enrollment numbers to ensure 5 digits before the slash
  // Pattern: UP followed by digits (1-4 digits) optionally followed by /year
  const upPattern = /^UP(\d{1,4})(\/\d{1,4})?$/i;
  const match = sanitized.match(upPattern);

  if (match) {
    const digits = match[1]; // The digits after UP
    const yearPart = match[2] || ''; // The /year part if it exists

    // Pad with leading zeros to make it 5 digits
    if (digits.length < 5) {
      const paddedDigits = digits.padStart(5, '0');
      sanitized = `UP${paddedDigits}${yearPart}`;
    }
  }

  return sanitized;
}

/**
 * Validates if input contains only safe characters
 * @param {string} input - User input
 * @returns {boolean} true if input is safe
 */
function isInputSafe(input) {
  if (!input || typeof input !== 'string') {
    return true; // Empty/null is safe
  }
  
  // Only allow alphanumeric, spaces, forward slash, and hyphens for enrollment numbers
  const safePattern = /^[a-zA-Z0-9\s\/\-]*$/;
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /['"`;]/g,           // Quotes and semicolons
    /(\/\*|\*\/)/g,      // SQL comments
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/gi, // SQL keywords
    /(<script|javascript:|on\w+\s*=)/gi, // XSS patterns
    /(\bor\b|\band\b)/gi, // Boolean operators
    /(exec|execute)/gi,   // Execution commands
    /(xp_|sp_)/gi,       // SQL Server procedures
  ];
  
  // Check if input contains only safe characters
  if (!safePattern.test(input)) {
    return false;
  }
  
  // Check for dangerous patterns
  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Fuzzy search for enrollment numbers with partial matching
 * @param {string} enrollmentNumber - Enrollment number to search
 * @param {number} limit - Maximum number of results (default 100)
 * @returns {Array} Array of matching voters
 */
export async function fuzzySearchEnrollment(enrollmentNumber, limit = 100) {
  if (!isInputSafe(enrollmentNumber)) {
    throw new Error('Invalid input detected');
  }

  let sanitizedInput = sanitizeInput(enrollmentNumber);
  if (!sanitizedInput) {
    return [];
  }

  // Normalize enrollment number: Pad UP enrollment numbers to 5 digits before slash
  // Pattern: UP followed by 1-4 digits, optionally followed by /year
  const upPattern = /^UP(\d{1,4})(\/\d{1,4})?$/i;
  const match = sanitizedInput.match(upPattern);

  if (match) {
    const digits = match[1];
    const yearPart = match[2] || '';

    // Only pad if less than 5 digits (normalize for search)
    if (digits.length < 5) {
      const paddedDigits = digits.padStart(5, '0');
      sanitizedInput = `UP${paddedDigits}${yearPart}`;
    }
  }

  const client = await pool.connect();
  
  try {
    // First try exact match
    const exactResult = await client.query(
      'SELECT * FROM voters WHERE enrolment_no = $1 LIMIT 1',
      [sanitizedInput]
    );
    
    if (exactResult.rows.length > 0) {
      return exactResult.rows;
    }
    
    // If no exact match, try fuzzy search with multiple strategies
    const queries = [
      // Exact match (already tried above)
      {
        query: 'SELECT *, 1 as relevance FROM voters WHERE enrolment_no = $1 LIMIT $2',
        params: [sanitizedInput, limit]
      },
      // Partial match at the beginning
      {
        query: 'SELECT *, 2 as relevance FROM voters WHERE enrolment_no LIKE $1 ORDER BY enrolment_no LIMIT $2',
        params: [`${sanitizedInput}%`, limit]
      },
      // Partial match anywhere in the string
      {
        query: 'SELECT *, 3 as relevance FROM voters WHERE enrolment_no LIKE $1 ORDER BY enrolment_no LIMIT $2',
        params: [`%${sanitizedInput}%`, limit]
      },
      // For numeric-only input, also search for numbers within enrollment numbers
      {
        query: 'SELECT *, 4 as relevance FROM voters WHERE enrolment_no ~ $1 ORDER BY enrolment_no LIMIT $2',
        params: [`.*${sanitizedInput.replace(/[^0-9]/g, '')}.*`, limit]
      },
      // Additional regex search for numeric sequences
      {
        query: 'SELECT *, 4.5 as relevance FROM voters WHERE enrolment_no ~ $1 ORDER BY enrolment_no LIMIT $2',
        params: [`.*${sanitizedInput}.*`, limit]
      },
      // Search with PostgreSQL full-text search
      {
        query: `SELECT *, 5 as relevance FROM voters 
                WHERE to_tsvector('english', enrolment_no) @@ plainto_tsquery('english', $1)
                ORDER BY ts_rank(to_tsvector('english', enrolment_no), plainto_tsquery('english', $1)) DESC
                LIMIT $2`,
        params: [sanitizedInput, limit]
      }
    ];
    
    let allResults = [];
    
    for (const { query, params } of queries) {
      try {
        const result = await client.query(query, params);
        allResults = allResults.concat(result.rows);
      } catch (error) {
        console.error('Error in fuzzy search query:', error);
        continue;
      }
    }
    
    // Remove duplicates based on id and sort by relevance
    const uniqueResults = [];
    const seenIds = new Set();
    
    for (const row of allResults) {
      if (!seenIds.has(row.id)) {
        seenIds.add(row.id);
        uniqueResults.push(row);
      }
    }
    
    // Sort by relevance (lower number = higher relevance) and limit results
    return uniqueResults
      .sort((a, b) => (a.relevance || 4) - (b.relevance || 4))
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error in fuzzy enrollment search:', error);
    throw new Error('Search failed due to security constraints');
  } finally {
    client.release();
  }
}

/**
 * Enhanced name and district search with fuzzy matching
 * @param {string} name - Name to search
 * @param {string} district - District to search
 * @param {number} limit - Maximum number of results (default 100)
 * @returns {Array} Array of matching voters
 */
export async function fuzzySearchNameDistrict(name, district, limit = 100) {
  if (!isInputSafe(name) || !isInputSafe(district)) {
    throw new Error('Invalid input detected');
  }
  
  const sanitizedName = sanitizeInput(name);
  const sanitizedDistrict = sanitizeInput(district);
  
  if (!sanitizedName && !sanitizedDistrict) {
    return [];
  }
  
  const client = await pool.connect();
  
  try {
    let query = 'SELECT * FROM voters WHERE ';
    const params = [];
    let paramCount = 0;
    const conditions = [];
    
    if (sanitizedName) {
      paramCount++;
      conditions.push(`(
        name ILIKE $${paramCount} OR 
        to_tsvector('english', name) @@ plainto_tsquery('english', $${paramCount})
      )`);
      params.push(`%${sanitizedName}%`);
    }
    
    if (sanitizedDistrict) {
      paramCount++;
      conditions.push(`(
        district ILIKE $${paramCount} OR 
        to_tsvector('english', district) @@ plainto_tsquery('english', $${paramCount})
      )`);
      params.push(`%${sanitizedDistrict}%`);
    }
    
    query += conditions.join(' AND ');
    query += ` ORDER BY 
      CASE WHEN name ILIKE $1 THEN 1 ELSE 2 END,
      CASE WHEN district ILIKE $${sanitizedName ? '2' : '1'} THEN 1 ELSE 2 END,
      name
      LIMIT $${paramCount + 1}`;
    
    params.push(limit);
    
    const result = await client.query(query, params);
    return result.rows;
    
  } catch (error) {
    console.error('Error in fuzzy name-district search:', error);
    throw new Error('Search failed due to security constraints');
  } finally {
    client.release();
  }
}

/**
 * Get all districts for dropdown
 * @returns {Array} Array of unique districts
 */
export async function getAllDistricts() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT DISTINCT district FROM voters WHERE district IS NOT NULL ORDER BY district'
    );
    return result.rows.map(row => row.district);
  } catch (error) {
    console.error('Error getting districts:', error);
    return [];
  } finally {
    client.release();
  }
}

/**
 * Log search activity for monitoring
 * @param {string} searchType - Type of search performed
 * @param {Object} searchParams - Search parameters
 * @param {boolean} resultFound - Whether results were found
 * @param {number} resultCount - Number of results found
 */
export async function logSearch(searchType, searchParams, resultFound, resultCount) {
  const client = await pool.connect();

  try {
    await client.query(
      `INSERT INTO search_logs (search_type, enrollment_number, name_searched, district_searched, phone_number, result_found, results_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        searchType,
        searchParams.enrollmentNumber || null,
        searchParams.name || null,
        searchParams.district || null,
        searchParams.phoneNumber || null,
        resultFound,
        resultCount
      ]
    );
  } catch (error) {
    console.error('Error logging search:', error);
    // Don't throw error for logging failures
  } finally {
    client.release();
  }
}
