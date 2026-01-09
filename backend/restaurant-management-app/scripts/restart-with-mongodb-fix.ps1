# Script pentru a aplica fix-ul MongoDB si a reporni toate pod-urile
# Acest script:
# 1. Aplica deployment-ul MongoDB actualizat cu health checks mai lungi
# 2. Restarteaza toate pod-urile din namespace
# 3. Verifica statusul final

Write-Host "=== Restart cluster cu fix MongoDB ===" -ForegroundColor Cyan

$namespace = "restaurant-app"
$k8sDir = "k8s"

# Verifica daca suntem in directorul corect
if (-not (Test-Path $k8sDir)) {
    Write-Host "EROARE: Directorul k8s nu exista!" -ForegroundColor Red
    Write-Host "Ruleaza scriptul din directorul backend/restaurant-management-app/scripts" -ForegroundColor Yellow
    exit 1
}

# Verifica daca namespace-ul exista
Write-Host ""
Write-Host "Verific namespace '$namespace'..." -ForegroundColor Yellow
$nsExists = kubectl get namespace $namespace 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Namespace '$namespace' nu exista!" -ForegroundColor Red
    exit 1
}

# Pas 1: Aplica deployment-ul MongoDB actualizat
Write-Host ""
Write-Host "=== Pas 1: Aplicare deployment MongoDB actualizat ===" -ForegroundColor Cyan
kubectl apply -f "$k8sDir/mongodb/deployment.yaml"
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Nu s-a putut aplica deployment-ul MongoDB!" -ForegroundColor Red
    exit 1
}
Write-Host "Deployment MongoDB actualizat cu succes!" -ForegroundColor Green

# Pas 2: Restarteaza toate pod-urile
Write-Host ""
Write-Host "=== Pas 2: Restart toate pod-urile ===" -ForegroundColor Cyan
Write-Host "Afiseaza pod-uri curente:" -ForegroundColor Yellow
kubectl get pods -n $namespace

Write-Host ""
Write-Host "Sterg toate pod-urile din namespace '$namespace'..." -ForegroundColor Yellow
$pods = kubectl get pods -n $namespace -o jsonpath='{.items[*].metadata.name}' 2>$null
if ($pods) {
    foreach ($pod in $pods -split ' ') {
        if ($pod) {
            Write-Host "  Sterg pod: $pod" -ForegroundColor Gray
            kubectl delete pod $pod -n $namespace --ignore-not-found=true 2>&1 | Out-Null
        }
    }
} else {
    Write-Host "  Nu exista pod-uri de sters." -ForegroundColor Gray
}

# Asteapta ca Kubernetes sa inceapa sa creeze pod-uri noi
Write-Host ""
Write-Host "Asteapta 5 secunde pentru ca Kubernetes sa inceapa sa creeze pod-uri..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Pas 3: Asteapta ca pod-urile sa porneasca
Write-Host ""
Write-Host "=== Pas 3: Asteapta ca pod-urile sa porneasca ===" -ForegroundColor Cyan
Write-Host "MongoDB necesita ~90 secunde pentru a porni complet..." -ForegroundColor Yellow
Write-Host "Microserviciile necesita ~60-90 secunde pentru a porni..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Asteapta 30 secunde initial..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verifica statusul periodic
$maxWait = 180  # 3 minute
$elapsed = 30
$checkInterval = 15

while ($elapsed -lt $maxWait) {
    Write-Host ""
    Write-Host "Status dupa $elapsed secunde:" -ForegroundColor Cyan
    kubectl get pods -n $namespace
    
    $readyPods = kubectl get pods -n $namespace --field-selector=status.phase=Running --no-headers 2>$null | Where-Object { $_ -match '1/1|2/2|3/3' } | Measure-Object
    $totalPods = kubectl get pods -n $namespace --no-headers 2>$null | Where-Object { $_ -notmatch 'Completed' } | Measure-Object
    
    if ($readyPods.Count -gt 0 -and $totalPods.Count -gt 0) {
        $readyCount = $readyPods.Count
        $totalCount = $totalPods.Count
        Write-Host "Ready: $readyCount/$totalCount pod-uri" -ForegroundColor Yellow
        
        if ($readyCount -eq $totalCount) {
            Write-Host ""
            Write-Host "=== SUCCES! Toate pod-urile sunt Ready! ===" -ForegroundColor Green
            break
        }
    }
    
    Write-Host "Asteapta inca $checkInterval secunde..." -ForegroundColor Yellow
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
}

# Status final
Write-Host ""
Write-Host "=== Status final ===" -ForegroundColor Cyan
kubectl get pods -n $namespace

# Afiseaza pods care nu sunt Ready
Write-Host ""
Write-Host "Pod-uri care nu sunt Ready:" -ForegroundColor Yellow
$notReady = kubectl get pods -n $namespace --field-selector=status.phase!=Succeeded --no-headers 2>$null | Where-Object { $_ -notmatch '1/1|2/2|3/3' }
if ($notReady) {
    $notReady | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Red
        $podName = ($_ -split '\s+')[0]
        Write-Host "    Verifica logurile: kubectl logs -n $namespace $podName" -ForegroundColor Gray
    }
} else {
    Write-Host "  Toate pod-urile sunt Ready!" -ForegroundColor Green
}

# Verifica MongoDB specific
Write-Host ""
Write-Host "=== Verificare MongoDB ===" -ForegroundColor Cyan
$mongodbPod = kubectl get pods -n $namespace -l app=mongodb -o jsonpath='{.items[0].metadata.name}' 2>$null
if ($mongodbPod) {
    $mongodbStatus = kubectl get pod -n $namespace $mongodbPod -o jsonpath='{.status.phase}' 2>$null
    Write-Host "MongoDB pod: $mongodbPod" -ForegroundColor Yellow
    Write-Host "Status: $mongodbStatus" -ForegroundColor $(if ($mongodbStatus -eq "Running") { "Green" } else { "Red" })
    
    if ($mongodbStatus -ne "Running") {
        Write-Host "MongoDB logs:" -ForegroundColor Yellow
        kubectl logs -n $namespace $mongodbPod --tail=20
    }
} else {
    Write-Host "EROARE: MongoDB pod nu a fost gasit!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Gata! ===" -ForegroundColor Cyan
Write-Host "Pentru a monitoriza statusul in timp real:" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n $namespace -w" -ForegroundColor Gray


