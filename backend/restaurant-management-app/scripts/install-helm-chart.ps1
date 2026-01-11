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
    Write-Host "Helm nu este instalat! Te rog instalează-l manual sau rulează scripts/install-helm-manual.ps1" -ForegroundColor Red
    exit 1
}

# Verifică versiunea Helm
$helmVersion = helm version --short 2>&1
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
    Write-Host "Metrics Server nu este instalat! Instalez..." -ForegroundColor Yellow
    kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Patch pentru Kind (--kubelet-insecure-tls)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
        Write-Host "Metrics Server instalat!" -ForegroundColor Green
        Start-Sleep -Seconds 10
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

# 3. Verifică namespace și release-ul Helm
Write-Host "=== [3/5] Verificare Namespace și Release Helm ===" -ForegroundColor Green
cd $HELM_DIR

# Verifică dacă namespace-ul există
$ErrorActionPreference = "SilentlyContinue"
$nsCheck = kubectl get namespace $NAMESPACE -o name 2>&1
$nsCheckCode = $LASTEXITCODE
$ErrorActionPreference = "Stop"

if ($nsCheckCode -eq 0 -and ($nsCheck -match $NAMESPACE)) {
    Write-Host "Namespace '$NAMESPACE' EXISTĂ deja!" -ForegroundColor Yellow
    
    # Verificăm dacă e gestionat de Helm
    $ErrorActionPreference = "SilentlyContinue"
    $helmLabel = kubectl get namespace $NAMESPACE -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}' 2>&1
    $ErrorActionPreference = "Stop"
    
    if ($helmLabel -ne "Helm") {
        Write-Host "ATENȚIE: Namespace-ul există dar NU este gestionat de Helm." -ForegroundColor Red
        
        $choice = Read-Host "Șterg namespace-ul vechi pentru a evita conflicte? (y/n) [y]"
        if ($choice -eq "" -or $choice -eq "y") {
            Write-Host "Șterg namespace-ul $NAMESPACE..." -ForegroundColor Yellow
            kubectl delete namespace $NAMESPACE --ignore-not-found=true
            Write-Host "Aștept ca ștergerea să se finalizeze..." -ForegroundColor Gray
            
            # Loop de așteptare pentru ștergere
            for ($i=0; $i -lt 60; $i++) {
                $ErrorActionPreference = "SilentlyContinue"
                $check = kubectl get namespace $NAMESPACE -o name 2>&1
                $exitCode = $LASTEXITCODE
                $ErrorActionPreference = "Stop"

                if ($exitCode -ne 0 -or $check -match "NotFound" -or $check -match "not found") { 
                    break 
                }
                Start-Sleep -Seconds 2
            }
            Write-Host "Namespace șters." -ForegroundColor Green
        }
    }
}

# Verifică dacă release-ul Helm există
$ErrorActionPreference = "SilentlyContinue"
$releaseCheck = helm list -n $NAMESPACE -q 2>&1 | Select-String -Pattern "restaurant-app"
$ErrorActionPreference = "Stop"

if ($releaseCheck) {
    $operation = "upgrade"
    Write-Host "Release detectat. Voi face UPGRADE." -ForegroundColor Yellow
    
    # Pentru upgrade, scale down toate deployment-urile pentru a elimina pod-urile duplicate
    Write-Host "Scalez down toate deployment-urile pentru a elimina pod-urile duplicate..." -ForegroundColor Yellow
    $deployments = @("mongodb", "auth-service", "restaurant-service", "reservations-service", "menu-order-service", "kafka", "zookeeper", "mongo-express", "portainer", "prometheus", "grafana", "loki")
    
    foreach ($deployment in $deployments) {
        $ErrorActionPreference = "SilentlyContinue"
        $exists = kubectl get deployment -n $NAMESPACE $deployment -o name 2>$null
        $ErrorActionPreference = "Stop"
        if ($exists) {
            Write-Host "  Scaling down $deployment..." -ForegroundColor Gray
            kubectl scale deployment -n $NAMESPACE $deployment --replicas=0 2>&1 | Out-Null
        }
    }
    
    Write-Host "Astept 5 secunde pentru ca pod-urile sa fie terminate..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Verifica si sterge pod-urile ramase (daca exista)
    Write-Host "Verific pod-uri ramase..." -ForegroundColor Yellow
    $remainingPods = kubectl get pods -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}' 2>$null
    if ($remainingPods) {
        foreach ($pod in $remainingPods -split ' ') {
            if ($pod) {
                Write-Host "  Sterg pod ramas: $pod" -ForegroundColor Gray
                kubectl delete pod -n $NAMESPACE $pod --ignore-not-found=true 2>&1 | Out-Null
            }
        }
        Start-Sleep -Seconds 3
    }
    
    Write-Host "Toate pod-urile au fost eliminate!" -ForegroundColor Green
    Write-Host ""
} else {
    $operation = "install"
    Write-Host "Release inexistent. Voi face INSTALL." -ForegroundColor Yellow
}
Write-Host ""

