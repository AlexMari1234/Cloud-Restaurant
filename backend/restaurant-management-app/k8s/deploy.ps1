# Script PowerShell pentru deploy aplicație Restaurant Management pe Kubernetes
# Folosește resursele din folderul k8s/

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Deploy Restaurant Management App pe Kubernetes ===" -ForegroundColor Green

# 1. Namespace
Write-Host "[1/9] Creând namespace..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\namespace.yaml"

# 2. MongoDB Secret
Write-Host "[2/9] Creând MongoDB secret..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\mongodb\secret.yaml"

# 3. MongoDB PVC
Write-Host "[3/9] Creând MongoDB PersistentVolumeClaim..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\mongodb\pvc.yaml"

# 4. MongoDB Deployment și Service
Write-Host "[4/9] Deploying MongoDB..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\mongodb\deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\mongodb\service.yaml"

# Așteaptă MongoDB să fie ready
Write-Host "Așteptând MongoDB să fie ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=mongodb -n restaurant-app --timeout=120s

# 5. MongoDB Express
Write-Host "[5/9] Deploying MongoDB Express..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\mongo-express\deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\mongo-express\service.yaml"

# 6. Portainer PVC și Deployment
Write-Host "[6/9] Deploying Portainer..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\portainer\pvc.yaml"
kubectl apply -f "$SCRIPT_DIR\portainer\deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\portainer\service.yaml"

# 7. Zookeeper
Write-Host "[7/9] Deploying Zookeeper..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\kafka\zookeeper-deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\kafka\zookeeper-service.yaml"

# Așteaptă Zookeeper să fie ready
Write-Host "Așteptând Zookeeper să fie ready..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod -l app=zookeeper -n restaurant-app --timeout=120s

# 8. Kafka
Write-Host "[8/9] Deploying Kafka..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\kafka\kafka-deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\kafka\kafka-service.yaml"

# Așteaptă Kafka să fie ready
Write-Host "Așteptând Kafka să fie ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 9. ConfigMap
Write-Host "[9/9] Creând ConfigMaps..." -ForegroundColor Green
kubectl apply -f "$SCRIPT_DIR\configmap.yaml"

# 10. Microservicii
Write-Host "[10/10] Deploying microservicii..." -ForegroundColor Green

# Auth Service
Write-Host "  - Auth Service..." -ForegroundColor Cyan
kubectl apply -f "$SCRIPT_DIR\auth-service\deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\auth-service\service.yaml"

# Restaurant Service
Write-Host "  - Restaurant Service..." -ForegroundColor Cyan
kubectl apply -f "$SCRIPT_DIR\restaurant-service\deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\restaurant-service\service.yaml"

# Reservations Service
Write-Host "  - Reservations Service..." -ForegroundColor Cyan
kubectl apply -f "$SCRIPT_DIR\reservations-service\deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\reservations-service\service.yaml"

# Menu Order Service
Write-Host "  - Menu Order Service..." -ForegroundColor Cyan
kubectl apply -f "$SCRIPT_DIR\menu-order-service\deployment.yaml"
kubectl apply -f "$SCRIPT_DIR\menu-order-service\service.yaml"

Write-Host ""
Write-Host "=== Deploy complet! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Verifică statusul:"
Write-Host "  kubectl get all -n restaurant-app"
Write-Host ""
Write-Host "Servicii disponibile:"
Write-Host "  Auth Service:        http://localhost:30000 (sau folosește port-forward la 3000)"
Write-Host "  Restaurant Service:  http://localhost:30001 (sau folosește port-forward la 3001)"
Write-Host "  Reservations:        http://localhost:30002 (sau folosește port-forward la 3002)"
Write-Host "  Menu Order:          http://localhost:30003 (sau folosește port-forward la 3003)"
Write-Host "  MongoDB Express:     http://localhost:30081"
Write-Host "  Portainer:           http://localhost:30090"
Write-Host ""
Write-Host "Pentru port-forward la localhost:3000-3003, rulează: .\scripts\port-forward.ps1"
Write-Host ""

