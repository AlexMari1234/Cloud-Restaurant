# Script pentru accesare servicii - Port Forward

$ErrorActionPreference = "Stop"

Write-Host "=== Accesare Servicii Restaurant Management App ===" -ForegroundColor Green
Write-Host ""
Write-Host "Acest script pornește port-forward pentru toate serviciile." -ForegroundColor Cyan
Write-Host "Serviciile vor fi accesibile pe localhost:3000-3003" -ForegroundColor Cyan
Write-Host ""
Write-Host "Apasă Ctrl+C pentru a opri port-forwarding" -ForegroundColor Yellow
Write-Host ""

# Verifică dacă serviciile există
Write-Host "Verificând serviciile..." -ForegroundColor Yellow
$services = @(
    @{Name="auth-service"; Port=3000; ServicePort=3000},
    @{Name="restaurant-service"; Port=3001; ServicePort=3001},
    @{Name="reservations-service"; Port=3002; ServicePort=3002},
    @{Name="menu-order-service"; Port=3003; ServicePort=3003}
)

foreach ($svc in $services) {
    $exists = kubectl get svc $svc.Name -n restaurant-app 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "EROARE: Serviciul $($svc.Name) nu există în cluster!" -ForegroundColor Red
        Write-Host "Rulează mai întâi deploy: .\scripts\full-deploy.ps1" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Toate serviciile sunt disponibile!" -ForegroundColor Green
Write-Host ""
Write-Host "Servicii disponibile:" -ForegroundColor Cyan
Write-Host "  Auth Service:        http://localhost:3000" -ForegroundColor White
Write-Host "  Restaurant Service:  http://localhost:3001" -ForegroundColor White
Write-Host "  Reservations:        http://localhost:3002" -ForegroundColor White
Write-Host "  Menu Order:          http://localhost:3003" -ForegroundColor White
Write-Host ""

Write-Host "Pornind port-forward..." -ForegroundColor Yellow
Write-Host ""

# Start port-forwarding în background jobs
$jobs = @()

foreach ($svc in $services) {
    Write-Host "Starting port-forward pentru $($svc.Name) (localhost:$($svc.Port) -> $($svc.Name):$($svc.ServicePort))..." -ForegroundColor Cyan
    $job = Start-Job -ScriptBlock {
        param($name, $localPort, $servicePort, $namespace)
        kubectl port-forward -n $namespace svc/$name $localPort`:$servicePort 2>&1 | Out-Null
    } -ArgumentList $svc.Name, $svc.Port, $svc.ServicePort, "restaurant-app"
    $jobs += $job
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "=== Port-forwarding activ! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Serviciile sunt acum accesibile pe:" -ForegroundColor Cyan
foreach ($svc in $services) {
    Write-Host "  $($svc.Name): http://localhost:$($svc.Port)" -ForegroundColor White
}
Write-Host ""
Write-Host "Pentru MongoDB Express: http://localhost:30081" -ForegroundColor Yellow
Write-Host "Pentru Portainer: http://localhost:30090" -ForegroundColor Yellow
Write-Host ""
Write-Host "Apasă Enter pentru a opri port-forwarding..." -ForegroundColor Yellow

# Așteaptă input de la utilizator
Read-Host

# Oprește toate job-urile
Write-Host ""
Write-Host "Oprind port-forwarding..." -ForegroundColor Yellow
$jobs | Stop-Job
$jobs | Remove-Job

Write-Host "Port-forwarding oprit." -ForegroundColor Green


