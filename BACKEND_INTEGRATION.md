# Backend Integration Guide

## Overview

The Voter Registration Status Checker now has a complete backend API integration. The system allows searching through voter records stored in an Excel database with phone number capture functionality.

## What Was Built

### Backend (Node.js + Express)

1. **API Server** (`backend/src/server.js`)
   - Express server running on port 3001
   - CORS enabled for frontend communication
   - In-memory database loaded from Excel
   - Error handling middleware

2. **Data Loader** (`backend/src/loadData.js`)
   - Reads Excel files (`.xlsx` format)
   - Converts to JSON for fast querying
   - Normalizes field names
   - Caches data in `backend/data/voters.json`

3. **API Endpoints**:
   - `GET /api/health` - Health check and database status
   - `POST /api/search/enrollment` - Search by enrollment number
   - `POST /api/search/name-district` - Search by name and district
   - `POST /api/phone-capture` - Capture phone numbers
   - `GET /api/stats` - Usage statistics
   - `GET /api/admin/search-logs` - Search logs (admin)
   - `GET /api/admin/phone-captures` - Phone captures (admin)

### Frontend Updates

1. **API Service** (`src/utils/api.ts`)
   - TypeScript service for all backend calls
   - Type-safe interfaces
   - Error handling

2. **Updated Components**:
   - `VoterSearchSection.tsx` - Now uses backend API instead of mock data
   - `PhoneCaptureModal.tsx` - Sends phone numbers to backend

## Database Structure

The Excel file should have these columns:
- `ID` - Unique voter ID
- `enrolment_no` - Enrollment number (e.g., UP10579/13)
- `enrolment_date` - Date of enrollment
- `COP_NO` - Certificate of Practice number
- `NAME` - Voter's name
- `Father_Name` - Father's name
- `ADDRESS` - Full address
- `DISTRICT` - District name
- `VOTER_DISTRICT` - Voting district
- `Practice_bar` - Practice bar association
- `MOB` - Mobile number
- `Member_Name` - Member name/code
- `Remark` - Remarks
- `form_status` - Form status

## Testing Results

✅ Backend server starts successfully
✅ Health endpoint returns correct data (5 voters loaded)
✅ Enrollment search works correctly
✅ Name + District search works correctly
✅ Phone capture works correctly
✅ Stats tracking works correctly

### Test Examples

```bash
# Health check
curl http://localhost:3001/api/health

# Search by enrollment
curl -X POST http://localhost:3001/api/search/enrollment \
  -H "Content-Type: application/json" \
  -d '{"enrollmentNumber":"UP10579/13"}'

# Search by name and district
curl -X POST http://localhost:3001/api/search/name-district \
  -H "Content-Type: application/json" \
  -d '{"name":"AASHEESH","district":"VARANASI"}'

# Capture phone
curl -X POST http://localhost:3001/api/phone-capture \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"9876543210","source":"modal"}'

# Get statistics
curl http://localhost:3001/api/stats
```

## Using Full Dataset

To use the full 10,944 voter records:

1. Copy the full Excel file to `backend/data/`:
   ```bash
   cp /path/to/2025-09-24-Cop\(1st\).xlsx backend/data/
   ```

2. Update `loadData.js` to use the correct filename:
   ```javascript
   const excelPath = path.join(__dirname, '../data/2025-09-24-Cop(1st).xlsx');
   ```

3. Reload the data:
   ```bash
   cd backend
   npm run load-data
   npm start
   ```

## Data Persistence

Currently, data is stored in:
- **Voter records**: Loaded from Excel into memory (fast queries)
- **Search logs**: In-memory array (resets on server restart)
- **Phone captures**: In-memory array (resets on server restart)

### For Production

Consider adding persistent storage:
1. **SQLite** - Simple file-based database
2. **MongoDB** - NoSQL document store
3. **PostgreSQL** - Full relational database
4. **File system** - Save logs to JSON files

## Performance

With current setup:
- **5 voters**: Instant response
- **10,944 voters**: Expected ~10-50ms per search
- **100,000+ voters**: Consider indexing or database optimization

## Security Considerations

For production deployment:
1. Add authentication/authorization
2. Implement rate limiting
3. Validate and sanitize inputs
4. Use HTTPS
5. Protect admin endpoints
6. Store phone numbers securely (encrypt)
7. Implement GDPR compliance

## Environment Variables

Create `.env` in root directory:
```
VITE_API_URL=http://localhost:3001/api
```

For production:
```
VITE_API_URL=https://your-domain.com/api
```

## Next Steps

1. ✅ Backend API created
2. ✅ Frontend integrated
3. ✅ Testing completed
4. 📝 Load full dataset (10,944 records)
5. 📝 Deploy to production server
6. 📝 Add persistent database
7. 📝 Implement admin dashboard
8. 📝 Add authentication

## Support

For issues or questions:
- Backend logs: Check terminal running backend
- Frontend errors: Check browser console (F12)
- API testing: Use curl or Postman

