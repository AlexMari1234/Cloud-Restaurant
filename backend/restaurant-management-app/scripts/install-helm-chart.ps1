# Script pentru instalarea aplicației cu Helm (include Prometheus și Grafana)

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$HELM_DIR = Join-Path $PROJECT_ROOT "helm\restaurant-app"
$NAMESPACE = "restaurant-app"

Write-Host "=== Instalare/Upgrade Helm Chart (cu Prometheus & Grafana) ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă Helm este instalat
Write-Host "Verificare Helm..." -ForegroundColor Yellow
$helmCheck = Get-Command helm -ErrorAction SilentlyContinue
if (-not $helmCheck) {
    Write-Host "Helm nu este instalat!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opțiuni de instalare Helm:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Instalare manuală FĂRĂ admin (recomandat - descarcă binarul direct):" -ForegroundColor Yellow
    Write-Host "   .\scripts\install-helm-manual.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Instalare automată (încearcă winget/Chocolatey):" -ForegroundColor Yellow
    Write-Host "   .\scripts\install-helm.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Sau instalează manual:" -ForegroundColor Yellow
    Write-Host "   - winget: winget install Helm.Helm" -ForegroundColor Gray
    Write-Host "   - Chocolatey (necesită admin): choco install kubernetes-helm" -ForegroundColor Gray
    Write-Host "   - Manual: https://helm.sh/docs/intro/install/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Recomandare: Folosește opțiunea 1 (install-helm-manual.ps1) - nu necesită admin!" -ForegroundColor Green
    Write-Host ""
    $installChoice = Read-Host "Ce metodă vrei să folosesc? (1=manual fără admin, 2=automată, 3=skip) [1]"
    
    if ([string]::IsNullOrWhiteSpace($installChoice)) {
        $installChoice = "1"
    }
    
    if ($installChoice -eq "1") {
        # Instalare manuală fără admin
        $installScript = Join-Path $SCRIPT_DIR "install-helm-manual.ps1"
        if (Test-Path $installScript) {
            Write-Host ""
            Write-Host "Rulez instalare manuală Helm (fără admin)..." -ForegroundColor Cyan
            & $installScript
            if ($LASTEXITCODE -ne 0) {
                Write-Host "EROARE: Instalarea Helm manuală a eșuat!" -ForegroundColor Red
                Write-Host "Instalează manual Helm și încearcă din nou." -ForegroundColor Yellow
                exit 1
            }
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","User") + ";" + [System.Environment]::GetEnvironmentVariable("Path","Machine")
            Start-Sleep -Seconds 2
            
            # Verifică din nou
            $helmCheck = Get-Command helm -ErrorAction SilentlyContinue
            if (-not $helmCheck) {
                Write-Host ""
                Write-Host "ATENȚIE: Helm a fost instalat, dar nu este încă în PATH." -ForegroundColor Yellow
                Write-Host "Reîncarcă PowerShell și rulează din nou acest script." -ForegroundColor Yellow
                Write-Host "SAU folosește calea completă: $env:USERPROFILE\.local\bin\helm.exe" -ForegroundColor Cyan
                exit 1
            }
        } else {
            Write-Host "EROARE: Scriptul install-helm-manual.ps1 nu există!" -ForegroundColor Red
            exit 1
        }
    } elseif ($installChoice -eq "2") {
        # Instalare automată
        $installScript = Join-Path $SCRIPT_DIR "install-helm.ps1"
        if (Test-Path $installScript) {
            Write-Host ""
            Write-Host "Rulez scriptul de instalare automată Helm..." -ForegroundColor Cyan
            & $installScript
            if ($LASTEXITCODE -ne 0) {
                Write-Host "EROARE: Instalarea Helm automată a eșuat!" -ForegroundColor Red
                Write-Host "Încearcă instalarea manuală: .\scripts\install-helm-manual.ps1" -ForegroundColor Yellow
                exit 1
            }
            # Refresh PATH
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            Start-Sleep -Seconds 2
        } else {
            Write-Host "EROARE: Scriptul install-helm.ps1 nu există!" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Skip instalare Helm. Instalează manual și rulează din nou acest script." -ForegroundColor Yellow
        exit 1
    }
}

# Verifică versiunea Helm
$helmVersion = helm version --short 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Helm nu funcționează corect!" -ForegroundColor Red
    Write-Host "Reîncarcă PowerShell și verifică instalarea." -ForegroundColor Yellow
    exit 1
}
Write-Host "Helm: $helmVersion" -ForegroundColor Green
Write-Host ""

