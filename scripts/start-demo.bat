@echo off
REM Windows: runs PharmaChain in DEMO MODE (no Docker needed). For real Fabric on Windows use WSL2 (see README).
cd /d "%~dp0.."
if not exist .env copy .env.example .env
set FABRIC_MODE=demo
cd backend
if not exist node_modules call npm install
start "PharmaChain Backend" cmd /k node app.js
cd ..\frontend
if not exist node_modules call npm install
start "PharmaChain Frontend" cmd /k npm run dev
echo Open http://localhost:5173
