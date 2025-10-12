# Voter Registration Backend API

Backend API for the Voter Registration Status Checker application.

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Load data from Excel to JSON (first time only):
```bash
npm run load-data
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Search by Enrollment Number
```
POST /api/search/enrollment
Body: {
  "enrollmentNumber": "UP10579/13",
  "phoneNumber": "9876543210" (optional)
}
```

### Search by Name and District
```
POST /api/search/name-district
Body: {
  "name": "Rajesh Kumar",
  "district": "Lucknow",
  "phoneNumber": "9876543210" (optional)
}
```

### Capture Phone Number
```
POST /api/phone-capture
Body: {
  "phoneNumber": "9876543210",
  "source": "modal" (optional)
}
```

### Get Statistics
```
GET /api/stats
```

### Admin: Get Search Logs
```
GET /api/admin/search-logs
```

### Admin: Get Phone Captures
```
GET /api/admin/phone-captures
```

## Environment Variables

Create a `.env` file in the backend directory:
```
PORT=3001
NODE_ENV=development
```

## Data Structure

The voter database expects the following fields:
- ID
- enrolment_no
- enrolment_date
- COP_NO
- NAME
- Father_Name
- ADDRESS
- DISTRICT
- VOTER_DISTRICT
- Practice_bar
- MOB
- Member_Name
- Remark
- form_status

## Notes

- Data is loaded from `backend/data/dummy-cop-data.xlsx`
- Converted data is cached in `backend/data/voters.json`
- Search logs and phone captures are stored in memory (implement persistent storage for production)