# Verifică dacă directorul Helm există
if (-not (Test-Path $HELM_DIR)) {
    Write-Host "EROARE: Directorul Helm nu există: $HELM_DIR" -ForegroundColor Red
    exit 1
}

# Detectează cluster-ul Kind
$kindClusters = kind get clusters 2>&1 | Out-String
$kindClusterName = "kind"
if ($kindClusters -match "restaurant-cluster") {
    $kindClusterName = "restaurant-cluster"
    Write-Host "Cluster Kind detectat: $kindClusterName" -ForegroundColor Cyan
}

# 1. Verifică dacă Metrics Server este instalat
Write-Host "=== [1/5] Verificare Metrics Server ===" -ForegroundColor Green
$ErrorActionPreference = "SilentlyContinue"
$metricsServerCheck = kubectl get deployment -n kube-system metrics-server -o name 2>&1
$ErrorActionPreference = "Stop"
if ($LASTEXITCODE -ne 0 -or $metricsServerCheck -match "NotFound" -or $metricsServerCheck -match "not found" -or $metricsServerCheck -match "Error") {
    Write-Host "Metrics Server nu este instalat!" -ForegroundColor Yellow
    Write-Host "Instalez Metrics Server..." -ForegroundColor Yellow
    
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Patch pentru Kind (--kubelet-insecure-tls)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
        Write-Host "Metrics Server instalat!" -ForegroundColor Green
        Write-Host "Aștept 10 secunde pentru ca Metrics Server să pornească..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Write-Host "EROARE: Nu s-a putut instala Metrics Server!" -ForegroundColor Red
        Write-Host "Poți continua, dar Prometheus ar putea avea probleme cu unele metrici." -ForegroundColor Yellow
        Read-Host "Apasă Enter pentru a continua sau Ctrl+C pentru a anula"
    }
} else {
    Write-Host "Metrics Server este deja instalat!" -ForegroundColor Green
}
Write-Host ""

# 2. Build și load imagini Docker (dacă e necesar)
Write-Host "=== [2/5] Build și Load Imagini Docker ===" -ForegroundColor Green
$buildImages = Read-Host "Vrei să builduiești și să încarci imaginile Docker? (y/n)"
if ($buildImages -eq "y" -or $buildImages -eq "Y") {
    cd $PROJECT_ROOT
    
    Write-Host "Building Docker images..." -ForegroundColor Yellow
    docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .
    docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .
    docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .
    docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .
    
    Write-Host "Loading images into Kind..." -ForegroundColor Yellow
    kind load docker-image restaurant-auth-service:latest --name $kindClusterName
    kind load docker-image restaurant-restaurant-service:latest --name $kindClusterName
    kind load docker-image restaurant-reservations-service:latest --name $kindClusterName
    kind load docker-image restaurant-menu-order-service:latest --name $kindClusterName
    
    Write-Host "Images loaded!" -ForegroundColor Green
} else {
    Write-Host "Skipping build și load imagini..." -ForegroundColor Yellow
}
Write-Host ""

# 3. Verifică dacă release-ul Helm există
Write-Host "=== [3/5] Verificare Release Helm ===" -ForegroundColor Green
cd $HELM_DIR
$releaseExists = helm list -n $NAMESPACE -q | Select-String -Pattern "restaurant-app"
if ($releaseExists) {
    Write-Host "Release 'restaurant-app' există deja. Fac upgrade..." -ForegroundColor Yellow
    $operation = "upgrade"
} else {
    Write-Host "Release 'restaurant-app' nu există. Fac install..." -ForegroundColor Yellow
    $operation = "install"
}
Write-Host ""

