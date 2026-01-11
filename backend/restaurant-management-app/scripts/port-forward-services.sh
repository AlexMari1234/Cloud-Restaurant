#!/bin/bash

# Port Forward Script pentru serviciile Kubernetes
# Acest script face port-forward pentru toate serviciile importante

echo "=== Port Forward pentru Restaurant Management App ==="
echo ""

# Namespace
NAMESPACE="restaurant-app"

# Verifică dacă namespace-ul există
if ! kubectl get namespace "$NAMESPACE" &>/dev/null; then
    echo "Eroare: Namespace '$NAMESPACE' nu există!"
    echo "Rulează mai întâi: helm install restaurant-app ./helm/restaurant-app -n $NAMESPACE --create-namespace"
    exit 1
fi

echo "Port Forward-uri disponibile:"
echo ""
echo "1. Auth Service (Kubernetes) -> localhost:4000"
echo "   kubectl port-forward -n $NAMESPACE svc/auth-service 4000:3000"
echo ""
echo "2. Restaurant Service (Kubernetes) -> localhost:4001"
echo "   kubectl port-forward -n $NAMESPACE svc/restaurant-service 4001:3001"
echo ""
echo "3. Reservations Service (Kubernetes) -> localhost:4002"
echo "   kubectl port-forward -n $NAMESPACE svc/reservations-service 4002:3002"
echo ""
echo "4. Menu Order Service (Kubernetes) -> localhost:4003"
echo "   kubectl port-forward -n $NAMESPACE svc/menu-order-service 4003:3003"
echo ""
echo "5. Grafana -> localhost:3030 (pentru a evita conflictul cu auth-service local pe 3000)"
echo "   kubectl port-forward -n $NAMESPACE svc/grafana 3030:3000"
echo ""
echo "6. Prometheus -> localhost:9090"
echo "   kubectl port-forward -n $NAMESPACE svc/prometheus 9090:9090"
echo ""
echo "7. MongoDB Express -> localhost:8081"
echo "   kubectl port-forward -n $NAMESPACE svc/mongo-express 8081:8081"
echo ""
echo "8. Portainer -> localhost:9000"
echo "   kubectl port-forward -n $NAMESPACE svc/portainer 9000:9000"
echo ""

read -p "Selectează serviciul pentru port-forward (1-8): " choice

case $choice in
    1)
        echo "Port-forward pentru Auth Service..."
        kubectl port-forward -n "$NAMESPACE" svc/auth-service 4000:3000
        ;;
    2)
        echo "Port-forward pentru Restaurant Service..."
        kubectl port-forward -n "$NAMESPACE" svc/restaurant-service 4001:3001
        ;;
    3)
        echo "Port-forward pentru Reservations Service..."
        kubectl port-forward -n "$NAMESPACE" svc/reservations-service 4002:3002
        ;;
    4)
        echo "Port-forward pentru Menu Order Service..."
        kubectl port-forward -n "$NAMESPACE" svc/menu-order-service 4003:3003
        ;;
    5)
        echo "Port-forward pentru Grafana..."
        echo "Grafana va fi disponibilă la: http://localhost:3030 (admin/admin123)"
        kubectl port-forward -n "$NAMESPACE" svc/grafana 3030:3000
        ;;
    6)
        echo "Port-forward pentru Prometheus..."
        echo "Prometheus va fi disponibilă la: http://localhost:9090"
        kubectl port-forward -n "$NAMESPACE" svc/prometheus 9090:9090
        ;;
    7)
        echo "Port-forward pentru MongoDB Express..."
        kubectl port-forward -n "$NAMESPACE" svc/mongo-express 8081:8081
        ;;
    8)
        echo "Port-forward pentru Portainer..."
        kubectl port-forward -n "$NAMESPACE" svc/portainer 9000:9000
        ;;
    *)
        echo "Opțiune invalidă!"
        exit 1
        ;;
esac

