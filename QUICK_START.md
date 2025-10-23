# Quick Start Guide - Voter Registration Website

## Prerequisites Check
```bash
# Check Docker is installed
docker --version

# Check Node.js is installed
node --version
```

## Step-by-Step Setup

### 1. Start Docker Desktop
```bash
# Open Docker Desktop application
open -a Docker

# Wait 10-15 seconds for Docker to fully start
```

### 2. Start PostgreSQL Container
```bash
# Check if container exists and start it
docker ps -a | grep voter-postgres
docker start voter-postgres

# Verify it's running (should show "Up XX seconds")
docker ps | grep voter-postgres
```

Expected output:
```
2ea84fc7a8dc   postgres:15   "docker-entrypoint.s…"   X days ago   Up XX seconds   0.0.0.0:5432->5432/tcp   voter-postgres
```

### 3. Start Backend Server
```bash
# Open Terminal 1
cd /Users/abhinavtripathi/voter-webiste/backend
npm run dev
```

Expected output:
```
✅ Database connected
🚀 Voter Registration API Server (PostgreSQL) running on port 3001
📊 Database has 481,217 voter records
✅ Backend is ready with PostgreSQL!
```

### 4. Start Frontend Server
```bash
# Open Terminal 2
cd /Users/abhinavtripathi/voter-webiste
npm run dev
```

Expected output:
```
VITE v5.x.x ready in XXX ms
➜ Local: http://localhost:5173/
```

### 5. Access Application
Open browser: **http://localhost:5173**

---

## Troubleshooting

### Error: "Cannot connect to the Docker daemon"
**Solution:** Docker Desktop is not running
```bash
open -a Docker
# Wait 10-15 seconds, then retry
```

### Error: "ECONNREFUSED ::1:5432"
**Solution:** PostgreSQL container is not running
```bash
docker start voter-postgres
docker ps | grep voter-postgres
```

### Error: "EADDRINUSE: address already in use :::3001"
**Solution:** Port 3001 is already in use
```bash
# Find and kill the process
lsof -ti :3001 | xargs kill -9
# Then restart backend
cd backend && npm run dev
```

### Backend shows 0 records
**Solution:** Import data
```bash
cd backend
node src/importMassiveDataset.js
```

---

## Daily Workflow

### Starting Everything
```bash
# 1. Start Docker (if not running)
open -a Docker

# 2. Start PostgreSQL
docker start voter-postgres

# 3. Start Backend (Terminal 1)
cd /Users/abhinavtripathi/voter-webiste/backend
npm run dev

# 4. Start Frontend (Terminal 2)
cd /Users/abhinavtripathi/voter-webiste
npm run dev
```

### Stopping Everything
```bash
# 1. Stop Frontend: Ctrl+C in Terminal 2
# 2. Stop Backend: Ctrl+C in Terminal 1
# 3. Stop PostgreSQL (optional)
docker stop voter-postgres
```

---

## Verification Commands

### Check Docker Status
```bash
docker ps | grep voter-postgres
# Should show: Up XX seconds
```

### Check Backend Health
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"OK","totalRecords":481217}
```

### Check Frontend
Open browser: http://localhost:5173

### Check Database Records
```bash
docker exec -it voter-postgres psql -U postgres -d voter_registration -c "SELECT COUNT(*) FROM voters;"
# Should show: 481217
```

---

## Important Files

- **Backend Config:** `/Users/abhinavtripathi/voter-webiste/backend/.env`
- **Database:** Docker container `voter-postgres` (Postgres 15)
- **CSV Data:** `/Users/abhinavtripathi/voter-webiste/advocates_voter_list_corrected.csv`
- **Backend Server:** `backend/src/serverPostgres.js`
- **Frontend:** Runs on port 5173

---

## Common Commands Reference

```bash
# Docker
docker ps                          # List running containers
docker ps -a                       # List all containers
docker start voter-postgres        # Start PostgreSQL
docker stop voter-postgres         # Stop PostgreSQL
docker restart voter-postgres      # Restart PostgreSQL

# Backend
cd backend
npm run dev                        # Start with auto-reload
npm start                          # Start normally
lsof -ti :3001 | xargs kill -9    # Kill process on port 3001

# Frontend
npm run dev                        # Start frontend
npm run build                      # Build for production

# Database
docker exec -it voter-postgres psql -U postgres -d voter_registration
# Then in psql:
\dt                               # List tables
SELECT COUNT(*) FROM voters;      # Count records
\q                                # Exit psql
```

---

## System Architecture

```
┌─────────────────┐
│   Browser       │
│ localhost:5173  │
└────────┬────────┘
         │
         ├─> Frontend (React/Vite)
         │
         ▼
┌─────────────────┐
│   Backend API   │
│ localhost:3001  │
└────────┬────────┘
         │
         ├─> Express.js Server
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   Docker        │
│   Port 5432     │
└─────────────────┘
   481,217 records
```

---

## Project Status

✅ Docker: Running
✅ PostgreSQL: Running (postgres:15)
✅ Database: voter_registration (481,217 records)
✅ Backend: Port 3001
✅ Frontend: Port 5173

---

**Last Updated:** October 23, 2025
**Database Records:** 481,217 voters
**Container:** voter-postgres (postgres:15)
