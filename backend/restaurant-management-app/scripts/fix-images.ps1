# Script pentru fixare imagini lipsă în Kind cluster

$ErrorActionPreference = "Stop"

Write-Host "=== Fixare Imagini Lipsă în Kind Cluster ===" -ForegroundColor Green
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

Write-Host ""
Write-Host "Verificand daca imaginile exista local..." -ForegroundColor Yellow
$images = @(
    "restaurant-auth-service:latest",
    "restaurant-restaurant-service:latest",
    "restaurant-reservations-service:latest",
    "restaurant-menu-order-service:latest"
)

$missingImages = @()
foreach ($image in $images) {
    $exists = docker images $image --format "{{.Repository}}:{{.Tag}}" 2>&1
    if ($exists -eq $image) {
        Write-Host "  OK $image" -ForegroundColor Green
    } else {
        Write-Host "  X $image - LIPSA!" -ForegroundColor Red
        $missingImages += $image
    }
}

if ($missingImages.Count -gt 0) {
    Write-Host ""
    Write-Host "Unele imagini lipsesc! Ruleaza mai intai:" -ForegroundColor Yellow
    Write-Host "  .\scripts\build-images.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Incarcam imaginile in cluster Kind '$kindClusterName'..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Loading auth-service..." -ForegroundColor Cyan
kind load docker-image restaurant-auth-service:latest --name $kindClusterName
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE la încărcarea auth-service!" -ForegroundColor Red
    exit 1
}

Write-Host "Loading restaurant-service..." -ForegroundColor Cyan
kind load docker-image restaurant-restaurant-service:latest --name $kindClusterName
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE la încărcarea restaurant-service!" -ForegroundColor Red
    exit 1
}

Write-Host "Loading reservations-service..." -ForegroundColor Cyan
kind load docker-image restaurant-reservations-service:latest --name $kindClusterName
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE la încărcarea reservations-service!" -ForegroundColor Red
    exit 1
}

Write-Host "Loading menu-order-service..." -ForegroundColor Cyan
kind load docker-image restaurant-menu-order-service:latest --name $kindClusterName
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE la încărcarea menu-order-service!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Imagini incarcate cu succes! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Restart pod-urile pentru a folosi imaginile noi:" -ForegroundColor Yellow
Write-Host "  kubectl rollout restart deployment -n restaurant-app" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "Vrei sa restartezi acum pod-urile? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Restart pod-urile..." -ForegroundColor Yellow
    kubectl rollout restart deployment -n restaurant-app
    
    Write-Host ""
    Write-Host "Asteptam pod-urile sa fie ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host ""
    Write-Host "Status pod-uri:" -ForegroundColor Cyan
    kubectl get pods -n restaurant-app
}

