# Script pentru încărcare imagini în Kind cluster

$ErrorActionPreference = "Stop"

Write-Host "=== Loading Images into Kind Cluster ===" -ForegroundColor Green

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
    Write-Host "EROARE: Nu s-a găsit niciun cluster Kind!" -ForegroundColor Red
    Write-Host "Creează un cluster cu: .\scripts\setup-kind-cluster.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Loading auth-service..." -ForegroundColor Yellow
kind load docker-image restaurant-auth-service:latest --name $kindClusterName

Write-Host "Loading restaurant-service..." -ForegroundColor Yellow
kind load docker-image restaurant-restaurant-service:latest --name $kindClusterName

Write-Host "Loading reservations-service..." -ForegroundColor Yellow
kind load docker-image restaurant-reservations-service:latest --name $kindClusterName

Write-Host "Loading menu-order-service..." -ForegroundColor Yellow
kind load docker-image restaurant-menu-order-service:latest --name $kindClusterName

Write-Host ""
Write-Host "=== Images loaded successfully! ===" -ForegroundColor Green

