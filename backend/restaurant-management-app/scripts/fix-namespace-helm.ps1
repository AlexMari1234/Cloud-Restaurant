# Script pentru adăugare metadata Helm la namespace existent

$ErrorActionPreference = "Stop"

$NAMESPACE = "restaurant-app"

Write-Host "=== Adăugare Metadata Helm la Namespace ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă namespace-ul există
$ErrorActionPreference = "SilentlyContinue"
$namespaceExists = kubectl get namespace $NAMESPACE -o name 2>&1
$ErrorActionPreference = "Stop"

if ($LASTEXITCODE -ne 0 -or $namespaceExists -match "NotFound" -or $namespaceExists -match "not found") {
    Write-Host "EROARE: Namespace '$NAMESPACE' nu există!" -ForegroundColor Red
    Write-Host "Creează namespace-ul mai întâi sau rulează install-helm-chart.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "Namespace '$NAMESPACE' există. Adaug metadata Helm..." -ForegroundColor Yellow
Write-Host ""

# Adaugă label Helm
Write-Host "Adaug label: app.kubernetes.io/managed-by=Helm" -ForegroundColor Cyan
kubectl label namespace $NAMESPACE app.kubernetes.io/managed-by=Helm --overwrite
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Nu s-a putut adăuga label!" -ForegroundColor Red
    exit 1
}

# Adaugă annotations Helm
Write-Host "Adaug annotation: meta.helm.sh/release-name=restaurant-app" -ForegroundColor Cyan
kubectl annotate namespace $NAMESPACE meta.helm.sh/release-name=restaurant-app --overwrite
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Nu s-a putut adăuga annotation release-name!" -ForegroundColor Red
    exit 1
}

Write-Host "Adaug annotation: meta.helm.sh/release-namespace=$NAMESPACE" -ForegroundColor Cyan
kubectl annotate namespace $NAMESPACE meta.helm.sh/release-namespace=$NAMESPACE --overwrite
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Nu s-a putut adăuga annotation release-namespace!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Metadata Helm adăugat cu succes!" -ForegroundColor Green
Write-Host ""
Write-Host "Verificare:" -ForegroundColor Cyan
kubectl get namespace $NAMESPACE -o yaml | Select-String -Pattern "managed-by|meta.helm"
Write-Host ""
Write-Host "Acum poți rula: .\scripts\install-helm-chart.ps1" -ForegroundColor Green
