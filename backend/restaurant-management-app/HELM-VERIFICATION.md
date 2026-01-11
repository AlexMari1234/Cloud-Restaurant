# Verificare și Demonstrare Helm Chart

Acest document descrie cum să verifici și să demonstrezi că Helm chart-ul este complet și funcțional, conform cerințelor proiectului.

## Cerințe Proiect (Barem)

Conform cerințelor proiectului, Helm chart-ul trebuie să demonstreze:
- ✅ **Helm chart complet și funcțional** (instalare, upgrade, remove) - **0.6 p**
- ✅ **Sistem de monitorizare** (Prometheus + Grafana) + dashboard aplicație - **0.6 p**

## Structura Helm Chart

Verifică că există toate fișierele necesare:

```
helm/restaurant-app/
├── Chart.yaml                    # Metadata chart
├── values.yaml                   # Configurații centralizate
└── templates/
    ├── _helpers.tpl             # Funcții helper Helm
    ├── namespace.yaml           # Namespace
    ├── configmap.yaml           # ConfigMap-uri
    ├── mongodb-*.yaml           # MongoDB (Deployment, Service, PVC, Secret)
    ├── mongo-express.yaml       # Mongo Express
    ├── portainer.yaml           # Portainer
    ├── kafka.yaml               # Kafka
    ├── zookeper.yaml            # Zookeeper
    ├── auth-service.yaml        # Auth Service
    ├── restaurant-service.yaml  # Restaurant Service
    ├── reservations-service.yaml # Reservations Service
    ├── menu-order-service.yaml  # Menu Order Service
    ├── prometheus-*.yaml        # Prometheus (Deployment, Service, PVC, RBAC, ConfigMap)
    └── grafana-*.yaml           # Grafana (Deployment, Service, PVC, ConfigMap, Dashboard)
```

### Verificare Structură

```powershell
# Verifică Chart.yaml
cat helm/restaurant-app/Chart.yaml

# Verifică values.yaml
cat helm/restaurant-app/values.yaml

# Listă toate template-urile
Get-ChildItem -Path helm/restaurant-app/templates -Recurse -File
```

## 1. Instalare (Install)

### Comandă Helm

```powershell
cd backend/restaurant-management-app/helm/restaurant-app
helm install restaurant-app . -n restaurant-app --create-namespace
```

### Sau folosind scriptul automatizat

```powershell
cd backend/restaurant-management-app
.\scripts\install-helm-chart.ps1
```

### Verificare Instalare

```powershell
# Verifică release-ul Helm
helm list -n restaurant-app

# Ar trebui să vezi:
# NAME           NAMESPACE      REVISION  STATUS    CHART                APP VERSION
# restaurant-app restaurant-app 1         deployed  restaurant-app-0.1.0 1.0.0

# Verifică statusul pod-urilor
kubectl get pods -n restaurant-app

# Ar trebui să vezi toate pod-urile în Running:
# - mongodb-xxx
# - mongo-express-xxx
# - portainer-xxx
# - kafka-xxx
# - zookeeper-xxx
# - auth-service-xxx
# - restaurant-service-xxx
# - reservations-service-xxx
# - menu-order-service-xxx
# - prometheus-xxx
# - grafana-xxx

# Verifică serviciile
kubectl get svc -n restaurant-app

# Verifică PVC-urile
kubectl get pvc -n restaurant-app

# Verifică ConfigMap-urile
kubectl get configmap -n restaurant-app

# Verifică Secrets
kubectl get secret -n restaurant-app
```

### Ce să Demonstrezi Profesorului

1. **Structura chart-ului**: Arată `Chart.yaml`, `values.yaml`, și template-urile din `templates/`
2. **Parametri centralizați**: Arată că toate configurațiile sunt în `values.yaml` (imagini, porturi, volume, replici, etc.)
3. **Instalare reușită**: Rulează `helm list` și `kubectl get pods`
4. **Serviciile rulează**: Accesează serviciile prin port-forward sau NodePort

## 2. Upgrade (Update)

### Modifică o valoare în values.yaml

Exemplu: Schimbă numărul de replici pentru auth-service:

```yaml
# În values.yaml
authService:
  replicas: 2  # Schimbă de la 1 la 2
```

### Aplică upgrade-ul

```powershell
cd backend/restaurant-management-app/helm/restaurant-app
helm upgrade restaurant-app . -n restaurant-app
```

