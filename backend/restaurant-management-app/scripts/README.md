# Scripts pentru Deploy Restaurant Management App

Acest folder conține scripturi PowerShell pentru build, load și deploy aplicației pe Kubernetes.

## Scripturi Disponibile

### 1. `install-helm.ps1` ⭐ (NOU - Instalare Helm)
**Script pentru instalarea Helm pe Windows:**
- Detectează și instalează Helm automat (Chocolatey sau winget)
- Verifică dacă Helm este deja instalat
- Instrucțiuni pentru instalare manuală dacă e necesar

```powershell
.\scripts\install-helm.ps1
```

**Notă:** Helm este necesar pentru `install-helm-chart.ps1`. Scriptul `install-helm-chart.ps1` te va întreba automat dacă vrei să instalezi Helm dacă nu este deja instalat.

### 2. `install-helm-chart.ps1` ⭐⭐⭐ (NOU - Recomandat pentru Prometheus & Grafana)
**Script complet pentru instalare cu Helm (include Prometheus și Grafana):**
- Verifică și instalează Helm automat (dacă e necesar)
- Instalează/Upgrade Helm chart (include toate serviciile + monitoring)
- Instalează Metrics Server (dacă nu există)
- Build și load imagini Docker (opțional)
- Verificare status complet

```powershell
.\scripts\install-helm-chart.ps1
```

**Avantaje:**
- Include Prometheus și Grafana
- Gestionare simplă cu Helm
- Actualizări ușoare cu `helm upgrade`

### 3. `access-services-with-monitoring.ps1` ⭐⭐ (NOU)
**Port-forward pentru toate serviciile, inclusiv Prometheus și Grafana:**
```powershell
.\scripts\access-services-with-monitoring.ps1
```

### 4. `full-deploy.ps1` / `full-fix.ps1` (DEPRECATED pentru monitoring)
**Scripturi pentru deploy cu kubectl apply direct:**
- Build imagini Docker
- Load imagini în cluster (Kind sau Minikube)
- Deploy toate resursele Kubernetes (kubectl apply)
- Verificare status

```powershell
.\scripts\full-deploy.ps1
# sau
.\scripts\full-fix.ps1
```

**⚠️ Notă:** 
- Aceste scripturi folosesc `kubectl apply` direct pe fișierele YAML din `k8s/`
- **Nu includ Prometheus și Grafana**
- **Recomandare:** Folosește `install-helm-chart.ps1` pentru monitoring complet
- Păstrate doar pentru compatibilitate sau dacă vrei să folosești doar `kubectl apply` direct

### 2. `build-images.ps1`
**Doar build imagini Docker:**
```powershell
.\scripts\build-images.ps1
```

### 3. `load-images-kind.ps1`
**Load imagini în Kind cluster:**
```powershell
.\scripts\load-images-kind.ps1
```

### 4. `load-images-minikube.ps1`
**Build și load imagini în Minikube:**
```powershell
.\scripts\load-images-minikube.ps1
```

### 5. `port-forward.ps1`
**Port-forward pentru acces la localhost:3000-3003:**
```powershell
.\scripts\port-forward.ps1
```

## Workflow Recomandat

### Opțiunea 1: Helm Chart cu Monitoring (RECOMANDAT) ⭐⭐⭐
```powershell
# 0. (Doar dacă Helm nu este instalat) Instalează Helm
.\scripts\install-helm.ps1

# 1. Instalează/Upgrade cu Helm (include Prometheus & Grafana)
#    Înlocuiește logica din full-fix.ps1 + adaugă monitoring
.\scripts\install-helm-chart.ps1

# 2. Apoi, într-un alt terminal, pentru port-forward cu monitoring:
.\scripts\access-services-with-monitoring.ps1
```

**Acces:**
- Grafana: http://localhost:3030 (admin/admin123)
- Prometheus: http://localhost:9090
- Servicii aplicație: http://localhost:4000-4003

**Avantaje:**
- ✅ Include Prometheus & Grafana
- ✅ Gestionare simplă cu Helm (upgrade, rollback)
- ✅ Instalează Metrics Server automat
- ✅ Înlocuiește funcționalitatea din `full-fix.ps1`

### Opțiunea 2: Deploy Clasic (fără Monitoring) ⚠️ DEPRECATED
```powershell
# Un singur script face totul (kubectl apply direct)
# ⚠️ NU include Prometheus și Grafana
.\scripts\full-deploy.ps1
# sau
.\scripts\full-fix.ps1

# Apoi, într-un alt terminal, pentru port-forward:
.\scripts\access-services.ps1
```

**Notă:** Folosește doar dacă nu vrei monitoring sau dacă ai nevoie de `kubectl apply` direct.

### Opțiunea 2: Pași Manuali
```powershell
# 1. Build imagini
.\scripts\build-images.ps1

# 2. Load în cluster (alege unul)
.\scripts\load-images-kind.ps1
# SAU
.\scripts\load-images-minikube.ps1

# 3. Deploy
cd ..\k8s
.\deploy.ps1

# 4. Port-forward (opțional, pentru localhost:3000-3003)
cd ..\scripts
.\port-forward.ps1
```

## Accesare Servicii

### Cu Helm Chart (Prometheus & Grafana incluse)

**Port-Forward (Recomandat):**
```powershell
.\scripts\access-services-with-monitoring.ps1
```

**URLs:**
- **Grafana**: http://localhost:3030 (admin/admin123) ⭐
- **Prometheus**: http://localhost:9090 ⭐
- Auth Service: http://localhost:4000
- Restaurant Service: http://localhost:4001
- Reservations: http://localhost:4002
- Menu Order: http://localhost:4003
- MongoDB Express: http://localhost:8081
- Portainer: http://localhost:9000

**NodePort (direct):**
```powershell
# Obține IP-ul nodului
$NODE_IP = kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].value}'
echo "Grafana: http://$NODE_IP`:30300"
echo "Prometheus: http://$NODE_IP`:30091"
```

### Fără Helm (kubectl apply direct)

**Port-Forward:**
```powershell
.\scripts\access-services.ps1
```

**URLs:**
- Auth Service: `http://localhost:3000`
- Restaurant Service: `http://localhost:3001`
- Reservations: `http://localhost:3002`
- Menu Order: `http://localhost:3003`

## Verificare Status

```powershell
# Verifică pod-urile
kubectl get pods -n restaurant-app

# Verifică serviciile
kubectl get svc -n restaurant-app

# Verifică logurile
kubectl logs -n restaurant-app deployment/auth-service

# Verifică evenimentele
kubectl get events -n restaurant-app --sort-by='.lastTimestamp'
```

## Troubleshooting

### Imagini nu se încarcă în Kind
```powershell
# Verifică dacă Kind cluster-ul rulează
kind get clusters

# Reîncarcă imagini
.\scripts\load-images-kind.ps1
```

### Pod-urile nu pornesc
```powershell
# Verifică descrierea pod-ului
kubectl describe pod -n restaurant-app <pod-name>

# Verifică logurile
kubectl logs -n restaurant-app <pod-name>
```

### Port-forward nu funcționează
```powershell
# Verifică dacă serviciile există
kubectl get svc -n restaurant-app

# Încearcă manual
kubectl port-forward -n restaurant-app svc/auth-service 3000:3000
```