# 4. Instalează/Upgrade cu Helm
Write-Host "=== [4/5] Helm $operation ===" -ForegroundColor Green

if ($operation -eq "install") {
    Write-Host "Instalare Helm chart..." -ForegroundColor Yellow
    
    # ---> FIX MAJOR: Pre-creare namespace și etichetare <---
    Write-Host "1. Asigur namespace-ul '$NAMESPACE'..." -ForegroundColor Gray
    $ErrorActionPreference = "SilentlyContinue"
    kubectl create namespace $NAMESPACE 2>&1 | Out-Null
    $ErrorActionPreference = "Stop"
    
    # Adaugăm etichetele Helm manual ca să nu crape la install
    Write-Host "2. Aplic etichete Helm pe namespace..." -ForegroundColor Gray
    kubectl label namespace $NAMESPACE app.kubernetes.io/managed-by=Helm --overwrite 2>&1 | Out-Null
    kubectl annotate namespace $NAMESPACE meta.helm.sh/release-name=restaurant-app --overwrite 2>&1 | Out-Null
    kubectl annotate namespace $NAMESPACE meta.helm.sh/release-namespace=$NAMESPACE --overwrite 2>&1 | Out-Null
    
    # Acum instalăm, spunându-i chart-ului să NU mai încerce să creeze namespace-ul
    Write-Host "3. Rulez helm install..." -ForegroundColor Yellow
    helm install restaurant-app . -n $NAMESPACE --set namespace.create=false
    
} else {
    Write-Host "Upgrade Helm chart..." -ForegroundColor Yellow
    helm upgrade restaurant-app . -n $NAMESPACE --set namespace.create=false
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "EROARE: Helm $operation a eșuat!" -ForegroundColor Red
    exit 1
}

Write-Host "Helm $operation complet!" -ForegroundColor Green
Write-Host ""

# 5. Așteaptă ca pod-urile să pornească
Write-Host "=== [5/5] Așteptare pod-uri să pornească ===" -ForegroundColor Green
Write-Host "Aștept inițial 15 secunde..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verifică statusul periodic
$maxWait = 300
$elapsed = 15
$checkInterval = 15

while ($elapsed -lt $maxWait) {
    Write-Host ""
    Write-Host "Status după $elapsed secunde:" -ForegroundColor Cyan
    
    $ErrorActionPreference = "SilentlyContinue"
    kubectl get pods -n $NAMESPACE 2>&1 | Out-Null
    kubectl get pods -n $NAMESPACE
    
    $readyPods = kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers 2>&1 | Where-Object { $_ -match '1/1|2/2|3/3' -and $_ -notmatch 'No resources' }
    $totalPods = kubectl get pods -n $NAMESPACE --no-headers 2>&1 | Where-Object { $_ -notmatch 'Completed' -and $_ -notmatch 'No resources' -and $_ -notmatch 'Terminating' }
    $ErrorActionPreference = "Stop"
    
    if ($readyPods -and $totalPods) {
        $readyCount = ($readyPods | Measure-Object).Count
        $totalCount = ($totalPods | Measure-Object).Count
        Write-Host "Ready: $readyCount/$totalCount pod-uri" -ForegroundColor Yellow
        
        if ($readyCount -eq $totalCount -and $readyCount -gt 0) {
            Write-Host ""
            Write-Host "Toate pod-urile sunt Ready!" -ForegroundColor Green
            break
        }
    } else {
        Write-Host "Aștept ca pod-urile să fie create..." -ForegroundColor Gray
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
$ErrorActionPreference = "SilentlyContinue"
$nodeIP = kubectl get nodes -o jsonpath="{.items[0].status.addresses[?(@.type=='InternalIP')].address}" 2>&1
if ($LASTEXITCODE -ne 0 -or -not $nodeIP) {
    # Încercăm localhost pentru Kind
    $nodeIP = "localhost"
}
$ErrorActionPreference = "Stop"

Write-Host "Servicii disponibile prin NodePort (IP: $nodeIP):" -ForegroundColor Cyan
Write-Host "  Prometheus:  http://$nodeIP`:30091" -ForegroundColor White
Write-Host "  Grafana:     http://$nodeIP`:30300 (admin/admin123)" -ForegroundColor White
Write-Host "    - Loki disponibil ca data source in Grafana (Explore > Loki)" -ForegroundColor Gray
Write-Host "  Auth Service: http://$nodeIP`:30000" -ForegroundColor White
Write-Host "  Restaurant:  http://$nodeIP`:30001" -ForegroundColor White
Write-Host "  Reservations: http://$nodeIP`:30002" -ForegroundColor White
Write-Host "  Menu Order:  http://$nodeIP`:30003" -ForegroundColor White
Write-Host "  Mongo Express: http://$nodeIP`:30081" -ForegroundColor White
Write-Host "  Portainer:   http://$nodeIP`:30090" -ForegroundColor White

Write-Host ""
Write-Host '=== Install Complet! ===' -ForegroundColor Green