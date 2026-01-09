# Script pentru instalare Kind pe Windows

$ErrorActionPreference = "Stop"

Write-Host "=== Instalare Kind pe Windows ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă Kind este deja instalat
if (Get-Command kind -ErrorAction SilentlyContinue) {
    Write-Host "Kind este deja instalat!" -ForegroundColor Green
    $version = kind --version
    Write-Host "Versiune instalată: $version" -ForegroundColor Cyan
    Write-Host ""
    $response = Read-Host "Vrei să-l reinstalezi? (y/n)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "Instalare anulată." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "Verificând dacă Chocolatey este disponibil..." -ForegroundColor Yellow
if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "Chocolatey găsit! Folosim Chocolatey pentru instalare." -ForegroundColor Green
    Write-Host ""
    Write-Host "Instalăm Kind cu Chocolatey..." -ForegroundColor Yellow
    choco install kind -y
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Kind instalat cu succes cu Chocolatey!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Verificăm instalarea..." -ForegroundColor Yellow
        kind --version
        exit 0
    }
}

Write-Host ""
Write-Host "Chocolatey nu este disponibil. Folosim instalare manuală..." -ForegroundColor Yellow
Write-Host ""

# Verifică dacă Scoop este disponibil
Write-Host "Verificând dacă Scoop este disponibil..." -ForegroundColor Yellow
if (Get-Command scoop -ErrorAction SilentlyContinue) {
    Write-Host "Scoop găsit! Folosim Scoop pentru instalare." -ForegroundColor Green
    Write-Host ""
    Write-Host "Instalăm Kind cu Scoop..." -ForegroundColor Yellow
    scoop install kind
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Kind instalat cu succes cu Scoop!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Verificăm instalarea..." -ForegroundColor Yellow
        kind --version
        exit 0
    }
}

# Instalare manuală
Write-Host ""
Write-Host "Instalare manuală..." -ForegroundColor Yellow
Write-Host ""

# Obține ultima versiune de Kind
Write-Host "Descărcând ultima versiune de Kind..." -ForegroundColor Yellow
$KIND_VERSION = "v0.20.0"  # Update this as needed
$KIND_URL = "https://kind.sigs.k8s.io/dl/$KIND_VERSION/kind-windows-amd64"

# Verifică dacă există folderul pentru binarul Kind
$kindPath = "$env:USERPROFILE\.local\bin"
if (-not (Test-Path $kindPath)) {
    New-Item -ItemType Directory -Path $kindPath -Force | Out-Null
}

# Descarcă Kind
$kindExe = Join-Path $kindPath "kind.exe"
Write-Host "Descărcând Kind în: $kindExe" -ForegroundColor Cyan

try {
    Invoke-WebRequest -Uri $KIND_URL -OutFile $kindExe -UseBasicParsing
    Write-Host "Kind descărcat cu succes!" -ForegroundColor Green
} catch {
    Write-Host "EROARE: Nu s-a putut descărca Kind!" -ForegroundColor Red
    Write-Host "Eroare: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instalează manual:" -ForegroundColor Yellow
    Write-Host "1. Descarcă de la: https://kind.sigs.k8s.io/docs/user/quick-start/#installation" -ForegroundColor White
    Write-Host "2. Extrage kind-windows-amd64.exe" -ForegroundColor White
    Write-Host "3. Rename la kind.exe" -ForegroundColor White
    Write-Host "4. Copiază în un folder din PATH (ex: C:\Windows\System32)" -ForegroundColor White
    exit 1
}

# Adaugă la PATH dacă nu există
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$kindPath*") {
    Write-Host ""
    Write-Host "Adăugând $kindPath la PATH..." -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$kindPath", "User")
    $env:Path += ";$kindPath"
    Write-Host "PATH actualizat! Reîncarcă terminalul pentru a folosi Kind." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Folder-ul este deja în PATH." -ForegroundColor Green
}

# Verifică instalarea
Write-Host ""
Write-Host "Verificăm instalarea..." -ForegroundColor Yellow
if (Test-Path $kindExe) {
    & $kindExe --version
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=== Kind instalat cu succes! ===" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Reîncarcă terminalul pentru a folosi comanda 'kind'!" -ForegroundColor Yellow
        Write-Host "Sau rulează manual: & '$kindExe'" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Acum poți crea cluster cu: .\scripts\setup-kind-cluster.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "EROARE: Kind nu funcționează corect!" -ForegroundColor Red
    }
} else {
    Write-Host "EROARE: Kind nu a fost instalat!" -ForegroundColor Red
}


