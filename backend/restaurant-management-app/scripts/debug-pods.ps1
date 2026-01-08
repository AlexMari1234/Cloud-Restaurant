# Script pentru debugging pod-uri

$ErrorActionPreference = "Stop"

Write-Host "=== Debug Pod-uri ===" -ForegroundColor Green
Write-Host ""

# Verifică pod-uri care nu sunt Ready
Write-Host "Verificand pod-uri..." -ForegroundColor Yellow

# Auth Service
Write-Host ""
Write-Host "=== Auth Service ===" -ForegroundColor Cyan
$authPod = kubectl get pods -n restaurant-app -l app=auth-service -o jsonpath='{.items[0].metadata.name}' 2>&1
if ($authPod -and -not ($authPod -match "Error")) {
    Write-Host "Pod: $authPod" -ForegroundColor Yellow
    Write-Host "Status:" -ForegroundColor Cyan
    kubectl get pod -n restaurant-app $authPod
    Write-Host ""
    Write-Host "Descriere:" -ForegroundColor Cyan
    kubectl describe pod -n restaurant-app $authPod | Select-String -Pattern "State|Ready|Warning|Error|Restart" -Context 0,2
    Write-Host ""
    Write-Host "Loguri (ultimele 30 linii):" -ForegroundColor Cyan
    kubectl logs -n restaurant-app $authPod --tail=30 2>&1
}

# Restaurant Service
Write-Host ""
Write-Host "=== Restaurant Service ===" -ForegroundColor Cyan
$restPod = kubectl get pods -n restaurant-app -l app=restaurant-service -o jsonpath='{.items[0].metadata.name}' 2>&1
if ($restPod -and -not ($restPod -match "Error")) {
    Write-Host "Pod: $restPod" -ForegroundColor Yellow
    Write-Host "Status:" -ForegroundColor Cyan
    kubectl get pod -n restaurant-app $restPod
    Write-Host ""
    Write-Host "Loguri (ultimele 30 linii):" -ForegroundColor Cyan
    kubectl logs -n restaurant-app $restPod --tail=30 2>&1
}

# MongoDB
Write-Host ""
Write-Host "=== MongoDB ===" -ForegroundColor Cyan
$mongoPod = kubectl get pods -n restaurant-app -l app=mongodb -o jsonpath='{.items[0].metadata.name}' 2>&1
if ($mongoPod -and -not ($mongoPod -match "Error")) {
    Write-Host "Pod: $mongoPod" -ForegroundColor Yellow
    Write-Host "Status:" -ForegroundColor Cyan
    kubectl get pod -n restaurant-app $mongoPod
    Write-Host ""
    Write-Host "Loguri (ultimele 30 linii):" -ForegroundColor Cyan
    kubectl logs -n restaurant-app $mongoPod --tail=30 2>&1
}

# Kafka
Write-Host ""
Write-Host "=== Kafka ===" -ForegroundColor Cyan
$kafkaPod = kubectl get pods -n restaurant-app -l app=kafka -o jsonpath='{.items[0].metadata.name}' 2>&1
if ($kafkaPod -and -not ($kafkaPod -match "Error")) {
    Write-Host "Pod: $kafkaPod" -ForegroundColor Yellow
    Write-Host "Status:" -ForegroundColor Cyan
    kubectl get pod -n restaurant-app $kafkaPod
    Write-Host ""
    Write-Host "Loguri (ultimele 30 linii):" -ForegroundColor Cyan
    kubectl logs -n restaurant-app $kafkaPod --tail=30 2>&1
}

Write-Host ""
Write-Host "=== Debug Complet ===" -ForegroundColor Green

