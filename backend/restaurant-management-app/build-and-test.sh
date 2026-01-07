#!/bin/bash

# Build and Test Script pentru Restaurant Management App cu ML Service
# Autor: System
# Data: $(date)

set -e  # Exit on any error

echo "🚀 RESTAURANT MANAGEMENT APP - BUILD & TEST"
echo "=============================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Check prerequisites
log_info "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed"
    exit 1
fi

log_success "Prerequisites OK"

# Step 2: Clean up previous containers
log_info "Cleaning up previous containers..."
docker-compose down --remove-orphans --volumes || true
docker system prune -f || true
log_success "Cleanup completed"

# Step 3: Build all services
log_info "Building all services..."
docker-compose build --no-cache

if [ $? -eq 0 ]; then
    log_success "All services built successfully"
else
    log_error "Build failed"
    exit 1
fi

# Step 4: Start services
log_info "Starting services..."
docker-compose up -d

if [ $? -eq 0 ]; then
    log_success "Services started successfully"
else
    log_error "Failed to start services"
    exit 1
fi

# Step 5: Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 30

# Check service health
services=("auth-service:3000" "restaurant-service:3001" "reservations-service:3002" "menu-order-service:3003" "ml-service:3004")

for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    log_info "Checking $name on port $port..."
    
    for i in {1..10}; do
        if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
            log_success "$name is healthy"
            break
        else
            if [ $i -eq 10 ]; then
                log_warning "$name health check failed after 10 attempts"
            else
                sleep 3
            fi
        fi
    done
done

# Step 6: Check Kong Gateway
log_info "Checking Kong Gateway..."
for i in {1..10}; do
    if curl -f -s "http://localhost:8000" > /dev/null 2>&1; then
        log_success "Kong Gateway is ready"
        break
    else
        if [ $i -eq 10 ]; then
            log_warning "Kong Gateway health check failed"
        else
            sleep 3
        fi
    fi
done

# Step 7: Test ML Service specifically
log_info "Testing ML Service..."
cd services/ml-service

if [ -f "docker-test.py" ]; then
    log_info "Running ML Service Docker tests..."
    python3 docker-test.py
    
    if [ $? -eq 0 ]; then
        log_success "ML Service tests passed"
    else
        log_warning "ML Service tests had issues"
    fi
else
    log_warning "ML Service test script not found"
fi

cd ../..

# Step 8: Show running services
log_info "Showing running services..."
docker-compose ps

# Step 9: Show service URLs
echo ""
log_info "🌐 SERVICE URLS:"
echo "   • Kong Gateway:        http://localhost:8000"
echo "   • Auth Service:        http://localhost:3000"
echo "   • Restaurant Service:  http://localhost:3001"
echo "   • Reservations Service: http://localhost:3002"
echo "   • Menu-Order Service:  http://localhost:3003"
echo "   • ML Service:          http://localhost:3004"

echo ""
log_info "🧠 ML SERVICE ENDPOINTS:"
echo "   • Health Check:        curl -X GET http://localhost:3004/health"
echo "   • Health (Kong):       curl -X GET http://localhost:8000/ml/health"
echo "   • Predict Discount:    curl -X POST http://localhost:3004/predict/discount/details"
echo "   • Predict (Kong):      curl -X POST http://localhost:8000/ml/predict/discount/details"
echo "   • Generate Promotions: curl -X POST http://localhost:3004/generate/promotions"
echo "   • Promotions (Kong):   curl -X POST http://localhost:8000/ml/promotions/generate"

echo ""
log_info "📊 QUICK TESTS:"
echo "   # Test ML Health (Direct)"
echo "   curl -X GET http://localhost:3004/health"
echo ""
echo "   # Test ML Health (Kong)"
echo "   curl -X GET http://localhost:8000/ml/health"
echo ""
echo "   # Test ML Prediction"
echo '   curl -X POST http://localhost:3004/predict/discount/details \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '\''{"productName": "Pizza", "category": "pizza", "basePrice": 25, "rating": 4.2, "quantity": 1, "totalPrice": 25, "orderType": "dine-in", "restaurantName": "Test"}'\'''

echo ""
log_success "🎉 BUILD AND DEPLOYMENT COMPLETED!"
log_info "Use 'docker-compose logs -f ml-service' to see ML service logs"
log_info "Use 'docker-compose down' to stop all services" 