# Script pentru port-forward la toate serviciile
# Rulează acest script într-un terminal separat pentru a accesa serviciile pe localhost:3000-3003

$ErrorActionPreference = "Stop"

Write-Host "=== Starting Port Forwarding ===" -ForegroundColor Green
Write-Host "Serviciile vor fi accesibile la:" -ForegroundColor Yellow
Write-Host "  Auth Service:        http://localhost:3000"
Write-Host "  Restaurant Service:  http://localhost:3001"
Write-Host "  Reservations:        http://localhost:3002"
Write-Host "  Menu Order:          http://localhost:3003"
Write-Host ""
Write-Host "Apasă Ctrl+C pentru a opri port-forwarding" -ForegroundColor Cyan
Write-Host ""

# Start port-forwarding în background jobs
$jobs = @()

Write-Host "Starting port-forward pentru auth-service..." -ForegroundColor Yellow
$job1 = Start-Job -ScriptBlock {
    kubectl port-forward -n restaurant-app svc/auth-service 3000:3000
}
$jobs += $job1

Write-Host "Starting port-forward pentru restaurant-service..." -ForegroundColor Yellow
$job2 = Start-Job -ScriptBlock {
    kubectl port-forward -n restaurant-app svc/restaurant-service 3001:3001
}
$jobs += $job2

Write-Host "Starting port-forward pentru reservations-service..." -ForegroundColor Yellow
$job3 = Start-Job -ScriptBlock {
    kubectl port-forward -n restaurant-app svc/reservations-service 3002:3002
}
$jobs += $job3

Write-Host "Starting port-forward pentru menu-order-service..." -ForegroundColor Yellow
$job4 = Start-Job -ScriptBlock {
    kubectl port-forward -n restaurant-app svc/menu-order-service 3003:3003
}
$jobs += $job4

Write-Host ""
Write-Host "Port-forwarding activ! Serviciile sunt accesibile." -ForegroundColor Green
Write-Host "Apasă Enter pentru a opri port-forwarding..." -ForegroundColor Yellow

# Așteaptă input de la utilizator
Read-Host

# Oprește toate job-urile
Write-Host "Oprind port-forwarding..." -ForegroundColor Yellow
$jobs | Stop-Job
$jobs | Remove-Job

Write-Host "Port-forwarding oprit." -ForegroundColor Green

