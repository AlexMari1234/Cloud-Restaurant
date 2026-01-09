# Script pentru obținere IP nod Kubernetes (pentru Kind)

$ErrorActionPreference = "Stop"

Write-Host "=== Obținere IP Nod Kubernetes ===" -ForegroundColor Green
Write-Host ""

Write-Host "Noduri în cluster:" -ForegroundColor Cyan
kubectl get nodes -o wide

Write-Host ""
Write-Host "IP-ul nodului (pentru Kind, folosește acest IP pentru NodePort):" -ForegroundColor Yellow
$nodeIP = kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}'
if ([string]::IsNullOrEmpty($nodeIP)) {
    $nodeIP = kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="ExternalIP")].address}'
}

if ([string]::IsNullOrEmpty($nodeIP)) {
    Write-Host "Nu s-a putut obține IP-ul nodului!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pentru Kind, obține IP-ul cu:" -ForegroundColor Yellow
    Write-Host "  docker inspect kind-restaurant-cluster-control-plane | Select-String -Pattern '\"IPAddress\"'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Sau folosește port-forward pentru localhost:" -ForegroundColor Yellow
    Write-Host "  .\scripts\access-services.ps1" -ForegroundColor Cyan
} else {
    Write-Host "Node IP: $nodeIP" -ForegroundColor Green
    Write-Host ""
    Write-Host "Servicii disponibile la:" -ForegroundColor Cyan
    Write-Host "  Auth Service:        http://$nodeIP`:30000" -ForegroundColor White
    Write-Host "  Restaurant Service:  http://$nodeIP`:30001" -ForegroundColor White
    Write-Host "  Reservations:        http://$nodeIP`:30002" -ForegroundColor White
    Write-Host "  Menu Order:          http://$nodeIP`:30003" -ForegroundColor White
    Write-Host "  MongoDB Express:     http://$nodeIP`:30081" -ForegroundColor White
    Write-Host "  Portainer:           http://$nodeIP`:30090" -ForegroundColor White
    Write-Host ""
    Write-Host "Pentru localhost (port-forward):" -ForegroundColor Yellow
    Write-Host "  .\scripts\access-services.ps1" -ForegroundColor Cyan
}


