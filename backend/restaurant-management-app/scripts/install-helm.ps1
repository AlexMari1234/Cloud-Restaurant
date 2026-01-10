# Script pentru instalarea Helm pe Windows

$ErrorActionPreference = "Stop"

Write-Host "=== Instalare Helm pentru Windows ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă Helm este deja instalat
$helmCheck = Get-Command helm -ErrorAction SilentlyContinue
if ($helmCheck) {
    $helmVersion = helm version --short 2>&1
    Write-Host "Helm este deja instalat: $helmVersion" -ForegroundColor Green
    Write-Host ""
    Write-Host "Dacă vrei să reînstalezi, șterge Helm manual și rulează din nou acest script." -ForegroundColor Yellow
    exit 0
}

Write-Host "Helm nu este instalat. Încearcă instalare automată..." -ForegroundColor Yellow
Write-Host ""

# Verifică dacă rulează ca administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

# 1. Încearcă winget PRIMUL (poate funcționa fără admin în unele cazuri)
$wingetCheck = Get-Command winget -ErrorAction SilentlyContinue
if ($wingetCheck) {
    Write-Host "Găsit winget. Încearcă instalare prin winget..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        winget install Helm.Helm --accept-source-agreements --accept-package-agreements 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Helm instalat cu succes prin winget!" -ForegroundColor Green
            
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            # Verifică instalarea
            Write-Host "Verific instalarea..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
            
            # Reîncarcă PATH din nou
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            $helmVersion = helm version --short 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Verificare: $helmVersion" -ForegroundColor Green
                Write-Host ""
                Write-Host "=== Instalare completă! ===" -ForegroundColor Green
                exit 0
            } else {
                Write-Host "ATENȚIE: Helm a fost instalat, dar nu este încă în PATH." -ForegroundColor Yellow
                Write-Host "Reîncarcă PowerShell și verifică cu: helm version" -ForegroundColor Yellow
                exit 0
            }
        }
    } catch {
        Write-Host "Winget instalare a eșuat sau necesită admin. Continuă cu alte opțiuni..." -ForegroundColor Yellow
    }
}

# 2. Încearcă Chocolatey (necesită admin)
$chocoCheck = Get-Command choco -ErrorAction SilentlyContinue
if ($chocoCheck) {
    if ($isAdmin) {
        Write-Host "Găsit Chocolatey cu drepturi admin. Instalez Helm prin Chocolatey..." -ForegroundColor Cyan
        Write-Host ""
        
        choco install kubernetes-helm -y
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Helm instalat cu succes prin Chocolatey!" -ForegroundColor Green
            
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            
            # Verifică instalarea
            Start-Sleep -Seconds 2
            $helmVersion = helm version --short 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Verificare: $helmVersion" -ForegroundColor Green
                Write-Host ""
                Write-Host "=== Instalare completă! ===" -ForegroundColor Green
                Write-Host ""
                Write-Host "Dacă comanda 'helm' nu funcționează, reîncarcă PowerShell sau rulează:" -ForegroundColor Yellow
                Write-Host "  refreshenv" -ForegroundColor Cyan
                exit 0
            }
        }
    } else {
        Write-Host "Chocolatey găsit, dar necesită drepturi de administrator." -ForegroundColor Yellow
    }
}

# 3. Dacă nu a funcționat nimic automat, oferă instrucțiuni
Write-Host ""
Write-Host "=== Instalare automată nu a funcționat ===" -ForegroundColor Yellow
Write-Host ""
Write-Host "Instalează Helm manual folosind una din opțiunile:" -ForegroundColor Cyan
Write-Host ""

if ($wingetCheck -and -not $isAdmin) {
    Write-Host "1. Winget (poate funcționa fără admin, dar poate necesita confirmare):" -ForegroundColor Yellow
    Write-Host "   winget install Helm.Helm" -ForegroundColor Gray
    Write-Host ""
}

if ($chocoCheck) {
    Write-Host "2. Chocolatey (necesită PowerShell ca Administrator):" -ForegroundColor Yellow
    Write-Host "   # Deschide PowerShell ca Administrator, apoi:" -ForegroundColor Gray
    Write-Host "   choco install kubernetes-helm" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "3. Scoop (dacă este instalat):" -ForegroundColor Yellow
Write-Host "   scoop install helm" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Instalare manuală (descarcă binarul):" -ForegroundColor Yellow
Write-Host "   https://helm.sh/docs/intro/install/" -ForegroundColor Cyan
Write-Host ""

Write-Host "5. Quick install script (recomandat pentru Windows):" -ForegroundColor Yellow
Write-Host "   # Deschide PowerShell ca Administrator, apoi:" -ForegroundColor Gray
Write-Host "   [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12" -ForegroundColor Gray
Write-Host "   Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3' -OutFile get-helm-3.ps1" -ForegroundColor Gray
Write-Host "   .\get-helm-3.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "După instalare, verifică cu: helm version --short" -ForegroundColor Cyan
Write-Host ""

exit 1