### Sau folosind scriptul automatizat

```powershell
cd backend/restaurant-management-app
.\scripts\install-helm-chart.ps1  # Scriptul detectează automat dacă există release și face upgrade
```

### Verificare Upgrade

```powershell
# Verifică revision-ul
helm list -n restaurant-app
# REVISION ar trebui să crească (ex: de la 1 la 2, la 3, etc.)

# Verifică istoricul
helm history restaurant-app -n restaurant-app

# Verifică că modificările s-au aplicat
kubectl get deployment auth-service -n restaurant-app -o jsonpath='{.spec.replicas}'
# Ar trebui să vezi noua valoare (ex: 2)

# Verifică pod-urile
kubectl get pods -n restaurant-app -l app=auth-service
# Ar trebui să vezi 2 pod-uri pentru auth-service (dacă ai setat replicas: 2)
```

### Ce să Demonstrezi Profesorului

1. **Modificare values.yaml**: Arată o modificare în `values.yaml` (ex: replici, porturi, resurse)
2. **Upgrade**: Rulează `helm upgrade`
3. **Verificare**: Arată că modificările s-au aplicat (ex: `kubectl get deployment`)
4. **Istoric**: Arată `helm history` pentru a demonstra că Helm ține istoricul versiunilor

## 3. Dezinstalare (Uninstall/Remove)

### Comandă Helm

```powershell
cd backend/restaurant-management-app/helm/restaurant-app
helm uninstall restaurant-app -n restaurant-app
```

### Sau folosind scriptul automatizat

```powershell
cd backend/restaurant-management-app
.\scripts\uninstall-helm-chart.ps1
```

### Verificare Dezinstalare

```powershell
# Verifică că release-ul nu mai există
helm list -n restaurant-app
# Nu ar trebui să vezi restaurant-app în listă

# Verifică că pod-urile au fost șterse
kubectl get pods -n restaurant-app
# Ar trebui să fie goale (sau doar pod-uri rămase dacă ai ales să păstrezi namespace-ul)

# Verifică serviciile
kubectl get svc -n restaurant-app
# Ar trebui să fie goale

# Verifică PVC-urile (dacă vrei să le ștergi manual)
kubectl get pvc -n restaurant-app
# Notă: Helm nu șterge automat PVC-urile (pentru siguranță)
```

### Ștergere Completă (Opțional)

Dacă vrei să ștergi totul, inclusiv namespace-ul și PVC-urile:

```powershell
# Șterge Helm release
helm uninstall restaurant-app -n restaurant-app

# Șterge PVC-urile (dacă vrei)
kubectl delete pvc --all -n restaurant-app

# Șterge namespace-ul (opțional)
kubectl delete namespace restaurant-app
```

### Ce să Demonstrezi Profesorului

1. **Uninstall**: Rulează `helm uninstall`
2. **Verificare**: Arată că release-ul nu mai există (`helm list`)
3. **Pod-uri șterse**: Arată că pod-urile au fost șterse (`kubectl get pods`)
4. **PVC-uri**: Explică că PVC-urile nu sunt șterse automat (pentru siguranța datelor)

## 4. Demonstrație Completă pentru Profesor

### Secvență Recomandată (15 minute)

1. **Structura Helm Chart** (2 minute)
   - Arată `Chart.yaml` și `values.yaml`
   - Explică centralizarea configurațiilor
   - Arată template-urile principale

2. **Instalare** (3 minute)
   - Rulează `.\scripts\install-helm-chart.ps1`
   - Verifică statusul cu `helm list` și `kubectl get pods`
   - Accesează un serviciu (ex: Grafana sau Portainer)

3. **Upgrade** (3 minute)
   - Modifică o valoare în `values.yaml` (ex: replici sau porturi)
   - Rulează `helm upgrade`
   - Verifică că modificările s-au aplicat

4. **Istoric și Rollback** (2 minute)
   - Arată `helm history`
   - Demonstrează rollback (opțional): `helm rollback restaurant-app <revision> -n restaurant-app`

5. **Uninstall** (2 minute)
   - Rulează `helm uninstall`
   - Verifică că totul a fost șters
   - Explică PVC-urile (nu sunt șterse automat)

