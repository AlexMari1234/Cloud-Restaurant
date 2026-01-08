# Script pentru setup Minikube cluster

$ErrorActionPreference = "Stop"

Write-Host "=== Setup Minikube Cluster ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă Minikube este instalat
if (-not (Get-Command minikube -ErrorAction SilentlyContinue)) {
    Write-Host "EROARE: Minikube nu este instalat!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalează Minikube:" -ForegroundColor Yellow
    Write-Host "  Windows (Chocolatey): choco install minikube" -ForegroundColor White
    Write-Host "  Windows (Scoop): scoop install minikube" -ForegroundColor White
    Write-Host "  Manual: https://minikube.sigs.k8s.io/docs/start/" -ForegroundColor White
    exit 1
}

Write-Host "Minikube: OK" -ForegroundColor Green

# Verifică statusul Minikube
Write-Host ""
Write-Host "Verificând statusul Minikube..." -ForegroundColor Yellow
$minikubeStatus = minikube status 2>&1 | Out-String

if ($minikubeStatus -match "Running") {
    Write-Host "Minikube rulează deja!" -ForegroundColor Green
    Write-Host ""
    minikube status
    Write-Host ""
    Write-Host "Cluster-ul este gata!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acum poți rula deploy cu: .\scripts\full-deploy.ps1" -ForegroundColor Cyan
    exit 0
}

# Pornește Minikube
Write-Host "Pornind Minikube..." -ForegroundColor Yellow
Write-Host "(Aceasta poate dura câteva minute la prima pornire)" -ForegroundColor Cyan
Write-Host ""

minikube start

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Minikube pornit cu succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status:" -ForegroundColor Cyan
    minikube status
    
    Write-Host ""
    Write-Host "Cluster info:" -ForegroundColor Cyan
    kubectl cluster-info
    
    Write-Host ""
    Write-Host "=== Cluster gata! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acum poți rula deploy cu: .\scripts\full-deploy.ps1" -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Notă: Pentru a folosi Docker cu Minikube, rulează:" -ForegroundColor Yellow
    Write-Host "  eval `$(minikube docker-env)" -ForegroundColor White
    Write-Host "  SAU" -ForegroundColor Yellow
    Write-Host "  .\scripts\load-images-minikube.ps1" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "EROARE: Nu s-a putut porni Minikube!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifică logurile cu: minikube logs" -ForegroundColor Yellow
    exit 1
}

