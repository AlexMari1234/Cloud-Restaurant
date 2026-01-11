# Script pentru accesare servicii - Port Forward (include Prometheus & Grafana)

$ErrorActionPreference = "Stop"

Write-Host "=== Accesare Servicii Restaurant Management App (cu Monitoring) ===" -ForegroundColor Green
Write-Host ""
Write-Host "Acest script pornește port-forward pentru toate serviciile, inclusiv Prometheus și Grafana." -ForegroundColor Cyan
Write-Host ""
Write-Host "Porturi locale:" -ForegroundColor Cyan
Write-Host "  - Servicii aplicație: 4000-4003 (pentru a evita conflictele cu serviciile locale)" -ForegroundColor White
Write-Host "  - Grafana: 3030 (pentru a evita conflictul cu auth-service local pe 3000)" -ForegroundColor White
Write-Host "  - Prometheus: 9090" -ForegroundColor White
Write-Host ""
Write-Host "Apasă Ctrl+C pentru a opri port-forwarding" -ForegroundColor Yellow
Write-Host ""

# Verifică dacă serviciile există
Write-Host "Verificând serviciile..." -ForegroundColor Yellow
$services = @(
    @{Name="auth-service"; LocalPort=4000; ServicePort=3000; Description="Auth Service"},
    @{Name="restaurant-service"; LocalPort=4001; ServicePort=3001; Description="Restaurant Service"},
    @{Name="reservations-service"; LocalPort=4002; ServicePort=3002; Description="Reservations Service"},
    @{Name="menu-order-service"; LocalPort=4003; ServicePort=3003; Description="Menu Order Service"},
    @{Name="grafana"; LocalPort=3030; ServicePort=3000; Description="Grafana (Monitoring)"},
    @{Name="prometheus"; LocalPort=9090; ServicePort=9090; Description="Prometheus (Metrics)"},
    @{Name="mongo-express"; LocalPort=8081; ServicePort=8081; Description="MongoDB Express"},
    @{Name="portainer"; LocalPort=9000; ServicePort=9000; Description="Portainer"}
)

$missingServices = @()
foreach ($svc in $services) {
    $exists = kubectl get svc $svc.Name -n restaurant-app 2>&1
    if ($LASTEXITCODE -ne 0) {
        $missingServices += $svc.Name
    }
}

if ($missingServices.Count -gt 0) {
    Write-Host "ATENȚIE: Următoarele servicii nu există în cluster:" -ForegroundColor Yellow
    foreach ($svc in $missingServices) {
        Write-Host "  - $svc" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "Rulează mai întâi: .\scripts\install-helm-chart.ps1" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Vrei să continui cu serviciile disponibile? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 0
    }
}

Write-Host "Pornind port-forward pentru serviciile disponibile..." -ForegroundColor Green
Write-Host ""

# Start port-forwarding în background processes
$processes = @()

foreach ($svc in $services) {
    $exists = kubectl get svc $svc.Name -n restaurant-app 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Starting port-forward pentru $($svc.Description)..." -ForegroundColor Cyan
        Write-Host "  Local: http://localhost:$($svc.LocalPort) -> $($svc.Name):$($svc.ServicePort)" -ForegroundColor Gray
        $process = Start-Process -FilePath "kubectl" -ArgumentList "port-forward", "-n", "restaurant-app", "svc/$($svc.Name)", "$($svc.LocalPort):$($svc.ServicePort)" -PassThru -WindowStyle Hidden
        $processes += @{
            Process = $process
            Name = $svc.Name
            Description = $svc.Description
        }
        Start-Sleep -Milliseconds 500
    } else {
        Write-Host "Skipping $($svc.Name) - nu există în cluster" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Port-forwarding activ! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Serviciile sunt acum accesibile pe:" -ForegroundColor Cyan
Write-Host ""

# Aplicație
Write-Host "=== Aplicație ===" -ForegroundColor Yellow
Write-Host "  Auth Service:        http://localhost:4000" -ForegroundColor White
Write-Host "  Restaurant Service:  http://localhost:4001" -ForegroundColor White
Write-Host "  Reservations:        http://localhost:4002" -ForegroundColor White
Write-Host "  Menu Order:          http://localhost:4003" -ForegroundColor White
Write-Host ""

# Monitoring
Write-Host "=== Monitoring ===" -ForegroundColor Yellow
Write-Host "  Grafana:             http://localhost:3030 (admin/admin123)" -ForegroundColor White
Write-Host "    - Loki Logs:       Explore > Select 'Loki' data source" -ForegroundColor Gray
Write-Host "  Prometheus:          http://localhost:9090" -ForegroundColor White
Write-Host ""

# Utilitare
Write-Host "=== Utilitare ===" -ForegroundColor Yellow
Write-Host "  MongoDB Express:     http://localhost:8081" -ForegroundColor White
Write-Host "  Portainer:           http://localhost:9000" -ForegroundColor White
Write-Host ""

Write-Host "Pentru a opri port-forwarding, apasă Enter..." -ForegroundColor Yellow
Write-Host ""

# Așteaptă input de la utilizator
Read-Host

# Oprește toate procesele
Write-Host ""
Write-Host "Oprind port-forwarding..." -ForegroundColor Yellow
foreach ($procInfo in $processes) {
    if (-not $procInfo.Process.HasExited) {
        Write-Host "  Oprind $($procInfo.Description)..." -ForegroundColor Gray
        Stop-Process -Id $procInfo.Process.Id -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Port-forwarding oprit." -ForegroundColor Green

