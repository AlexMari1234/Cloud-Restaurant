# Script pentru a sterge toate pod-urile din namespace si a le recrea
# Kubernetes le va recrea automat bazat pe Deployment-uri

Write-Host "=== Restart toate pod-urile din cluster ===" -ForegroundColor Cyan

$namespace = "restaurant-app"

# Verifica daca namespace-ul exista
Write-Host ""
Write-Host "Verific namespace '$namespace'..." -ForegroundColor Yellow
$nsExists = kubectl get namespace $namespace 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Namespace '$namespace' nu exista!" -ForegroundColor Red
    exit 1
}

# Afiseaza pod-urile curente
Write-Host ""
Write-Host "Pod-uri curente in namespace '$namespace':" -ForegroundColor Yellow
kubectl get pods -n $namespace

# Sterge toate pod-urile din namespace
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

# Asteapta putin
Write-Host ""
Write-Host "Asteapta 3 secunde..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Kubernetes va recrea automat pod-urile
Write-Host ""
Write-Host "Kubernetes va recrea automat pod-urile..." -ForegroundColor Green
Write-Host "Asteapta 10 secunde pentru ca pod-urile sa porneasca..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Afiseaza statusul pod-urilor noi
Write-Host ""
Write-Host "Status pod-uri dupa restart:" -ForegroundColor Cyan
kubectl get pods -n $namespace

# Afiseaza pods care nu sunt Ready
Write-Host ""
Write-Host "Pod-uri care nu sunt Ready:" -ForegroundColor Yellow
$notReady = kubectl get pods -n $namespace --field-selector=status.phase!=Succeeded --no-headers 2>$null | Where-Object { $_ -notmatch '1/1|2/2|3/3' }
if ($notReady) {
    $notReady | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Verifica logurile pentru pod-urile care nu sunt Ready:" -ForegroundColor Yellow
    Write-Host "  kubectl logs -n $namespace <pod-name>" -ForegroundColor Gray
} else {
    Write-Host "  Toate pod-urile sunt Ready!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Gata! ===" -ForegroundColor Cyan
Write-Host "Pentru a monitoriza statusul in timp real:" -ForegroundColor Yellow
$monitorCmd = "kubectl get pods -n " + $namespace + " -w"
Write-Host "  $monitorCmd" -ForegroundColor Gray
