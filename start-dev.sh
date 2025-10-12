#!/bin/bash

# Startup script for development environment

echo "🚀 Starting Voter Registration Status Checker Development Environment"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Check if frontend dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check if voters.json exists, if not load data
if [ ! -f "backend/data/voters.json" ]; then
    echo "📊 Loading voter data from Excel..."
    cd backend && npm run load-data && cd ..
fi

echo ""
echo "✅ Dependencies ready!"
echo ""
echo "Starting services..."
echo "  - Backend API: http://localhost:3001"
echo "  - Frontend: http://localhost:5173"
echo ""

# Start backend in background
cd backend && npm start &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
cd ..
npm run dev

# Cleanup when script exits
trap "kill $BACKEND_PID" EXIT

