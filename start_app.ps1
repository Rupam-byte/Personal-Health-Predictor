# ============================================================================
# Personalized Healthcare Recommendation System - Concurrent Runner
# Save file as: start_app.ps1
# Usage: .\start_app.ps1
# ============================================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  Starting Personalized Healthcare Recommendation System" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan

# 1. Start Flask Backend Server (Port 5000)
Write-Host "`n[1/3] Launching Flask Backend Server (Python + ML Models)..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "powershell.exe" `
    -ArgumentList "-NoExit", "-Command", "Set-Location '$ProjectRoot'; python backend/app.py" `
    -PassThru

# 2. Start Frontend Server (React/Vite on Port 5173 or Static Server on Port 8000)
Write-Host "[2/3] Launching Frontend Application..." -ForegroundColor Yellow

if (Test-Path "$ProjectRoot\frontend\package.json") {
    Write-Host " -> Detected React/Vite frontend in ./frontend" -ForegroundColor Gray
    $frontendProcess = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "Set-Location '$ProjectRoot\frontend'; npm run dev" `
        -PassThru
} elseif (Test-Path "$ProjectRoot\server.py") {
    Write-Host " -> Detected static server in ./server.py" -ForegroundColor Gray
    $frontendProcess = Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "Set-Location '$ProjectRoot'; python server.py" `
        -PassThru
}

# 3. Wait for servers to initialize
Write-Host "`n[3/3] Waiting for servers to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

Write-Host "`n=====================================================================" -ForegroundColor Cyan
Write-Host "  System is now RUNNING simultaneously!" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  Flask Backend API:    http://localhost:5000" -ForegroundColor Green
Write-Host "  React Dev Server:     http://localhost:5173" -ForegroundColor Green
Write-Host "  API Health Endpoint:  http://localhost:5000/health" -ForegroundColor Green
Write-Host "  API Dashboard Page:   http://localhost:5000/" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan

# Automatically open browser tabs
Start-Process "http://localhost:5173"
Start-Process "http://localhost:5000"
