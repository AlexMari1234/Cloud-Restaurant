# Script pentru a curata pod-urile duplicate si a verifica statusul

Write-Host "=== Curatare pod-uri duplicate si verificare status ===" -ForegroundColor Cyan

$namespace = "restaurant-app"

# Curata pod-urile duplicate (păstreaza doar cele mai noi)
Write-Host ""
Write-Host "=== Curatare pod-uri duplicate ===" -ForegroundColor Cyan

# Obtine toate deployment-urile
$deployments = kubectl get deployments -n $namespace -o jsonpath='{.items[*].metadata.name}' 2>$null

foreach ($deployment in $deployments -split ' ') {
    if ($deployment) {
        Write-Host ""
        Write-Host "Verific deployment: $deployment" -ForegroundColor Yellow
        
        # Obtine toate pod-urile pentru acest deployment
        $pods = kubectl get pods -n $namespace -l app=$deployment -o jsonpath='{.items[*].metadata.name}' 2>$null
        $podCount = ($pods -split ' ' | Where-Object { $_ }).Count
        
        if ($podCount -gt 1) {
            Write-Host "  Gasite $podCount pod-uri pentru $deployment" -ForegroundColor Yellow
            
            # Obtine pod-urile cu varsta lor (sortate dupa varsta, cele mai vechi primul)
            $podList = kubectl get pods -n $namespace -l app=$deployment -o json | ConvertFrom-Json
            $sortedPods = $podList.items | Sort-Object { $_.metadata.creationTimestamp }
            
            # Sterge toate in afara de cel mai nou
            $newestPod = $sortedPods[-1].metadata.name
            foreach ($pod in $sortedPods[0..($sortedPods.Count-2)]) {
                $podName = $pod.metadata.name
                if ($podName -ne $newestPod) {
                    Write-Host "  Sterg pod vechi: $podName" -ForegroundColor Gray
                    kubectl delete pod -n $namespace $podName --ignore-not-found=true 2>&1 | Out-Null
                }
            }
        }
    }
}

# Asteapta 5 secunde
Write-Host ""
Write-Host "Asteapta 5 secunde..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verifica statusul actualizat
Write-Host ""
Write-Host "=== Status dupa curatare ===" -ForegroundColor Cyan
kubectl get pods -n $namespace

# Verifica pod-urile care nu sunt Ready
Write-Host ""
Write-Host "=== Pod-uri cu probleme ===" -ForegroundColor Yellow
$problemPods = kubectl get pods -n $namespace --no-headers 2>$null | Where-Object { 
    $_ -notmatch '1/1.*Running' -and $_ -notmatch 'Completed' 
}

if ($problemPods) {
    foreach ($podLine in $problemPods) {
        $podName = ($podLine -split '\s+')[0]
        $status = ($podLine -split '\s+')[2]
        $restarts = ($podLine -split '\s+')[3]
        
        Write-Host ""
        Write-Host "Pod: $podName" -ForegroundColor Red
        Write-Host "  Status: $status" -ForegroundColor Yellow
        Write-Host "  Restarts: $restarts" -ForegroundColor Yellow
        
        if ($status -eq "ContainerCreating") {
            Write-Host "  Verifica events: kubectl describe pod -n $namespace $podName | Select-String -Pattern 'Events|Warning|Error'" -ForegroundColor Gray
        } else {
            Write-Host "  Loguri: kubectl logs -n $namespace $podName --tail=30" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "Toate pod-urile sunt OK!" -ForegroundColor Green
}

# Verifica Portainer specific (cel mai problematic)
Write-Host ""
Write-Host "=== Verificare Portainer (blocat in ContainerCreating) ===" -ForegroundColor Cyan
$portainerPods = kubectl get pods -n $namespace -l app=portainer -o jsonpath='{.items[*].metadata.name}' 2>$null
if ($portainerPods) {
    foreach ($pod in ($portainerPods -split ' ')) {
        if ($pod) {
            Write-Host ""
            Write-Host "Verific pod Portainer: $pod" -ForegroundColor Yellow
            $describe = kubectl describe pod -n $namespace $pod 2>&1 | Select-String -Pattern "Events:|Warning:|Error:|MountVolume|PVC" -Context 2
            $describe
        }
    }
}

# Verifica microserviciile care nu se conecteaza la MongoDB
Write-Host ""
Write-Host "=== Verificare microservicii (conexiune MongoDB) ===" -ForegroundColor Cyan
$services = @("auth-service", "restaurant-service", "reservations-service", "menu-order-service")
foreach ($service in $services) {
    $pod = kubectl get pods -n $namespace -l app=$service -o jsonpath='{.items[0].metadata.name}' 2>$null
    if ($pod) {
        $podStatus = kubectl get pod -n $namespace $pod -o jsonpath='{.status.phase}' 2>$null
        if ($podStatus -ne "Running") {
            Write-Host ""
            Write-Host "Service: $service (pod: $pod)" -ForegroundColor Yellow
            Write-Host "  Status: $podStatus" -ForegroundColor $(if ($podStatus -eq "Running") { "Green" } else { "Red" })
            
            # Verifica ultimele loguri pentru erori MongoDB
            $logs = kubectl logs -n $namespace $pod --tail=20 2>&1 | Select-String -Pattern "MongoDB|ECONNREFUSED|connection|error|Error" -Context 1
            if ($logs) {
                Write-Host "  Loguri relevante:" -ForegroundColor Gray
                $logs | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
            }
        }
    }
}

Write-Host ""
Write-Host "=== Gata! ===" -ForegroundColor Cyan
Write-Host "Pentru a vedea toate pod-urile: kubectl get pods -n $namespace" -ForegroundColor Gray


