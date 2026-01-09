# Script pentru build imagini Docker pentru microservicii

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

Write-Host "=== Building Docker Images ===" -ForegroundColor Green

cd $PROJECT_ROOT

Write-Host "Building auth-service..." -ForegroundColor Yellow
docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .

Write-Host "Building restaurant-service..." -ForegroundColor Yellow
docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .

Write-Host "Building reservations-service..." -ForegroundColor Yellow
docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .

Write-Host "Building menu-order-service..." -ForegroundColor Yellow
docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .

Write-Host ""
Write-Host "=== Build complet! ===" -ForegroundColor Green
Write-Host "Imagini create:"
docker images | Select-String "restaurant-"


