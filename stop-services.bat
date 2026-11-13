@echo off
TITLE Stop AI-Powered E-Mandi
echo Stopping E-Mandi background processes...
taskkill /F /IM mongod.exe 2>nul
taskkill /F /FI "WINDOWTITLE eq E-Mandi*" 2>nul
echo Done!
pause
