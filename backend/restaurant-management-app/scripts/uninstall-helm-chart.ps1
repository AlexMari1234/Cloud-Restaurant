# Script pentru dezinstalarea Helm chart-ului Restaurant Management App
# Autor: System
# Data: 2026-01-11

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "UNINSTALL HELM CHART - Restaurant App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$NAMESPACE = "restaurant-app"
$RELEASE_NAME = "restaurant-app"

# Verifică dacă Helm este instalat
Write-Host "Verific Helm..." -ForegroundColor Yellow
try {
    $helmVersion = helm version --short 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "EROARE: Helm nu este instalat!" -ForegroundColor Red
        Write-Host "Instalează Helm cu: .\scripts\install-helm.ps1" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "Helm este instalat: $helmVersion" -ForegroundColor Green
} catch {
    Write-Host "EROARE: Helm nu este instalat!" -ForegroundColor Red
    Write-Host "Instalează Helm cu: .\scripts\install-helm.ps1" -ForegroundColor Yellow
    exit 1
}

# Verifică dacă release-ul există
Write-Host ""
Write-Host "Verific dacă release-ul '$RELEASE_NAME' există..." -ForegroundColor Yellow
$releaseCheck = helm list -n $NAMESPACE -q | Select-String -Pattern "^$RELEASE_NAME$"

if (-not $releaseCheck) {
    Write-Host "Release-ul '$RELEASE_NAME' nu există în namespace-ul '$NAMESPACE'." -ForegroundColor Yellow
    Write-Host "Nu există nimic de dezinstalat." -ForegroundColor Green
    exit 0
}

Write-Host "Release-ul '$RELEASE_NAME' a fost găsit." -ForegroundColor Green

# Afișează informații despre release
Write-Host ""
Write-Host "Informații release:" -ForegroundColor Yellow
helm status $RELEASE_NAME -n $NAMESPACE

# Confirmare
Write-Host ""
Write-Host "ATENȚIE: Acest script va șterge release-ul Helm '$RELEASE_NAME' din namespace-ul '$NAMESPACE'." -ForegroundColor Red
Write-Host "Toate pod-urile, serviciile și alte resurse vor fi șterse." -ForegroundColor Yellow
Write-Host ""
Write-Host "NOTĂ: PVC-urile (Persistent Volume Claims) NU vor fi șterse automat pentru siguranța datelor." -ForegroundColor Cyan
Write-Host "Dacă vrei să ștergi și PVC-urile, fă-o manual: kubectl delete pvc --all -n $NAMESPACE" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Sigur vrei să continui? (da/nu)"
if ($confirm -ne "da" -and $confirm -ne "Da" -and $confirm -ne "DA" -and $confirm -ne "y" -and $confirm -ne "Y" -and $confirm -ne "yes" -and $confirm -ne "Yes") {
    Write-Host "Operațiune anulată." -ForegroundColor Yellow
    exit 0
}

# Uninstall Helm release
Write-Host ""
Write-Host "Dezinstalez release-ul Helm..." -ForegroundColor Yellow
helm uninstall $RELEASE_NAME -n $NAMESPACE

if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Dezinstalarea a eșuat!" -ForegroundColor Red
    exit 1
}

Write-Host "Release-ul a fost dezinstalat cu succes!" -ForegroundColor Green

# Verifică statusul
Write-Host ""
Write-Host "Verific statusul..." -ForegroundColor Yellow
$releaseCheckAfter = helm list -n $NAMESPACE -q | Select-String -Pattern "^$RELEASE_NAME$"

if (-not $releaseCheckAfter) {
    Write-Host "✓ Release-ul a fost șters." -ForegroundColor Green
} else {
    Write-Host "⚠ ATENȚIE: Release-ul încă apare în listă (ar putea fi un delay)." -ForegroundColor Yellow
}

# Verifică pod-urile
Write-Host ""
Write-Host "Verific pod-uri rămase..." -ForegroundColor Yellow
$pods = kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}' 2>$null
if ($pods) {
    Write-Host "Pod-uri rămase: $pods" -ForegroundColor Yellow
    Write-Host "Acestea ar trebui să fie șterse automat, dar dacă rămân, le poți șterge manual." -ForegroundColor Cyan
} else {
    Write-Host "✓ Nu mai există pod-uri." -ForegroundColor Green
}

# Verifică PVC-urile
Write-Host ""
Write-Host "Verific PVC-uri (acestea NU sunt șterse automat)..." -ForegroundColor Yellow
$pvcs = kubectl get pvc -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}' 2>$null
if ($pvcs) {
    Write-Host "PVC-uri rămase: $pvcs" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ATENȚIE: PVC-urile NU sunt șterse automat de Helm (pentru siguranța datelor)." -ForegroundColor Cyan
    Write-Host "Dacă vrei să le ștergi, rulează:" -ForegroundColor Cyan
    Write-Host "  kubectl delete pvc --all -n $NAMESPACE" -ForegroundColor White
} else {
    Write-Host "✓ Nu există PVC-uri." -ForegroundColor Green
}

# Verifică namespace-ul
Write-Host ""
Write-Host "Verific namespace-ul..." -ForegroundColor Yellow
$nsExists = kubectl get namespace $NAMESPACE -o name 2>$null
if ($nsExists) {
    Write-Host "Namespace-ul '$NAMESPACE' încă există." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opțiuni:" -ForegroundColor Cyan
    Write-Host "  1. Păstrează namespace-ul (recomandat dacă ai PVC-uri)" -ForegroundColor White
    Write-Host "  2. Șterge namespace-ul (va șterge TOT, inclusiv PVC-urile):" -ForegroundColor White
    Write-Host "     kubectl delete namespace $NAMESPACE" -ForegroundColor Gray
} else {
    Write-Host "✓ Namespace-ul nu mai există (a fost șters automat sau manual)." -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEZINSTALARE COMPLETĂ!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Rezumat:" -ForegroundColor Yellow
Write-Host "  ✓ Helm release dezinstalat" -ForegroundColor Green
Write-Host "  ✓ Pod-uri și servicii șterse" -ForegroundColor Green
Write-Host "  ⚠ PVC-uri păstrate (dacă există)" -ForegroundColor Yellow
Write-Host "  ⚠ Namespace păstrat (dacă există)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pentru ștergere completă (opțional):" -ForegroundColor Cyan
Write-Host "  kubectl delete pvc --all -n $NAMESPACE" -ForegroundColor White
Write-Host "  kubectl delete namespace $NAMESPACE" -ForegroundColor White
Write-Host ""
