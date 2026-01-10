# Script complet pentru fix, rebuild si redeploy complet

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$K8S_DIR = Join-Path $PROJECT_ROOT "k8s"
$NAMESPACE = "restaurant-app"

Write-Host "=== Full Fix - Sterge tot, Rebuild si Deploy ===" -ForegroundColor Green
Write-Host ""

# Verifica namespace
if (-not (kubectl get namespace $NAMESPACE -o name 2>$null)) {
    Write-Host "EROARE: Namespace $NAMESPACE nu exista!" -ForegroundColor Red
    exit 1
}

# Detecteaza cluster-ul Kind
$kindClusters = kind get clusters 2>&1 | Out-String
$kindClusterName = "kind"
if ($kindClusters -match "restaurant-cluster") {
    $kindClusterName = "restaurant-cluster"
    Write-Host "Cluster Kind detectat: restaurant-cluster" -ForegroundColor Cyan
}

# 0. Scale down toate deployment-urile la 0 pentru a elimina pod-urile duplicate
Write-Host "=== [0/6] Scale down toate deployment-urile ===" -ForegroundColor Green
Write-Host "Scalez toate deployment-urile la 0 pentru a elimina pod-urile duplicate..." -ForegroundColor Yellow

$deployments = @("mongodb", "auth-service", "restaurant-service", "reservations-service", "menu-order-service", "kafka", "zookeeper", "mongo-express", "portainer")

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

# 1. Build imagini
Write-Host "=== [1/6] Building Docker Images ===" -ForegroundColor Green
cd $PROJECT_ROOT

Write-Host "Building auth-service..." -ForegroundColor Yellow
docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .

Write-Host "Building restaurant-service..." -ForegroundColor Yellow
docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .

Write-Host "Building reservations-service..." -ForegroundColor Yellow
docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .

Write-Host "Building menu-order-service..." -ForegroundColor Yellow
docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .

Write-Host "Build complet!" -ForegroundColor Green
Write-Host ""

# 2. Load imagini in Kind
Write-Host "=== [2/6] Loading Images into Kind ===" -ForegroundColor Green
Write-Host "Loading auth-service..." -ForegroundColor Yellow
kind load docker-image restaurant-auth-service:latest --name $kindClusterName

Write-Host "Loading restaurant-service..." -ForegroundColor Yellow
kind load docker-image restaurant-restaurant-service:latest --name $kindClusterName

Write-Host "Loading reservations-service..." -ForegroundColor Yellow
kind load docker-image restaurant-reservations-service:latest --name $kindClusterName

Write-Host "Loading menu-order-service..." -ForegroundColor Yellow
kind load docker-image restaurant-menu-order-service:latest --name $kindClusterName

Write-Host "Images loaded!" -ForegroundColor Green
Write-Host ""

# 3. Aplica deployment-urile actualizate
Write-Host "=== [3/6] Applying Updated Deployments ===" -ForegroundColor Green
cd $K8S_DIR

Write-Host "Updating MongoDB deployment..." -ForegroundColor Yellow
kubectl apply -f mongodb/deployment.yaml

Write-Host "Updating auth-service deployment..." -ForegroundColor Yellow
kubectl apply -f auth-service/deployment.yaml

Write-Host "Updating restaurant-service deployment..." -ForegroundColor Yellow
kubectl apply -f restaurant-service/deployment.yaml

Write-Host "Updating reservations-service deployment..." -ForegroundColor Yellow
kubectl apply -f reservations-service/deployment.yaml

Write-Host "Updating menu-order-service deployment..." -ForegroundColor Yellow
kubectl apply -f menu-order-service/deployment.yaml

# --- FIX KAFKA START ---
if (Test-Path "kafka/kafka-deployment.yaml") {
    Write-Host "--- APLICARE FIX KAFKA ---" -ForegroundColor Magenta
    
    # 1. Stergem explicit serviciul vechi 'kafka' care cauza conflictul de porturi
    Write-Host "Stergere serviciu vechi 'kafka'..." -ForegroundColor Gray
    kubectl delete svc kafka -n $NAMESPACE --ignore-not-found=true 2>&1 | Out-Null
    
    # 2. Aplicam noul serviciu (kafka-cluster) daca exista fisierul
    if (Test-Path "kafka/kafka-service.yaml") {
        Write-Host "Applying kafka-service.yaml..." -ForegroundColor Yellow
        kubectl apply -f kafka/kafka-service.yaml
    }
    
    # 3. Aplicam deployment-ul
    Write-Host "Applying kafka-deployment.yaml..." -ForegroundColor Yellow
    kubectl apply -f kafka/kafka-deployment.yaml
}

