@echo off
cd /d "%~dp0"
echo ========================================
echo Iniciando Enyell Studios en localhost:3000
echo ========================================
call npm install
start http://localhost:3000
node server.js
pause