6. **Monitorizare (Prometheus + Grafana)** (3 minute)
   - Accesează Grafana (http://localhost:3030)
   - Arată dashboard-ul pre-configurat
   - Arată Prometheus (http://localhost:9090)
   - Verifică targets în Prometheus

### Checklist pentru Demonstrație

- [ ] Chart.yaml complet (name, version, description)
- [ ] values.yaml cu toate configurațiile centralizate
- [ ] Templates pentru toate microserviciile
- [ ] Install funcțional (toate pod-urile Running)
- [ ] Upgrade funcțional (modificări aplicate)
- [ ] Uninstall funcțional (resursele șterse)
- [ ] Prometheus configurat și colectează metrici
- [ ] Grafana configurat cu dashboard aplicație
- [ ] Serviciile accesibile (port-forward sau NodePort)

## 5. Comenzi Utile pentru Verificare

### Helm

```powershell
# Lista release-uri
helm list -n restaurant-app

# Istoric release
helm history restaurant-app -n restaurant-app

# Status release
helm status restaurant-app -n restaurant-app

# Template render (vezi ce ar fi instalat)
helm template restaurant-app . -n restaurant-app

# Dry-run (testează fără să instaleze)
helm install restaurant-app . -n restaurant-app --dry-run --debug

# Validează chart-ul
helm lint helm/restaurant-app
```

### Kubernetes

```powershell
# Pod-uri
kubectl get pods -n restaurant-app

# Servicii
kubectl get svc -n restaurant-app

# Deployments
kubectl get deployment -n restaurant-app

# PVC-uri
kubectl get pvc -n restaurant-app

# ConfigMap-uri
kubectl get configmap -n restaurant-app

# Secrets
kubectl get secret -n restaurant-app

# Evenimente
kubectl get events -n restaurant-app --sort-by='.lastTimestamp'

# Descriere deployment
kubectl describe deployment auth-service -n restaurant-app

# Logs
kubectl logs -n restaurant-app deployment/auth-service
```

### Verificare Configurații

```powershell
# Vezi valorile din values.yaml
cat helm/restaurant-app/values.yaml

# Vezi configurația aplicată unui deployment
kubectl get deployment auth-service -n restaurant-app -o yaml

# Verifică annotations Prometheus
kubectl get pod -n restaurant-app <pod-name> -o yaml | Select-String -Pattern "prometheus.io"

# Verifică storage class
kubectl get storageclass
```

## 6. Troubleshooting pentru Demonstrație

### Helm chart nu se instalează

```powershell
# Validează chart-ul
helm lint helm/restaurant-app

# Testează cu dry-run
helm install restaurant-app . -n restaurant-app --dry-run --debug

# Verifică erorile
helm install restaurant-app . -n restaurant-app 2>&1 | Select-String -Pattern "Error"
```

### Pod-urile nu pornesc după install

```powershell
# Verifică evenimentele
kubectl get events -n restaurant-app --sort-by='.lastTimestamp'

# Verifică descrierea pod-ului
kubectl describe pod <pod-name> -n restaurant-app

# Verifică logurile
kubectl logs <pod-name> -n restaurant-app
```

### Upgrade nu aplică modificările

```powershell
# Verifică ce valori sunt folosite
helm get values restaurant-app -n restaurant-app

# Verifică istoricul
helm history restaurant-app -n restaurant-app

# Force upgrade (opțional)
helm upgrade restaurant-app . -n restaurant-app --force
```

## 7. Bonus: Rollback (Opțional)

Dacă upgrade-ul a creat probleme, poți face rollback:

```powershell
# Vezi istoricul
helm history restaurant-app -n restaurant-app

# Rollback la revision-ul anterior
helm rollback restaurant-app -n restaurant-app

# Sau rollback la un revision specific
helm rollback restaurant-app <revision-number> -n restaurant-app

# Verifică statusul după rollback
helm status restaurant-app -n restaurant-app
```

## Concluzie

Helm chart-ul este complet și funcțional dacă:
1. ✅ Structura este completă (Chart.yaml, values.yaml, templates/)
2. ✅ Install funcționează (toate pod-urile pornesc)
3. ✅ Upgrade funcționează (modificările se aplică)
4. ✅ Uninstall funcționează (resursele se șterg)
5. ✅ Prometheus și Grafana sunt configurate și funcționale
6. ✅ Dashboard-ul Grafana afișează metrici

Folosește acest document ca ghid pentru demonstrarea funcționalității Helm chart-ului în cadrul prezentării proiectului.