if (Test-Path "kafka/zookeeper-deployment.yaml") {
    Write-Host "Updating zookeeper deployment..." -ForegroundColor Yellow
    # Verificam daca exista si service file pentru zookeeper
    if (Test-Path "kafka/zookeeper-service.yaml") {
        kubectl apply -f kafka/zookeeper-service.yaml
    }
    kubectl apply -f kafka/zookeeper-deployment.yaml
}
# --- FIX KAFKA END ---

if (Test-Path "mongo-express/deployment.yaml") {
    Write-Host "Updating mongo-express deployment..." -ForegroundColor Yellow
    kubectl apply -f mongo-express/deployment.yaml
}
if (Test-Path "portainer/deployment.yaml") {
    Write-Host "Updating portainer deployment..." -ForegroundColor Yellow
    kubectl apply -f portainer/deployment.yaml
}

Write-Host "Deployments updated!" -ForegroundColor Green
Write-Host ""

# 3.5. Scale inapoi toate deployment-urile la 1
Write-Host "=== [3.5/6] Scale up toate deployment-urile ===" -ForegroundColor Green
Write-Host "Scalez toate deployment-urile inapoi la 1..." -ForegroundColor Yellow

foreach ($deployment in $deployments) {
    $exists = kubectl get deployment -n $NAMESPACE $deployment -o name 2>$null
    if ($exists) {
        Write-Host "  Scaling up $deployment la 1..." -ForegroundColor Gray
        kubectl scale deployment -n $NAMESPACE $deployment --replicas=1 2>&1 | Out-Null
    }
}

Write-Host "Deployments scaled up!" -ForegroundColor Green
Write-Host ""

# 4. Asteapta ca pod-urile sa porneasca
Write-Host "=== [4/6] Asteptare pod-uri sa porneasca ===" -ForegroundColor Green
Write-Host "MongoDB necesita ~90 secunde..." -ForegroundColor Yellow
Write-Host "Kafka necesita ~60 secunde..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Astept initial 30 secunde..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verifica statusul periodic
$maxWait = 180
$elapsed = 30
$checkInterval = 20

while ($elapsed -lt $maxWait) {
    Write-Host ""
    Write-Host "Status dupa $elapsed secunde:" -ForegroundColor Cyan
    kubectl get pods -n $NAMESPACE
    
    $readyPods = kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running --no-headers 2>$null | Where-Object { $_ -match '1/1|2/2|3/3' }
    $totalPods = kubectl get pods -n $NAMESPACE --no-headers 2>$null | Where-Object { $_ -notmatch 'Completed' }
    
    if ($readyPods -and $totalPods) {
        $readyCount = ($readyPods | Measure-Object).Count
        $totalCount = ($totalPods | Measure-Object).Count
        Write-Host "Ready: $readyCount/$totalCount pod-uri" -ForegroundColor Yellow
        
        if ($readyCount -eq $totalCount) {
            Write-Host ""
            Write-Host "Toate pod-urile sunt Ready!" -ForegroundColor Green
            break
        }
    }
    
    Write-Host "Astept inca $checkInterval secunde..." -ForegroundColor Yellow
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
}

# 6. Status final si verificare duplicate
Write-Host ""
Write-Host "=== [6/6] Status Final ===" -ForegroundColor Green
kubectl get pods -n $NAMESPACE

Write-Host ""
Write-Host "Verificare duplicate..." -ForegroundColor Yellow
$allPods = kubectl get pods -n $NAMESPACE --no-headers 2>$null
if ($allPods) {
    $duplicateServices = @{}
    foreach ($podLine in $allPods) {
        if ($podLine) {
            $podName = ($podLine -split '\s+')[0]
            if ($podName -match '^([a-z-]+)-\w+-\w+$') {
                $serviceName = $matches[1]
                if (-not $duplicateServices.ContainsKey($serviceName)) {
                    $duplicateServices[$serviceName] = @()
                }
                $duplicateServices[$serviceName] += $podName
            }
        }
    }
    
    $hasDuplicates = $false
    foreach ($serviceName in $duplicateServices.Keys) {
        if ($duplicateServices[$serviceName].Count -gt 1) {
            Write-Host "  ATENTIE: $serviceName are $($duplicateServices[$serviceName].Count) pod-uri:" -ForegroundColor Red
            foreach ($pod in $duplicateServices[$serviceName]) {
                Write-Host "    - $pod" -ForegroundColor Yellow
            }
            $hasDuplicates = $true
        }
    }
    
    if (-not $hasDuplicates) {
        Write-Host "  OK: Nu exista duplicate!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Fix Complet! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Pentru a monitoriza in timp real:" -ForegroundColor Yellow
Write-Host "  kubectl get pods -n $NAMESPACE -w" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pentru loguri:" -ForegroundColor Yellow
Write-Host "  kubectl logs -n $NAMESPACE <pod-name>" -ForegroundColor Cyan
Write-Host ""