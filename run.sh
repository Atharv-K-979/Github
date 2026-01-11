#!/bin/bash

echo "Starting GitHub Clone Application..."
echo ""
echo "Make sure you have:"
echo "1. Node.js installed"
echo "2. MongoDB running (local or Atlas)"
echo "3. Created backend/.env file with MONGODB_URI and JWT_SECRET_KEY"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "WARNING: backend/.env file not found!"
    echo "Please create it with the following variables:"
    echo "  PORT=3002"
    echo "  MONGODB_URI=mongodb://localhost:27017/github-clone"
    echo "  JWT_SECRET_KEY=your-secret-key"
    echo ""
    read -p "Press enter to continue anyway..."
fi

echo "Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

sleep 3

echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:3002"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

