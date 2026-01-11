# Instalare manuală Helm fără admin (descarcă binarul direct)

$ErrorActionPreference = "Stop"

Write-Host "=== Instalare Manuală Helm (fără admin) ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă Helm este deja instalat
$helmCheck = Get-Command helm -ErrorAction SilentlyContinue
if ($helmCheck) {
    $helmVersion = helm version --short 2>&1
    Write-Host "Helm este deja instalat: $helmVersion" -ForegroundColor Green
    exit 0
}

Write-Host "Descărcare și instalare Helm manuală..." -ForegroundColor Yellow
Write-Host ""

# Versiunea Helm (actualizată la ultima versiune stabilă)
$HELM_VERSION = "3.15.1"
$HELM_ARCH = "windows-amd64"

# Director pentru instalare (în directorul user, nu necesită admin)
$INSTALL_DIR = Join-Path $env:USERPROFILE ".local\bin"
$HELM_DIR = Join-Path $env:TEMP "helm-install"

# Creează directorul de instalare dacă nu există
if (-not (Test-Path $INSTALL_DIR)) {
    Write-Host "Creez directorul de instalare: $INSTALL_DIR" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
}

# Creează director temporar
if (Test-Path $HELM_DIR) {
    Remove-Item -Path $HELM_DIR -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $HELM_DIR -Force | Out-Null

try {
    # URL pentru descărcare
    $HELM_URL = "https://get.helm.sh/helm-v${HELM_VERSION}-${HELM_ARCH}.zip"
    $ZIP_FILE = Join-Path $HELM_DIR "helm.zip"
    
    Write-Host "Descărcare Helm v${HELM_VERSION}..." -ForegroundColor Cyan
    Write-Host "URL: $HELM_URL" -ForegroundColor Gray
    
    # Descarcă Helm
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $HELM_URL -OutFile $ZIP_FILE -UseBasicParsing
    
    Write-Host "Extragere arhivă..." -ForegroundColor Cyan
    Expand-Archive -Path $ZIP_FILE -DestinationPath $HELM_DIR -Force
    
    # Găsește binarul helm.exe
    $HELM_EXE = Get-ChildItem -Path $HELM_DIR -Filter "helm.exe" -Recurse | Select-Object -First 1
    
    if ($HELM_EXE) {
        Write-Host "Copiere helm.exe în $INSTALL_DIR..." -ForegroundColor Cyan
        Copy-Item -Path $HELM_EXE.FullName -Destination (Join-Path $INSTALL_DIR "helm.exe") -Force
        
        Write-Host ""
        Write-Host "Helm instalat cu succes în: $INSTALL_DIR\helm.exe" -ForegroundColor Green
        
        # Adaugă la PATH user (nu necesită admin)
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($currentPath -notlike "*$INSTALL_DIR*") {
            Write-Host ""
            Write-Host "Adaug $INSTALL_DIR la PATH (user level)..." -ForegroundColor Yellow
            [Environment]::SetEnvironmentVariable("Path", "$currentPath;$INSTALL_DIR", "User")
            $env:Path += ";$INSTALL_DIR"
            Write-Host "PATH actualizat!" -ForegroundColor Green
        }
        
        # Verifică instalarea
        Write-Host ""
        Write-Host "Verificare instalare..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        
        # Reîncarcă PATH
        $env:Path = [Environment]::GetEnvironmentVariable("Path", "User") + ";" + [Environment]::GetEnvironmentVariable("Path", "Machine")
        
        $helmVersion = & (Join-Path $INSTALL_DIR "helm.exe") version --short 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Verificare: $helmVersion" -ForegroundColor Green
            Write-Host ""
            Write-Host "=== Instalare completă! ===" -ForegroundColor Green
            Write-Host ""
            Write-Host "Helm este instalat în: $INSTALL_DIR\helm.exe" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "IMPORTANT: Reîncarcă PowerShell pentru ca PATH să fie actualizat complet." -ForegroundColor Yellow
            Write-Host "După reîncărcare, verifică cu: helm version --short" -ForegroundColor Cyan
            Write-Host ""
            
            # Test direct
            Write-Host "Test direct (fără reîncărcare):" -ForegroundColor Yellow
            & (Join-Path $INSTALL_DIR "helm.exe") version --short
        } else {
            Write-Host "ATENȚIE: Helm a fost instalat, dar verificarea a eșuat." -ForegroundColor Yellow
            Write-Host "Reîncarcă PowerShell și verifică cu: helm version" -ForegroundColor Cyan
        }
        
    } else {
        Write-Host "EROARE: Nu s-a găsit helm.exe în arhivă!" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "EROARE la instalare: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Încearcă instalare manuală:" -ForegroundColor Yellow
    Write-Host "1. Descarcă de la: https://github.com/helm/helm/releases" -ForegroundColor Cyan
    Write-Host "2. Extrage helm.exe într-un director din PATH" -ForegroundColor Cyan
    Write-Host "3. Sau folosește winget: winget install Helm.Helm" -ForegroundColor Cyan
    exit 1
} finally {
    # Curăță directorul temporar
    if (Test-Path $HELM_DIR) {
        Remove-Item -Path $HELM_DIR -Recurse -Force -ErrorAction SilentlyContinue
    }
}

