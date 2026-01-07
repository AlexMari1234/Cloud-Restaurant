# Build and Test Script pentru Restaurant Management App cu ML Service
# PowerShell Version pentru Windows
# Autor: System

param(
    [switch]$SkipTests,
    [switch]$CleanOnly,
    [switch]$Help
)

# Colors pentru PowerShell
$Red = [ConsoleColor]::Red
$Green = [ConsoleColor]::Green
$Yellow = [ConsoleColor]::Yellow
$Blue = [ConsoleColor]::Blue
$White = [ConsoleColor]::White

function Write-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor $Blue
}

function Write-Success($message) {
    Write-Host "✅ $message" -ForegroundColor $Green
}

function Write-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor $Yellow
}

function Write-Error($message) {
    Write-Host "❌ $message" -ForegroundColor $Red
}

if ($Help) {
    Write-Host "🚀 RESTAURANT MANAGEMENT APP - BUILD & TEST" -ForegroundColor $Blue
    Write-Host "=============================================="
    Write-Host ""
    Write-Host "Usage: .\build-and-test.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -SkipTests    Skip running tests after build"
    Write-Host "  -CleanOnly    Only clean up containers and exit"
    Write-Host "  -Help         Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\build-and-test.ps1                 # Full build and test"
    Write-Host "  .\build-and-test.ps1 -SkipTests      # Build only"
    Write-Host "  .\build-and-test.ps1 -CleanOnly      # Clean only"
    exit 0
}

Write-Host "🚀 RESTAURANT MANAGEMENT APP - BUILD & TEST" -ForegroundColor $Blue
Write-Host "=============================================="

# Step 1: Check prerequisites
Write-Info "Checking prerequisites..."

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH"
    exit 1
}

if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Error "Docker Compose is not installed or not in PATH"
    exit 1
}

Write-Success "Prerequisites OK"

# Step 2: Clean up previous containers
Write-Info "Cleaning up previous containers..."
try {
    docker-compose down --remove-orphans --volumes 2>$null
    docker system prune -f 2>$null
    Write-Success "Cleanup completed"
} catch {
    Write-Warning "Some cleanup commands failed, continuing..."
}

if ($CleanOnly) {
    Write-Success "Cleanup completed. Exiting as requested."
    exit 0
}

# Step 3: Build all services
Write-Info "Building all services..."
$buildResult = docker-compose build --no-cache
if ($LASTEXITCODE -eq 0) {
    Write-Success "All services built successfully"
} else {
    Write-Error "Build failed"
    exit 1
}

# Step 4: Start services
Write-Info "Starting services..."
$startResult = docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Success "Services started successfully"
} else {
    Write-Error "Failed to start services"
    exit 1
}

# Step 5: Wait for services to be ready
Write-Info "Waiting for services to be ready..."
Start-Sleep -Seconds 30

# Check service health
$services = @(
    @{Name="auth-service"; Port=3000},
    @{Name="restaurant-service"; Port=3001},
    @{Name="reservations-service"; Port=3002},
    @{Name="menu-order-service"; Port=3003},
    @{Name="ml-service"; Port=3004}
)

foreach ($service in $services) {
    Write-Info "Checking $($service.Name) on port $($service.Port)..."
    
    $healthy = $false
    for ($i = 1; $i -le 10; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)/health" -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -eq 200) {
                Write-Success "$($service.Name) is healthy"
                $healthy = $true
                break
            }
        } catch {
            if ($i -eq 10) {
                Write-Warning "$($service.Name) health check failed after 10 attempts"
            } else {
                Start-Sleep -Seconds 3
            }
        }
    }
}

# Step 6: Check Kong Gateway
Write-Info "Checking Kong Gateway..."
$kongHealthy = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Success "Kong Gateway is ready"
            $kongHealthy = $true
            break
        }
    } catch {
        if ($i -eq 10) {
            Write-Warning "Kong Gateway health check failed"
        } else {
            Start-Sleep -Seconds 3
        }
    }
}

# Step 7: Test ML Service specifically
if (-not $SkipTests) {
    Write-Info "Testing ML Service..."
    
    Push-Location "services\ml-service"
    
    if (Test-Path "docker-test.py") {
        Write-Info "Running ML Service Docker tests..."
        try {
            python docker-test.py
            if ($LASTEXITCODE -eq 0) {
                Write-Success "ML Service tests passed"
            } else {
                Write-Warning "ML Service tests had issues"
            }
        } catch {
            Write-Warning "Failed to run ML Service tests: $($_.Exception.Message)"
        }
    } else {
        Write-Warning "ML Service test script not found"
    }
    
    Pop-Location
}

# Step 8: Show running services
Write-Info "Showing running services..."
docker-compose ps

# Step 9: Show service URLs
Write-Host ""
Write-Info "🌐 SERVICE URLS:"
Write-Host "   • Kong Gateway:        http://localhost:8000"
Write-Host "   • Auth Service:        http://localhost:3000"
Write-Host "   • Restaurant Service:  http://localhost:3001"
Write-Host "   • Reservations Service: http://localhost:3002"
Write-Host "   • Menu-Order Service:  http://localhost:3003"
Write-Host "   • ML Service:          http://localhost:3004"

Write-Host ""
Write-Info "🧠 ML SERVICE ENDPOINTS:"
Write-Host "   • Health Check:        curl -X GET http://localhost:3004/health"
Write-Host "   • Health (Kong):       curl -X GET http://localhost:8000/ml/health"
Write-Host "   • Predict Discount:    curl -X POST http://localhost:3004/predict/discount/details"
Write-Host "   • Predict (Kong):      curl -X POST http://localhost:8000/ml/predict/discount/details"
Write-Host "   • Generate Promotions: curl -X POST http://localhost:3004/generate/promotions"
Write-Host "   • Promotions (Kong):   curl -X POST http://localhost:8000/ml/promotions/generate"

Write-Host ""
Write-Info "📊 QUICK TESTS:"
Write-Host "   # Test ML Health (Direct)"
Write-Host "   curl -X GET http://localhost:3004/health"
Write-Host ""
Write-Host "   # Test ML Health (Kong)"
Write-Host "   curl -X GET http://localhost:8000/ml/health"
Write-Host ""
Write-Host "   # Test ML Prediction"
Write-Host '   curl -X POST http://localhost:3004/predict/discount/details \'
Write-Host '     -H "Content-Type: application/json" \'
Write-Host '     -d "{\"productName\": \"Pizza\", \"category\": \"pizza\", \"basePrice\": 25, \"rating\": 4.2, \"quantity\": 1, \"totalPrice\": 25, \"orderType\": \"dine-in\", \"restaurantName\": \"Test\"}"'

Write-Host ""
Write-Success "🎉 BUILD AND DEPLOYMENT COMPLETED!"
Write-Info "Use 'docker-compose logs -f ml-service' to see ML service logs"
Write-Info "Use 'docker-compose down' to stop all services"
Write-Info "Use '.\build-and-test.ps1 -Help' to see all options" 