# 4. Instalează/Upgrade cu Helm
Write-Host "=== [4/5] Helm $operation ===" -ForegroundColor Green
if ($operation -eq "install") {
    Write-Host "Instalare Helm chart..." -ForegroundColor Yellow
    helm install restaurant-app . -n $NAMESPACE --create-namespace
} else {
    Write-Host "Upgrade Helm chart..." -ForegroundColor Yellow
    helm upgrade restaurant-app . -n $NAMESPACE
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Helm $operation a eșuat!" -ForegroundColor Red
    exit 1
}

Write-Host "Helm $operation complet!" -ForegroundColor Green
Write-Host ""

# 5. Așteaptă ca pod-urile să pornească
Write-Host "=== [5/5] Așteptare pod-uri să pornească ===" -ForegroundColor Green
Write-Host "MongoDB necesită ~90 secunde..." -ForegroundColor Yellow
Write-Host "Kafka necesită ~60 secunde..." -ForegroundColor Yellow
Write-Host "Prometheus și Grafana necesită ~30 secunde..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Aștept inițial 30 secunde..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verifică statusul periodic
$maxWait = 240
$elapsed = 30
$checkInterval = 20

while ($elapsed -lt $maxWait) {
    Write-Host ""
    Write-Host "Status după $elapsed secunde:" -ForegroundColor Cyan
    kubectl get pods -n $NAMESPACE
    
    $readyPods = kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers 2>&1 | Where-Object { $_ -match '1/1|2/2|3/3' }
    $totalPods = kubectl get pods -n $NAMESPACE --no-headers 2>&1 | Where-Object { $_ -notmatch 'Completed' }
    
    if ($readyPods -and $totalPods) {
        $readyCount = ($readyPods | Measure-Object).Count
        $totalCount = ($totalPods | Measure-Object).Count
        Write-Host "Ready: $readyCount/$totalCount pod-uri" -ForegroundColor Yellow
        
        if ($readyCount -eq $totalCount -and $readyCount -gt 0) {
            Write-Host ""
            Write-Host "Toate pod-urile sunt Ready!" -ForegroundColor Green
            break
        }
    }
    
    Write-Host "Aștept încă $checkInterval secunde..." -ForegroundColor Yellow
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
}

# Status final
Write-Host ""
Write-Host "=== Status Final ===" -ForegroundColor Green
kubectl get pods -n $NAMESPACE
Write-Host ""
kubectl get svc -n $NAMESPACE
Write-Host ""

# Informații despre accesare
Write-Host "=== Informații Accesare ===" -ForegroundColor Green
Write-Host ""

# Obține Node IP
$nodeIP = kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].value}' 2>&1
if ($LASTEXITCODE -eq 0 -and $nodeIP) {
    Write-Host "Servicii disponibile prin NodePort (IP: $nodeIP):" -ForegroundColor Cyan
    Write-Host "  Prometheus:  http://$nodeIP`:30091" -ForegroundColor White
    Write-Host "  Grafana:     http://$nodeIP`:30300 (admin/admin123)" -ForegroundColor White
    Write-Host "  Auth Service: http://$nodeIP`:30000" -ForegroundColor White
    Write-Host "  Restaurant:  http://$nodeIP`:30001" -ForegroundColor White
    Write-Host "  Reservations: http://$nodeIP`:30002" -ForegroundColor White
    Write-Host "  Menu Order:  http://$nodeIP`:30003" -ForegroundColor White
    Write-Host "  Mongo Express: http://$nodeIP`:30081" -ForegroundColor White
    Write-Host "  Portainer:   http://$nodeIP`:30090" -ForegroundColor White
} else {
    Write-Host "Nu s-a putut obține Node IP." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Pentru port-forward (recomandat pentru local):" -ForegroundColor Cyan
Write-Host "  .\scripts\port-forward-services.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Documentație completă: .\MONITORING.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "=== Install Complet! ===" -ForegroundColor Green

