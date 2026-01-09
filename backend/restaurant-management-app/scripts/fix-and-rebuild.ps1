# Script pentru rebuild și reload imagini după adăugare endpoint /health

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

Write-Host "=== Rebuild si Reload Imagini (cu /health endpoint) ===" -ForegroundColor Green
Write-Host ""

# Detectează numele cluster-ului Kind
$kindClusters = kind get clusters 2>&1 | Out-String
$kindClusterName = "kind"  # default
if ($kindClusters -match "restaurant-cluster") {
    $kindClusterName = "restaurant-cluster"
    Write-Host "Cluster Kind detectat: restaurant-cluster" -ForegroundColor Cyan
} elseif ($kindClusters -match "kind") {
    $kindClusterName = "kind"
    Write-Host "Cluster Kind detectat: kind (default)" -ForegroundColor Cyan
} else {
    Write-Host "EROARE: Nu s-a gasit niciun cluster Kind!" -ForegroundColor Red
    exit 1
}

# Build imagini
Write-Host ""
Write-Host "=== [1/3] Building Docker Images ===" -ForegroundColor Green
cd $PROJECT_ROOT

Write-Host "Building auth-service..." -ForegroundColor Yellow
docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .

Write-Host "Building restaurant-service..." -ForegroundColor Yellow
docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .

Write-Host "Building reservations-service..." -ForegroundColor Yellow
docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .

Write-Host "Building menu-order-service..." -ForegroundColor Yellow
docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .

Write-Host "Build complet!" -ForegroundColor Green

# Load în Kind
Write-Host ""
Write-Host "=== [2/3] Loading Images into Kind ===" -ForegroundColor Green

Write-Host "Loading auth-service..." -ForegroundColor Cyan
kind load docker-image restaurant-auth-service:latest --name $kindClusterName

Write-Host "Loading restaurant-service..." -ForegroundColor Cyan
kind load docker-image restaurant-restaurant-service:latest --name $kindClusterName

Write-Host "Loading reservations-service..." -ForegroundColor Cyan
kind load docker-image restaurant-reservations-service:latest --name $kindClusterName

Write-Host "Loading menu-order-service..." -ForegroundColor Cyan
kind load docker-image restaurant-menu-order-service:latest --name $kindClusterName

Write-Host "Images loaded!" -ForegroundColor Green

# Restart pod-uri
Write-Host ""
Write-Host "=== [3/3] Restarting Pods ===" -ForegroundColor Green

Write-Host "Restarting auth-service..." -ForegroundColor Cyan
kubectl rollout restart deployment auth-service -n restaurant-app

Write-Host "Restarting restaurant-service..." -ForegroundColor Cyan
kubectl rollout restart deployment restaurant-service -n restaurant-app

Write-Host "Restarting reservations-service..." -ForegroundColor Cyan
kubectl rollout restart deployment reservations-service -n restaurant-app

Write-Host "Restarting menu-order-service..." -ForegroundColor Cyan
kubectl rollout restart deployment menu-order-service -n restaurant-app

Write-Host ""
Write-Host "Asteptam pod-urile sa fie ready (asta poate dura 30-60 secunde)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "Status pod-uri:" -ForegroundColor Cyan
kubectl get pods -n restaurant-app

Write-Host ""
Write-Host "=== Rebuild si Reload Complet! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Daca pod-urile nu sunt ready, verifica logurile cu:" -ForegroundColor Yellow
Write-Host "  .\scripts\debug-pods.ps1" -ForegroundColor Cyan
Write-Host ""


