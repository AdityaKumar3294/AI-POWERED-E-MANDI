@echo off
TITLE AI-Powered E-Mandi Launcher
echo ======================================================================
echo           Starting AI-Powered E-Mandi Development Stack
echo ======================================================================

echo [1/4] Starting MongoDB Server on 127.0.0.1:27017...
start "E-Mandi MongoDB" "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "%~dp0.mongo\db" --bind_ip 127.0.0.1 --port 27017
timeout /t 2 /nobreak >nul

echo [2/4] Starting FastAPI AI Grading Microservice on port 8000...
start "E-Mandi AI Service" cmd /k "cd /d "%~dp0ai-service" && "C:\Users\AKHAND PRATAP SINGH\anaconda3\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000"
timeout /t 2 /nobreak >nul

echo [3/4] Starting Express.js Backend API on port 5000...
start "E-Mandi Backend" cmd /k "cd /d "%~dp0backend" && npm start"
timeout /t 2 /nobreak >nul

echo [4/4] Starting Vite React 19 Frontend on port 3000...
start "E-Mandi Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================================
echo  All 4 E-Mandi Services Launched Successfully!
echo.
echo  - Frontend Web UI:    http://localhost:3000
echo  - Backend API:        http://localhost:5000/api/health
echo  - AI YOLO Service:    http://localhost:8000/health
echo  - MongoDB Database:   127.0.0.1:27017
echo ======================================================================
pause

