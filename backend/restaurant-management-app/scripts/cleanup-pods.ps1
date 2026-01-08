# Script pentru cleanup pod-uri duplicate și restart

$ErrorActionPreference = "Stop"

Write-Host "=== Cleanup Pod-uri și Restart ===" -ForegroundColor Green
Write-Host ""

# Listează deployment-urile
Write-Host "Deployment-uri existente:" -ForegroundColor Cyan
kubectl get deployments -n restaurant-app

Write-Host ""
$response = Read-Host "Vrei sa scalezi toate deployment-urile la 1 replica? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "Scaland deployment-uri la 1 replica..." -ForegroundColor Yellow
    
    kubectl scale deployment auth-service -n restaurant-app --replicas=1
    kubectl scale deployment restaurant-service -n restaurant-app --replicas=1
    kubectl scale deployment reservations-service -n restaurant-app --replicas=1
    kubectl scale deployment menu-order-service -n restaurant-app --replicas=1
    kubectl scale deployment mongodb -n restaurant-app --replicas=1
    kubectl scale deployment mongo-express -n restaurant-app --replicas=1
    kubectl scale deployment portainer -n restaurant-app --replicas=1
    kubectl scale deployment zookeeper -n restaurant-app --replicas=1
    kubectl scale deployment kafka -n restaurant-app --replicas=1
    
    Write-Host "Deployment-uri scalate!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Asteptam pod-urile vechi sa fie terminate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Status pod-uri:" -ForegroundColor Cyan
kubectl get pods -n restaurant-app

Write-Host ""
Write-Host "Pentru verificare detaliată, rulează:" -ForegroundColor Yellow
Write-Host "  .\scripts\check-pods.ps1" -ForegroundColor Cyan

