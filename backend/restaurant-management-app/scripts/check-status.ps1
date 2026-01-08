# Script pentru verificare status deployment

$ErrorActionPreference = "Stop"

Write-Host "=== Restaurant Management App - Status Check ===" -ForegroundColor Green
Write-Host ""

# Verifică namespace
Write-Host "Namespace:" -ForegroundColor Cyan
kubectl get namespace restaurant-app
Write-Host ""

# Verifică pod-urile
Write-Host "Pod-uri:" -ForegroundColor Cyan
kubectl get pods -n restaurant-app
Write-Host ""

# Verifică serviciile
Write-Host "Servicii:" -ForegroundColor Cyan
kubectl get svc -n restaurant-app
Write-Host ""

# Verifică PVC-urile
Write-Host "Persistent Volume Claims:" -ForegroundColor Cyan
kubectl get pvc -n restaurant-app
Write-Host ""

# Verifică ConfigMaps
Write-Host "ConfigMaps:" -ForegroundColor Cyan
kubectl get configmap -n restaurant-app
Write-Host ""

# Verifică Secrets
Write-Host "Secrets:" -ForegroundColor Cyan
kubectl get secret -n restaurant-app
Write-Host ""

# Verifică pod-urile care nu sunt ready
Write-Host "Pod-uri care nu sunt Ready:" -ForegroundColor Yellow
$notReady = kubectl get pods -n restaurant-app -o json | ConvertFrom-Json | Where-Object { $_.items.status.phase -ne "Running" -or ($_.items.status.conditions | Where-Object { $_.type -eq "Ready" -and $_.status -ne "True" }) }
if ($notReady) {
    $notReady.items | ForEach-Object {
        Write-Host "  - $($_.metadata.name): $($_.status.phase)" -ForegroundColor Red
    }
} else {
    Write-Host "  Toate pod-urile sunt Running!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pentru detalii despre un pod: kubectl describe pod -n restaurant-app <pod-name>" -ForegroundColor Cyan
Write-Host "Pentru loguri: kubectl logs -n restaurant-app <pod-name>" -ForegroundColor Cyan

