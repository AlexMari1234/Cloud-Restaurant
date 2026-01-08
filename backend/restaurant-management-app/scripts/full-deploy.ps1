# Script complet pentru build, load și deploy aplicație Restaurant Management

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR
$K8S_DIR = Join-Path $PROJECT_ROOT "k8s"

Write-Host "=== Restaurant Management App - Full Deploy ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă kubectl este instalat
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "EROARE: kubectl nu este instalat!" -ForegroundColor Red
    Write-Host "Instalează kubectl: https://kubernetes.io/docs/tasks/tools/" -ForegroundColor Yellow
    exit 1
}

# Verifică dacă docker este instalat
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "EROARE: docker nu este instalat!" -ForegroundColor Red
    Write-Host "Instalează Docker: https://www.docker.com/get-started" -ForegroundColor Yellow
    exit 1
}

# Verifică dacă kubectl este conectat la un cluster
Write-Host "Verificând conexiunea la cluster..." -ForegroundColor Yellow
try {
    $null = kubectl cluster-info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Nu există conexiune la cluster"
    }
} catch {
    Write-Host ""
    Write-Host "EROARE: Nu există conexiune la cluster Kubernetes!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trebuie să ai un cluster Kubernetes configurat:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pentru Kind:" -ForegroundColor Cyan
    Write-Host "  kind create cluster --name restaurant-cluster" -ForegroundColor White
    Write-Host ""
    Write-Host "Pentru Minikube:" -ForegroundColor Cyan
    Write-Host "  minikube start" -ForegroundColor White
    Write-Host ""
    Write-Host "Verifică statusul cluster-ului:" -ForegroundColor Yellow
    Write-Host "  kubectl cluster-info" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Detectează tipul de cluster
$CLUSTER_TYPE = ""
try {
    $kubectlInfo = kubectl cluster-info 2>&1 | Out-String
    if ($kubectlInfo -match "kind") {
        $CLUSTER_TYPE = "kind"
    } elseif ($kubectlInfo -match "minikube") {
        $CLUSTER_TYPE = "minikube"
    } else {
        # Verifică dacă există Kind clusters
        if (Get-Command kind -ErrorAction SilentlyContinue) {
            $kindClusters = kind get clusters 2>&1 | Out-String
            if ($kindClusters -and -not ($kindClusters -match "No kind clusters found")) {
                $CLUSTER_TYPE = "kind"
                Write-Host "Tip de cluster detectat: Kind (prin verificare clusters)" -ForegroundColor Cyan
            }
        }
        
        # Verifică dacă Minikube rulează
        if (Get-Command minikube -ErrorAction SilentlyContinue) {
            $minikubeStatus = minikube status 2>&1 | Out-String
            if ($minikubeStatus -match "Running") {
                $CLUSTER_TYPE = "minikube"
                Write-Host "Tip de cluster detectat: Minikube (prin verificare status)" -ForegroundColor Cyan
            }
        }
        
        if ([string]::IsNullOrEmpty($CLUSTER_TYPE)) {
            Write-Host "Nu s-a putut detecta tipul de cluster. Presupunem Kind." -ForegroundColor Yellow
            $CLUSTER_TYPE = "kind"
        }
    }
} catch {
    Write-Host "Nu s-a putut detecta tipul de cluster. Presupunem Kind." -ForegroundColor Yellow
    $CLUSTER_TYPE = "kind"
}

Write-Host "Cluster detectat: $CLUSTER_TYPE" -ForegroundColor Cyan
Write-Host ""

# Pasul 1: Build imagini
Write-Host "=== [1/4] Building Docker Images ===" -ForegroundColor Green
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

# Pasul 2: Load imagini în cluster
Write-Host "=== [2/4] Loading Images into Cluster ===" -ForegroundColor Green

if ($CLUSTER_TYPE -eq "kind") {
    Write-Host "Loading images into Kind..." -ForegroundColor Yellow
    
    # Detectează numele cluster-ului Kind
    $kindClusters = kind get clusters 2>&1 | Out-String
    $kindClusterName = "kind"  # default
    if ($kindClusters -match "restaurant-cluster") {
        $kindClusterName = "restaurant-cluster"
        Write-Host "Cluster Kind detectat: restaurant-cluster" -ForegroundColor Cyan
    } elseif ($kindClusters -match "kind") {
        $kindClusterName = "kind"
        Write-Host "Cluster Kind detectat: kind (default)" -ForegroundColor Cyan
    }
    
    Write-Host "Loading auth-service..." -ForegroundColor Yellow
    kind load docker-image restaurant-auth-service:latest --name $kindClusterName
    
    Write-Host "Loading restaurant-service..." -ForegroundColor Yellow
    kind load docker-image restaurant-restaurant-service:latest --name $kindClusterName
    
    Write-Host "Loading reservations-service..." -ForegroundColor Yellow
    kind load docker-image restaurant-reservations-service:latest --name $kindClusterName
    
    Write-Host "Loading menu-order-service..." -ForegroundColor Yellow
    kind load docker-image restaurant-menu-order-service:latest --name $kindClusterName
} elseif ($CLUSTER_TYPE -eq "minikube") {
    Write-Host "Configuring Minikube docker environment..." -ForegroundColor Yellow
    & minikube docker-env | Invoke-Expression
    
    Write-Host "Rebuilding images in Minikube..." -ForegroundColor Yellow
    docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .
    docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .
    docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .
    docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .
}

Write-Host "Images loaded!" -ForegroundColor Green
Write-Host ""

# Pasul 3: Deploy cu kubectl
Write-Host "=== [3/4] Deploying to Kubernetes ===" -ForegroundColor Green
cd $K8S_DIR

# Rulează scriptul de deploy
& "$K8S_DIR\deploy.ps1"

Write-Host ""

# Pasul 4: Verificare status
Write-Host "=== [4/4] Verifying Deployment ===" -ForegroundColor Green
Write-Host ""
Write-Host "Status pod-uri:" -ForegroundColor Cyan
kubectl get pods -n restaurant-app

Write-Host ""
Write-Host "Status servicii:" -ForegroundColor Cyan
kubectl get svc -n restaurant-app

Write-Host ""
Write-Host "=== Deploy Complet! ===" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Dacă vezi ImagePullBackOff, rulează:" -ForegroundColor Yellow
Write-Host "  .\scripts\fix-images.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pentru a accesa serviciile pe localhost:3000-3003, rulează:" -ForegroundColor Yellow
Write-Host "  .\scripts\access-services.ps1" -ForegroundColor Cyan
Write-Host "  (sau .\scripts\port-forward.ps1)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pentru Kind, NodePort funcționează doar cu IP-ul nodului!" -ForegroundColor Yellow
Write-Host "Obține IP-ul nodului cu: kubectl get nodes -o wide" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servicii NodePort (folosește <node-ip>):" -ForegroundColor Yellow
Write-Host "  Auth Service:        http://<node-ip>:30000"
Write-Host "  Restaurant Service:  http://<node-ip>:30001"
Write-Host "  Reservations:        http://<node-ip>:30002"
Write-Host "  Menu Order:          http://<node-ip>:30003"
Write-Host "  MongoDB Express:     http://<node-ip>:30081"
Write-Host "  Portainer:           http://<node-ip>:30090"
Write-Host ""

