# Script pentru verificare detaliată pod-uri

$ErrorActionPreference = "Stop"

Write-Host "=== Verificare Detaliată Pod-uri ===" -ForegroundColor Green
Write-Host ""

# Lista pod-uri
Write-Host "Status pod-uri:" -ForegroundColor Cyan
kubectl get pods -n restaurant-app

Write-Host ""
Write-Host "Pod-uri care nu sunt Ready:" -ForegroundColor Yellow
$notReadyPods = kubectl get pods -n restaurant-app -o json | ConvertFrom-Json
foreach ($pod in $notReadyPods.items) {
    $ready = ($pod.status.conditions | Where-Object { $_.type -eq "Ready" }).status
    if ($ready -ne "True") {
        Write-Host ""
        Write-Host "=== $($pod.metadata.name) ===" -ForegroundColor Red
        Write-Host "Status: $($pod.status.phase)" -ForegroundColor Yellow
        Write-Host "Ready: $ready" -ForegroundColor Yellow
        
        # Verifică container status
        foreach ($container in $pod.status.containerStatuses) {
            if ($container.ready -eq $false) {
                Write-Host "Container: $($container.name) - NOT READY" -ForegroundColor Red
                if ($container.state.waiting) {
                    Write-Host "  Reason: $($container.state.waiting.reason)" -ForegroundColor Yellow
                    Write-Host "  Message: $($container.state.waiting.message)" -ForegroundColor Yellow
                }
                if ($container.state.running -and $container.restartCount -gt 0) {
                    Write-Host "  Restarts: $($container.restartCount)" -ForegroundColor Yellow
                }
            }
        }
        
        # Loguri (primele 20 linii)
        Write-Host ""
        Write-Host "Loguri (ultimele 20 linii):" -ForegroundColor Cyan
        kubectl logs -n restaurant-app $pod.metadata.name --tail=20 2>&1 | Select-Object -First 20
    }
}

Write-Host ""
Write-Host "=== Verificare Completă ===" -ForegroundColor Green


