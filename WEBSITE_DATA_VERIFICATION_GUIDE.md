# Website Data Verification Guide

## How to Check Phone Number Captures and User Activity

### Prerequisites
- SSH access to your Render server
- PostgreSQL database access

### Step 1: Connect to Server
```bash
# SSH into your Render server
ssh into your server shell (via Render dashboard)

# Navigate to project directory
cd ~/project/src/backend
```

### Step 2: Connect to PostgreSQL Database
```bash
# Connect using environment variable
psql $DATABASE_URL
```

### Step 3: Verify Database Structure
```sql
-- Check all tables exist
\dt

-- Expected output:
-- public | phone_captures | table | voter_user
-- public | search_logs    | table | voter_user  
-- public | voters         | table | voter_user
```

### Step 4: Check Data Counts
```sql
-- Get row counts for all tables
SELECT 'voters' as table_name, COUNT(*) as row_count FROM voters
UNION ALL
SELECT 'search_logs' as table_name, COUNT(*) as row_count FROM search_logs  
UNION ALL
SELECT 'phone_captures' as table_name, COUNT(*) as row_count FROM phone_captures;
```

### Step 5: View Phone Numbers Captured via Website Modal
```sql
-- All phone numbers captured through the website modal
SELECT phone_number, source, timestamp 
FROM phone_captures 
ORDER BY timestamp DESC;
```

### Step 6: View Search Activity with Phone Numbers
```sql
-- All searches with phone numbers (captured during search flow)
SELECT 
    phone_number, 
    search_type, 
    enrollment_number, 
    name_searched, 
    district_searched, 
    result_found, 
    timestamp 
FROM search_logs 
WHERE phone_number IS NOT NULL 
ORDER BY timestamp DESC;
```

### Step 7: Complete User Journey Analysis
```sql
-- Get complete user activity for specific phone number
SELECT 
    pc.phone_number,
    'Modal Capture' as activity_type,
    pc.source,
    '' as search_details,
    pc.timestamp
FROM phone_captures pc
WHERE pc.phone_number = 'PHONE_NUMBER_HERE'

UNION ALL

SELECT 
    sl.phone_number,
    'Search Activity' as activity_type,
    sl.search_type as source,
    CONCAT(
        COALESCE(sl.enrollment_number, ''), 
        ' | ', 
        COALESCE(sl.name_searched, ''), 
        ' | ', 
        COALESCE(sl.district_searched, '')
    ) as search_details,
    sl.timestamp
FROM search_logs sl
WHERE sl.phone_number = 'PHONE_NUMBER_HERE'
ORDER BY timestamp;
```

### Step 8: All Recent Website Activity
```sql
-- Last 20 activities on your website
SELECT 
    search_type,
    enrollment_number,
    name_searched,
    district_searched,
    phone_number,
    result_found,
    timestamp
FROM search_logs 
ORDER BY timestamp DESC 
LIMIT 20;
```

### Step 9: Phone Capture Summary Report
```sql
-- Summary of phone capture effectiveness
SELECT 
    COUNT(DISTINCT pc.phone_number) as unique_phones_modal,
    COUNT(DISTINCT sl.phone_number) as unique_phones_search,
    COUNT(DISTINCT COALESCE(pc.phone_number, sl.phone_number)) as total_unique_phones
FROM phone_captures pc
FULL OUTER JOIN search_logs sl ON pc.phone_number = sl.phone_number;
```

### Step 10: Export Data (Optional)
```sql
-- Export search logs with phone data to CSV
\copy (SELECT phone_number, search_type, enrollment_number, name_searched, district_searched, result_found, timestamp FROM search_logs WHERE phone_number IS NOT NULL ORDER BY timestamp DESC) TO '/tmp/website_activity.csv' WITH CSV HEADER;

-- Export phone captures to CSV
\copy (SELECT phone_number, source, timestamp FROM phone_captures ORDER BY timestamp DESC) TO '/tmp/phone_captures.csv' WITH CSV HEADER;
```

### Step 11: Exit Database
```sql
\q
```

## Key Metrics to Monitor

### Phone Capture Success Rate
- **Modal captures**: Direct phone submissions via website popup
- **Search flow captures**: Phone numbers collected during voter searches
- **Unique vs. total**: Track repeat users

### User Behavior Analysis
- **Search patterns**: Enrollment vs Name-District searches
- **Success rates**: How many searches find results
- **User engagement**: Phone submission rates

### Data Quality Checks
- **Valid phone numbers**: All should be 10-digit Indian mobile numbers
- **Search completion**: Searches with vs without phone numbers
- **Timestamp accuracy**: Recent activity tracking

## Common Queries for Daily Monitoring

```sql
-- Today's activity
SELECT COUNT(*) as searches_today 
FROM search_logs 
WHERE DATE(timestamp) = CURRENT_DATE;

-- Phone captures today
SELECT COUNT(*) as phones_today 
FROM phone_captures 
WHERE DATE(timestamp) = CURRENT_DATE;

-- Most searched districts
SELECT district_searched, COUNT(*) as search_count 
FROM search_logs 
WHERE district_searched IS NOT NULL 
GROUP BY district_searched 
ORDER BY search_count DESC 
LIMIT 10;
```

## Troubleshooting

### If No Data Appears:
1. Check if backend is running: `ps aux | grep node`
2. Check database connection: Test with `\dt` command
3. Verify API endpoints are working: Check server logs

### If Phone Validation Fails:
1. Check `phoneValidation.js` configuration
2. Verify Indian mobile number format (10 digits, starts with 6-9)
3. Check security input validation

This guide provides complete visibility into your website's data capture effectiveness and user engagement metrics.