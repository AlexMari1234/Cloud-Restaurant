#!/bin/bash

# Script pentru deploy aplicație Restaurant Management pe Kubernetes
# Folosește resursele din folderul k8s/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Deploy Restaurant Management App pe Kubernetes ==="

# Culori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Namespace
echo -e "${GREEN}[1/9] Creând namespace...${NC}"
kubectl apply -f "$SCRIPT_DIR/namespace.yaml"

# 2. MongoDB Secret
echo -e "${GREEN}[2/9] Creând MongoDB secret...${NC}"
kubectl apply -f "$SCRIPT_DIR/mongodb/secret.yaml"

# 3. MongoDB PVC
echo -e "${GREEN}[3/9] Creând MongoDB PersistentVolumeClaim...${NC}"
kubectl apply -f "$SCRIPT_DIR/mongodb/pvc.yaml"

# 4. MongoDB Deployment și Service
echo -e "${GREEN}[4/9] Deploying MongoDB...${NC}"
kubectl apply -f "$SCRIPT_DIR/mongodb/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/mongodb/service.yaml"

# Așteaptă MongoDB să fie ready
echo -e "${YELLOW}Așteptând MongoDB să fie ready...${NC}"
kubectl wait --for=condition=ready pod -l app=mongodb -n restaurant-app --timeout=120s

# 5. MongoDB Express
echo -e "${GREEN}[5/9] Deploying MongoDB Express...${NC}"
kubectl apply -f "$SCRIPT_DIR/mongo-express/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/mongo-express/service.yaml"

# 6. Portainer PVC și Deployment
echo -e "${GREEN}[6/9] Deploying Portainer...${NC}"
kubectl apply -f "$SCRIPT_DIR/portainer/pvc.yaml"
kubectl apply -f "$SCRIPT_DIR/portainer/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/portainer/service.yaml"

# 7. Zookeeper
echo -e "${GREEN}[7/9] Deploying Zookeeper...${NC}"
kubectl apply -f "$SCRIPT_DIR/kafka/zookeeper-deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/kafka/zookeeper-service.yaml"

# Așteaptă Zookeeper să fie ready
echo -e "${YELLOW}Așteptând Zookeeper să fie ready...${NC}"
kubectl wait --for=condition=ready pod -l app=zookeeper -n restaurant-app --timeout=120s

# 8. Kafka
echo -e "${GREEN}[8/9] Deploying Kafka...${NC}"
kubectl apply -f "$SCRIPT_DIR/kafka/kafka-deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/kafka/kafka-service.yaml"

# Așteaptă Kafka să fie ready
echo -e "${YELLOW}Așteptând Kafka să fie ready...${NC}"
sleep 30

# 9. ConfigMap
echo -e "${GREEN}[9/9] Creând ConfigMaps...${NC}"
kubectl apply -f "$SCRIPT_DIR/configmap.yaml"

# 10. Microservicii
echo -e "${GREEN}[10/10] Deploying microservicii...${NC}"

# Auth Service
echo "  - Auth Service..."
kubectl apply -f "$SCRIPT_DIR/auth-service/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/auth-service/service.yaml"

# Restaurant Service
echo "  - Restaurant Service..."
kubectl apply -f "$SCRIPT_DIR/restaurant-service/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/restaurant-service/service.yaml"

# Reservations Service
echo "  - Reservations Service..."
kubectl apply -f "$SCRIPT_DIR/reservations-service/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/reservations-service/service.yaml"

# Menu Order Service
echo "  - Menu Order Service..."
kubectl apply -f "$SCRIPT_DIR/menu-order-service/deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/menu-order-service/service.yaml"

echo ""
echo -e "${GREEN}=== Deploy complet! ===${NC}"
echo ""
echo "Verifică statusul:"
echo "  kubectl get all -n restaurant-app"
echo ""
echo "Servicii disponibile:"
echo "  Auth Service:        http://localhost:30000"
echo "  Restaurant Service:  http://localhost:30001"
echo "  Reservations:        http://localhost:30002"
echo "  Menu Order:          http://localhost:30003"
echo "  MongoDB Express:     http://localhost:30081"
echo "  Portainer:           http://localhost:30090"
echo ""


