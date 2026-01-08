#!/bin/bash

# Script pentru build și deploy aplicație Restaurant Management pe Kubernetes

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Culori pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Restaurant Management App - Build & Deploy ===${NC}"

# Verifică dacă kubectl este instalat
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl nu este instalat!${NC}"
    exit 1
fi

# Verifică dacă helm este instalat
if ! command -v helm &> /dev/null; then
    echo -e "${RED}helm nu este instalat!${NC}"
    exit 1
fi

# Verifică dacă docker este instalat
if ! command -v docker &> /dev/null; then
    echo -e "${RED}docker nu este instalat!${NC}"
    exit 1
fi

# Detectează tipul de cluster
CLUSTER_TYPE=""
if kubectl cluster-info | grep -q "kind"; then
    CLUSTER_TYPE="kind"
elif kubectl cluster-info | grep -q "minikube"; then
    CLUSTER_TYPE="minikube"
else
    echo -e "${YELLOW}Tip de cluster necunoscut. Presupunem Kind.${NC}"
    CLUSTER_TYPE="kind"
fi

echo -e "${GREEN}Cluster detectat: ${CLUSTER_TYPE}${NC}"

# Build imagini
echo -e "${YELLOW}Construind imagini Docker...${NC}"
cd "$PROJECT_ROOT"

echo "Building auth-service..."
docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .

echo "Building restaurant-service..."
docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .

echo "Building reservations-service..."
docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .

echo "Building menu-order-service..."
docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .

# Încarcă imagini în cluster
if [ "$CLUSTER_TYPE" = "kind" ]; then
    echo -e "${YELLOW}Încărcând imagini în Kind cluster...${NC}"
    kind load docker-image restaurant-auth-service:latest
    kind load docker-image restaurant-restaurant-service:latest
    kind load docker-image restaurant-reservations-service:latest
    kind load docker-image restaurant-menu-order-service:latest
elif [ "$CLUSTER_TYPE" = "minikube" ]; then
    echo -e "${YELLOW}Configurând Minikube docker environment...${NC}"
    eval $(minikube docker-env)
    echo -e "${YELLOW}Rebuilding imagini în Minikube...${NC}"
    docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .
    docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .
    docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .
    docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .
fi

# Deploy cu Helm
echo -e "${YELLOW}Deploying cu Helm...${NC}"
cd "$PROJECT_ROOT/helm/restaurant-app"

# Verifică dacă release-ul există deja
if helm list -n restaurant-app | grep -q "restaurant-app"; then
    echo -e "${YELLOW}Upgrading release existent...${NC}"
    helm upgrade restaurant-app . --namespace restaurant-app
else
    echo -e "${YELLOW}Installing release nou...${NC}"
    helm install restaurant-app . --namespace restaurant-app --create-namespace
fi

# Așteaptă pod-urile să fie ready
echo -e "${YELLOW}Așteptând pod-urile să fie ready...${NC}"
kubectl wait --for=condition=ready pod --all -n restaurant-app --timeout=300s

# Afișează statusul
echo -e "${GREEN}=== Status Deployment ===${NC}"
kubectl get all -n restaurant-app

echo -e "${GREEN}=== Servicii disponibile ===${NC}"
echo "Auth Service: http://localhost:30000"
echo "Restaurant Service: http://localhost:30001"
echo "Reservations Service: http://localhost:30002"
echo "Menu Order Service: http://localhost:30003"
echo "MongoDB Express: http://localhost:30081"
echo "Portainer: http://localhost:30090"

if [ "$CLUSTER_TYPE" = "minikube" ]; then
    MINIKUBE_IP=$(minikube ip)
    echo -e "${YELLOW}Pentru Minikube, folosește IP-ul: ${MINIKUBE_IP}${NC}"
fi

echo -e "${GREEN}=== Deploy complet! ===${NC}"

