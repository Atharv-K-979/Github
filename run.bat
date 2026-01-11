@echo off
echo Starting GitHub Clone Application...
echo.
echo Make sure you have:
echo 1. Node.js installed
echo 2. MongoDB running (local or Atlas)
echo 3. Created backend\.env file with MONGODB_URI and JWT_SECRET_KEY
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"
echo.
echo Both servers are starting in separate windows.
echo Backend: http://localhost:3002
echo Frontend: http://localhost:5173
echo.
pause

