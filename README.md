
# Voter Registration Status Checker

This is a code bundle for Voter Registration Status Checker. The original project is available at https://www.figma.com/design/hHMUBpLtMofurNotIP6uC9/Voter-Registration-Status-Checker.

## Project Structure

This project consists of two parts:
- **Frontend**: React/Vite application (root directory)
- **Backend**: Node.js/Express API (backend directory)

## Quick Start

### Option 1: Use the startup script (Recommended)
```bash
./start-dev.sh
```

This will automatically:
- Install all dependencies
- Load voter data from Excel
- Start both backend and frontend servers

### Option 2: Manual setup

#### Backend Setup
```bash
cd backend
npm install
npm run load-data  # Load data from Excel (first time only)
npm start          # Start backend server on port 3001
```

#### Frontend Setup
In a new terminal:
```bash
npm install
npm run dev        # Start frontend on port 5173
```

## Environment Configuration

Create a `.env` file in the root directory:
```
VITE_API_URL=http://localhost:3001/api
```

## Data Management

- Place your Excel voter data file in `backend/data/` directory
- Run `npm run load-data` in the backend directory to convert Excel to JSON
- The converted data is stored in `backend/data/voters.json`

## API Documentation

See `backend/README.md` for complete API documentation.

### Key Endpoints:
- `POST /api/search/enrollment` - Search by enrollment number
- `POST /api/search/name-district` - Search by name and district
- `POST /api/phone-capture` - Capture phone numbers
- `GET /api/stats` - Get usage statistics

## Development

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:3001
- API health check: http://localhost:3001/api/health

## Features

1. **Voter Search**
   - Search by enrollment number
   - Search by name and district
   - Real-time results from backend database

2. **Phone Number Capture**
   - Modal on first visit
   - Optional phone capture before searches
   - All data saved to backend

3. **Multi-language Support**
   - Hindi and English interface
   - Language toggle

4. **Campaign Integration**
   - WhatsApp integration
   - Facebook profile/page links
   - Contact information
