# Quick Start - Monitoring (Prometheus & Grafana)

Ghid rapid pentru instalarea și utilizarea Prometheus și Grafana.

## Pașii Rapizi

### 0. Instalează Helm (dacă nu este deja instalat)

**Opțiunea 1: Script automat (recomandat)**
```powershell
cd backend\restaurant-management-app
.\scripts\install-helm.ps1
```

**Opțiunea 2: Instalare manuală**
```powershell
# Prin Chocolatey (necesită admin)
choco install kubernetes-helm

# SAU prin winget (Windows 10/11)
winget install Helm.Helm

# SAU manual: https://helm.sh/docs/intro/install/
```

**Verificare:**
```powershell
helm version --short
```

### 1. Instalează aplicația cu Helm (include Prometheus & Grafana)

```powershell
cd backend\restaurant-management-app
.\scripts\install-helm-chart.ps1
```

**Notă:** Dacă Helm nu este instalat, scriptul te va întreba dacă vrei să-l instalezi automat.

**Ce face scriptul:**
- ✅ Verifică și instalează Metrics Server (dacă e necesar)
- ✅ Build și load imagini Docker (dacă alegi)
- ✅ Instalează/Upgrade Helm chart (toate serviciile + Prometheus + Grafana)
- ✅ Așteaptă ca toate pod-urile să pornească
- ✅ Afișează informații despre accesare

### 2. Accesează serviciile (port-forward)

Într-un **terminal nou**, rulează:

```powershell
.\scripts\access-services-with-monitoring.ps1
```

**URLs disponibile:**
- **Grafana**: http://localhost:3030 (admin/admin123) ⭐
- **Prometheus**: http://localhost:9090 ⭐
- Auth Service: http://localhost:4000
- Restaurant Service: http://localhost:4001
- Reservations: http://localhost:4002
- Menu Order: http://localhost:4003

### 3. Verifică că totul funcționează

#### Verifică pod-urile:
```powershell
kubectl get pods -n restaurant-app
```

Ar trebui să vezi:
- ✅ prometheus-xxx (Running)
- ✅ grafana-xxx (Running)
- ✅ auth-service-xxx (Running)
- ✅ restaurant-service-xxx (Running)
- ✅ reservations-service-xxx (Running)
- ✅ menu-order-service-xxx (Running)
- ✅ mongodb-xxx (Running)
- ✅ etc.

#### Verifică serviciile:
```powershell
kubectl get svc -n restaurant-app
```

#### Verifică Prometheus targets:
1. Accesează http://localhost:9090
2. Mergi la **Status** > **Targets**
3. Verifică că target-urile sunt **UP**

#### Verifică Grafana:
1. Accesează http://localhost:3030
2. Login: `admin` / `admin123`
3. Mergi la **Dashboards** > **Browse**
4. Ar trebui să vezi dashboard-ul "Restaurant Management App - Monitoring"

## Troubleshooting Rapid

### Pod-urile Prometheus/Grafana nu pornesc

```powershell
# Verifică logs
kubectl logs -n restaurant-app deployment/prometheus
kubectl logs -n restaurant-app deployment/grafana

# Verifică PVC-urile
kubectl get pvc -n restaurant-app

# Dacă PVC-urile sunt în Pending (în Kind), verifică StorageClass:
kubectl get storageclass
# Ar trebui să existe un storageclass default
```

### Metrics Server nu este instalat

```powershell
# Instalează manual
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Pentru Kind, adaugă flag-ul insecure:
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

### Grafana nu se conectează la Prometheus

1. În Grafana, mergi la **Configuration** > **Data Sources**
2. Click pe **Prometheus**
3. Verifică URL: `http://prometheus:9090`
4. Click **Save & Test**
5. Ar trebui să vezi "Data source is working"

### Nu apar metrici în Grafana

1. Verifică că Prometheus colectează metrici:
   - Accesează http://localhost:9090
   - Mergi la **Graph**
   - Încearcă query: `up{namespace="restaurant-app"}`

2. Verifică că aplicațiile au annotations:
```powershell
kubectl get pod -n restaurant-app <pod-name> -o yaml | grep prometheus.io
```

Ar trebui să vezi:
```yaml
prometheus.io/scrape: "true"
prometheus.io/port: "3000"
prometheus.io/path: "/metrics"
```

## Comenzi Utile

### Upgrade Helm chart (după modificări)
```powershell
cd helm\restaurant-app
helm upgrade restaurant-app . -n restaurant-app
```

### Ștergere completă
```powershell
helm uninstall restaurant-app -n restaurant-app
kubectl delete namespace restaurant-app
```

### Restart Prometheus/Grafana
```powershell
kubectl rollout restart deployment/prometheus -n restaurant-app
kubectl rollout restart deployment/grafana -n restaurant-app
```

## Next Steps

1. **Explorează dashboard-ul Grafana** - vezi metrici în timp real
2. **Configurează alerts** (opțional) - în Prometheus sau Grafana
3. **Adaugă metrici custom** - în aplicațiile tale (vezi MONITORING.md)
4. **Personalizează dashboard-ul** - adaugă panouri noi în Grafana

## Documentație Completă

- `MONITORING.md` - Documentație detaliată
- `k8s/METRICS-SERVER.md` - Detalii despre Metrics Server
- `scripts/README.md` - Toate scripturile disponibile

