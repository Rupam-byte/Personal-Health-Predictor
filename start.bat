@echo off
cd /d "%~dp0"
echo ====================================================================
echo Starting Personalized Healthcare Recommendation System...
echo ====================================================================

REM 1. Start Flask Backend Server (Port 5000)
start "Flask Backend (Port 5000)" cmd /k "python backend/app.py"

REM 2. Start React Frontend Server (Port 5173)
start "React Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

REM 3. Wait for servers to initialize
timeout /t 5

REM 4. Open URLs in browser
start http://localhost:5173
start http://localhost:5000