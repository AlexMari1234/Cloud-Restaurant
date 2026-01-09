# Script pentru verificare cluster Kubernetes

$ErrorActionPreference = "Stop"

Write-Host "=== Verificare Cluster Kubernetes ===" -ForegroundColor Green
Write-Host ""

# Verifică dacă kubectl este instalat
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "EROARE: kubectl nu este instalat!" -ForegroundColor Red
    Write-Host "Instalează kubectl: https://kubernetes.io/docs/tasks/tools/" -ForegroundColor Yellow
    exit 1
}

Write-Host "kubectl: OK" -ForegroundColor Green

# Verifică conexiunea la cluster
Write-Host ""
Write-Host "Verificând conexiunea la cluster..." -ForegroundColor Yellow
try {
    $clusterInfo = kubectl cluster-info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Cluster conexiune: OK" -ForegroundColor Green
        Write-Host ""
        Write-Host "Cluster info:" -ForegroundColor Cyan
        kubectl cluster-info
    } else {
        throw "Nu există conexiune"
    }
} catch {
    Write-Host "EROARE: Nu există conexiune la cluster!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trebuie să pornești un cluster Kubernetes:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pentru Kind:" -ForegroundColor Cyan
    Write-Host "  1. Instalează Kind: https://kind.sigs.k8s.io/docs/user/quick-start/" -ForegroundColor White
    Write-Host "  2. Creează cluster: kind create cluster --name restaurant-cluster" -ForegroundColor White
    Write-Host ""
    Write-Host "Pentru Minikube:" -ForegroundColor Cyan
    Write-Host "  1. Instalează Minikube: https://minikube.sigs.k8s.io/docs/start/" -ForegroundColor White
    Write-Host "  2. Pornește cluster: minikube start" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Detectează tipul de cluster
Write-Host ""
Write-Host "Detectând tipul de cluster..." -ForegroundColor Yellow

$CLUSTER_TYPE = ""
$clusterInfoText = kubectl cluster-info 2>&1 | Out-String

if ($clusterInfoText -match "kind") {
    $CLUSTER_TYPE = "kind"
    Write-Host "Tip cluster detectat: Kind" -ForegroundColor Green
} elseif ($clusterInfoText -match "minikube") {
    $CLUSTER_TYPE = "minikube"
    Write-Host "Tip cluster detectat: Minikube" -ForegroundColor Green
} else {
    # Verifică Kind clusters
    if (Get-Command kind -ErrorAction SilentlyContinue) {
        $kindClusters = kind get clusters 2>&1
        if ($kindClusters -and -not ($kindClusters -match "No kind clusters found")) {
            $CLUSTER_TYPE = "kind"
            Write-Host "Tip cluster detectat: Kind (verificare clusters)" -ForegroundColor Green
            Write-Host "Clusters Kind disponibile:" -ForegroundColor Cyan
            kind get clusters
        }
    }
    
    # Verifică Minikube status
    if (Get-Command minikube -ErrorAction SilentlyContinue) {
        $minikubeStatus = minikube status 2>&1 | Out-String
        if ($minikubeStatus -match "Running") {
            $CLUSTER_TYPE = "minikube"
            Write-Host "Tip cluster detectat: Minikube (verificare status)" -ForegroundColor Green
            Write-Host ""
            Write-Host "Minikube status:" -ForegroundColor Cyan
            minikube status
        }
    }
    
    if ([string]::IsNullOrEmpty($CLUSTER_TYPE)) {
        Write-Host "Nu s-a putut detecta tipul de cluster automat." -ForegroundColor Yellow
        Write-Host "Cluster-ul pare să ruleze, dar nu este Kind sau Minikube." -ForegroundColor Yellow
    }
}

# Verifică nodurile
Write-Host ""
Write-Host "Noduri în cluster:" -ForegroundColor Cyan
kubectl get nodes

# Verifică namespace-ul restaurant-app
Write-Host ""
Write-Host "Verificând namespace restaurant-app..." -ForegroundColor Yellow
$namespace = kubectl get namespace restaurant-app 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Namespace restaurant-app: Există" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resurse în namespace:" -ForegroundColor Cyan
    kubectl get all -n restaurant-app
} else {
    Write-Host "Namespace restaurant-app: Nu există (va fi creat la deploy)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Verificare Completă ===" -ForegroundColor Green
Write-Host ""
Write-Host "Cluster este gata pentru deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "Rulează deploy cu: .\scripts\full-deploy.ps1" -ForegroundColor Cyan


