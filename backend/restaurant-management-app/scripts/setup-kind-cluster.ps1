# Script pentru creare Kind cluster

$ErrorActionPreference = "Stop"

Write-Host "=== Setup Kind Cluster ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă Kind este instalat
if (-not (Get-Command kind -ErrorAction SilentlyContinue)) {
    Write-Host "EROARE: Kind nu este instalat!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Opțiuni de instalare:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Script automat (recomandat):" -ForegroundColor Cyan
    Write-Host "   .\scripts\install-kind.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "2. Chocolatey (dacă ai instalat):" -ForegroundColor Cyan
    Write-Host "   choco install kind" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Scoop (dacă ai instalat):" -ForegroundColor Cyan
    Write-Host "   scoop install kind" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Manual:" -ForegroundColor Cyan
    Write-Host "   https://kind.sigs.k8s.io/docs/user/quick-start/#installation" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "Vrei să rulez scriptul de instalare automată? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        $installScript = Join-Path $PSScriptRoot "install-kind.ps1"
        if (Test-Path $installScript) {
            & $installScript
            # După instalare, reîncarcă PATH-ul
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            # Verifică din nou
            if (-not (Get-Command kind -ErrorAction SilentlyContinue)) {
                Write-Host ""
                Write-Host "IMPORTANT: Reîncarcă terminalul și rulează din nou acest script!" -ForegroundColor Yellow
                exit 1
            }
        } else {
            Write-Host "Scriptul de instalare nu a fost găsit!" -ForegroundColor Red
            exit 1
        }
    } else {
        exit 1
    }
}

Write-Host "Kind: OK" -ForegroundColor Green

# Verifică dacă există deja cluster-ul
try {
    $existingClusters = kind get clusters 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0 -and $existingClusters -match "restaurant-cluster") {
        Write-Host ""
        Write-Host "Cluster 'restaurant-cluster' există deja!" -ForegroundColor Yellow
        Write-Host ""
        $response = Read-Host "Vrei să-l ștergi și să creezi unul nou? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            Write-Host "Șterg cluster-ul existent..." -ForegroundColor Yellow
            kind delete cluster --name restaurant-cluster
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Cluster șters!" -ForegroundColor Green
            } else {
                Write-Host "EROARE: Nu s-a putut șterge cluster-ul!" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "Cluster-ul existent va fi folosit." -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Verificând cluster-ul..." -ForegroundColor Yellow
            kubectl cluster-info --context kind-restaurant-cluster
            exit 0
        }
    } elseif ($existingClusters -match "No kind clusters found" -or $existingClusters -match "No clusters found") {
        Write-Host "Nu există cluster-uri Kind. Vom crea unul nou." -ForegroundColor Cyan
    }
} catch {
    # Ignorăm eroarea dacă nu există cluster-uri
    Write-Host "Nu există cluster-uri Kind. Vom crea unul nou." -ForegroundColor Cyan
}

# Creează cluster-ul
Write-Host ""
Write-Host "Creând cluster Kind 'restaurant-cluster'..." -ForegroundColor Yellow
Write-Host "(Aceasta poate dura câteva minute...)" -ForegroundColor Cyan
Write-Host ""

kind create cluster --name restaurant-cluster

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Cluster creat cu succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verificând cluster-ul..." -ForegroundColor Yellow
    kubectl cluster-info --context kind-restaurant-cluster
    
    Write-Host ""
    Write-Host "Noduri:" -ForegroundColor Cyan
    kubectl get nodes --context kind-restaurant-cluster
    
    Write-Host ""
    Write-Host "=== Cluster gata! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Acum poți rula deploy cu: .\scripts\full-deploy.ps1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "EROARE: Nu s-a putut crea cluster-ul!" -ForegroundColor Red
    exit 1
}

