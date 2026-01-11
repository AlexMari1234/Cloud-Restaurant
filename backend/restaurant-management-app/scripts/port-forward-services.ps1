# Port Forward Script pentru serviciile Kubernetes
# Acest script face port-forward pentru toate serviciile importante

Write-Host "=== Port Forward pentru Restaurant Management App ===" -ForegroundColor Cyan
Write-Host ""

# Namespace
$namespace = "restaurant-app"

# Verifică dacă namespace-ul există
$nsExists = kubectl get namespace $namespace 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Eroare: Namespace '$namespace' nu există!" -ForegroundColor Red
    Write-Host "Rulează mai întâi: helm install restaurant-app ./helm/restaurant-app -n $namespace --create-namespace" -ForegroundColor Yellow
    exit 1
}

Write-Host "Port Forward-uri disponibile:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Auth Service (Kubernetes) -> localhost:4000" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $namespace svc/auth-service 4000:3000"
Write-Host ""
Write-Host "2. Restaurant Service (Kubernetes) -> localhost:4001" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $namespace svc/restaurant-service 4001:3001"
Write-Host ""
Write-Host "3. Reservations Service (Kubernetes) -> localhost:4002" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $namespace svc/reservations-service 4002:3002"
Write-Host ""
Write-Host "4. Menu Order Service (Kubernetes) -> localhost:4003" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $namespace svc/menu-order-service 4003:3003"
Write-Host ""
Write-Host "5. Grafana -> localhost:3030 (pentru a evita conflictul cu auth-service local pe 3000)" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $namespace svc/grafana 3030:3000"
Write-Host ""
Write-Host "6. Prometheus -> localhost:9090" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $namespace svc/prometheus 9090:9090"
Write-Host ""
Write-Host "7. MongoDB Express -> localhost:8081" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $namespace svc/mongo-express 8081:8081"
Write-Host ""
Write-Host "8. Portainer -> localhost:9000" -ForegroundColor Yellow
Write-Host "   kubectl port-forward -n $namespace svc/portainer 9000:9000"
Write-Host ""

$choice = Read-Host "Selectează serviciul pentru port-forward (1-8) sau 'all' pentru toate"

switch ($choice) {
    "1" {
        Write-Host "Port-forward pentru Auth Service..." -ForegroundColor Cyan
        kubectl port-forward -n $namespace svc/auth-service 4000:3000
    }
    "2" {
        Write-Host "Port-forward pentru Restaurant Service..." -ForegroundColor Cyan
        kubectl port-forward -n $namespace svc/restaurant-service 4001:3001
    }
    "3" {
        Write-Host "Port-forward pentru Reservations Service..." -ForegroundColor Cyan
        kubectl port-forward -n $namespace svc/reservations-service 4002:3002
    }
    "4" {
        Write-Host "Port-forward pentru Menu Order Service..." -ForegroundColor Cyan
        kubectl port-forward -n $namespace svc/menu-order-service 4003:3003
    }
    "5" {
        Write-Host "Port-forward pentru Grafana..." -ForegroundColor Cyan
        Write-Host "Grafana va fi disponibilă la: http://localhost:3030 (admin/admin123)" -ForegroundColor Green
        kubectl port-forward -n $namespace svc/grafana 3030:3000
    }
    "6" {
        Write-Host "Port-forward pentru Prometheus..." -ForegroundColor Cyan
        Write-Host "Prometheus va fi disponibilă la: http://localhost:9090" -ForegroundColor Green
        kubectl port-forward -n $namespace svc/prometheus 9090:9090
    }
    "7" {
        Write-Host "Port-forward pentru MongoDB Express..." -ForegroundColor Cyan
        kubectl port-forward -n $namespace svc/mongo-express 8081:8081
    }
    "8" {
        Write-Host "Port-forward pentru Portainer..." -ForegroundColor Cyan
        kubectl port-forward -n $namespace svc/portainer 9000:9000
    }
    "all" {
        Write-Host "ATENȚIE: Port-forward pentru toate serviciile simultan necesită terminale separate!" -ForegroundColor Yellow
        Write-Host "Rulează comenzile de mai sus în terminale separate sau folosește background jobs." -ForegroundColor Yellow
    }
    default {
        Write-Host "Opțiune invalidă!" -ForegroundColor Red
    }
}

