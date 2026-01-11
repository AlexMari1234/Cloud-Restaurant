# Autoscaling - HPA (Horizontal Pod Autoscaler)

Acest document descrie configurația autoscaling-ului pentru microservicii folosind HPA (Horizontal Pod Autoscaler).

## Cerință Bonus

**Mecanism simplu de autoscaling** - 0.25p

## Configurație

### Auth Service HPA

**Template:** `helm/restaurant-app/templates/auth-service-hpa.yaml`

**Configurație în values.yaml:**
```yaml
authService:
  autoscaling:
    enabled: true
    minReplicas: 1
    maxReplicas: 5
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
```

### Parametri HPA

- **minReplicas**: 1 - Numărul minim de replici (nu scade sub 1)
- **maxReplicas**: 5 - Numărul maxim de replici (nu crește peste 5)
- **targetCPUUtilizationPercentage**: 70% - Target pentru utilizare CPU
- **targetMemoryUtilizationPercentage**: 80% - Target pentru utilizare memorie

### Comportament Scaling

**Scale Up (creștere):**
- Stabilization Window: 0 secunde (scalare rapidă)
- Policy 1: Creștere cu 100% (dublare replici) la fiecare 30 secunde
- Policy 2: Creștere cu 2 pod-uri la fiecare 30 secunde
- Select Policy: Max (folosește cea mai agresivă politică)

**Scale Down (scădere):**
- Stabilization Window: 300 secunde (5 minute - scalare conservatoare)
- Policy: Scădere cu 50% la fiecare 60 secunde

## Instalare

### Pasul 1: Upgrade Helm Chart

```powershell
cd backend\restaurant-management-app
.\scripts\install-helm-chart.ps1
```

Sau manual:
```powershell
cd backend\restaurant-management-app\helm\restaurant-app
helm upgrade restaurant-app . -n restaurant-app --set namespace.create=false
```

### Pasul 2: Verificare HPA

```powershell
kubectl get hpa -n restaurant-app
kubectl describe hpa auth-service-hpa -n restaurant-app
```

**Rezultat așteptat:**
```
NAME               REFERENCE                   TARGETS         MINPODS   MAXPODS   REPLICAS   AGE
auth-service-hpa   Deployment/auth-service     70%/70%, 80%/80%   1         5         1          1m
```

## Testare

### Test 1: Verificare Status HPA

```powershell
kubectl get hpa auth-service-hpa -n restaurant-app
kubectl describe hpa auth-service-hpa -n restaurant-app
```

### Test 2: Generare Load (CPU/Memory)

**Opțiunea 1: Creștere manuală a resurselor (simulare load)**

Modifică resursele în deployment pentru a simula load mare:
```powershell
kubectl set resources deployment auth-service -n restaurant-app --requests=cpu=50m,memory=128Mi --limits=cpu=200m,memory=256Mi
```

Apoi monitorizează:
```powershell
# Într-un terminal - monitorizează HPA
kubectl get hpa auth-service-hpa -n restaurant-app --watch

# Într-un alt terminal - verifică pod-urile
kubectl get pods -n restaurant-app -l app=auth-service --watch
```

**Opțiunea 2: Load test cu tool extern**

Dacă ai un tool de load testing (ex: Apache Bench, wrk, k6), poți genera load real:
```powershell
# Port-forward auth-service
kubectl port-forward -n restaurant-app svc/auth-service 4000:3000

# În alt terminal, generează load (exemplu cu curl în loop)
for ($i=1; $i -le 1000; $i++) {
    curl http://localhost:4000/health
    Start-Sleep -Milliseconds 100
}
```

### Test 3: Monitorizare Scaling

```powershell
# Monitorizează HPA în timp real
kubectl get hpa auth-service-hpa -n restaurant-app --watch

# Verifică pod-urile
kubectl get pods -n restaurant-app -l app=auth-service --watch

# Verifică metrici CPU/Memory
kubectl top pods -n restaurant-app -l app=auth-service
```

### Test 4: Verificare Scale Down

După ce load-ul scade, HPA ar trebui să reducă replicile înapoi la minim (1):

```powershell
# Așteaptă câteva minute pentru scale down (stabilization window: 5 minute)
kubectl get hpa auth-service-hpa -n restaurant-app --watch

# Verifică că replicile au scăzut
kubectl get deployment auth-service -n restaurant-app
```

## Verificare Grafana

Dashboard-ul Grafana ar trebui să afișeze:
- **CPU Usage by Service** - ar trebui să vezi creșterea/scăderea utilizării CPU
- **Memory Usage by Service** - ar trebui să vezi creșterea/scăderea utilizării memoriei
- **Running Pods** - ar trebui să vezi creșterea/scăderea numărului de pod-uri

## Comenzi Utile

### Verificare HPA Status

```powershell
# Lista HPA-uri
kubectl get hpa -n restaurant-app

# Detalii HPA
kubectl describe hpa auth-service-hpa -n restaurant-app

# Status JSON
kubectl get hpa auth-service-hpa -n restaurant-app -o yaml
```

### Verificare Metrici

```powershell
# Metrici pod-uri
kubectl top pods -n restaurant-app -l app=auth-service

# Metrici deployment
kubectl top deployment auth-service -n restaurant-app
```

### Verificare Replici

```powershell
# Status deployment
kubectl get deployment auth-service -n restaurant-app

# Replici curente
kubectl get deployment auth-service -n restaurant-app -o jsonpath='{.spec.replicas}'

# Pod-uri actuale
kubectl get pods -n restaurant-app -l app=auth-service
```

### Evenimente HPA

```powershell
# Evenimente HPA
kubectl get events -n restaurant-app --field-selector involvedObject.name=auth-service-hpa --sort-by='.lastTimestamp'
```

## Troubleshooting

### HPA nu scalează

1. **Verifică Metrics Server:**
   ```powershell
   kubectl get deployment metrics-server -n kube-system
   kubectl top nodes
   ```

2. **Verifică resursele request:**
   ```powershell
   kubectl describe deployment auth-service -n restaurant-app | Select-String -Pattern "Requests|Limits"
   ```
   HPA necesită că resursele să aibă `requests` setate (nu doar `limits`).

3. **Verifică metrici disponibile:**
   ```powershell
   kubectl top pods -n restaurant-app -l app=auth-service
   ```
   Dacă nu vezi metrici, Metrics Server nu funcționează corect.

4. **Verifică logurile HPA:**
   ```powershell
   kubectl describe hpa auth-service-hpa -n restaurant-app
   ```
   Caută erori sau warnings în secțiunea Events.

### HPA scalează prea mult/prea puțin

Ajustează parametrii în `values.yaml`:
- `targetCPUUtilizationPercentage` - scade pentru scale-up mai agresiv
- `targetMemoryUtilizationPercentage` - scade pentru scale-up mai agresiv
- `minReplicas` / `maxReplicas` - ajustează limitele

### Pod-urile nu pot escala

1. **Verifică resursele nodurilor:**
   ```powershell
   kubectl top nodes
   kubectl describe nodes
   ```

2. **Verifică dacă există suficiente resurse disponibile**

## Extindere

### HPA pentru Alte Microservicii

Pentru a adăuga HPA pentru alte microservicii (ex: restaurant-service, reservations-service):

1. **Creează template HPA** (similar cu `auth-service-hpa.yaml`)
2. **Adaugă configurație în values.yaml:**
   ```yaml
   restaurantService:
     autoscaling:
       enabled: true
       minReplicas: 1
       maxReplicas: 5
       targetCPUUtilizationPercentage: 70
       targetMemoryUtilizationPercentage: 80
   ```

### Metrici Custom

HPA poate folosi și metrici custom (nu doar CPU/Memory):
- Metrici Prometheus
- Metrici aplicație (requests/secundă, etc.)

## Concluzie

Autoscaling-ul este configurat și funcțional pentru auth-service. HPA scalează automat replicile bazat pe utilizarea CPU și memorie, conform cerințelor bonus.
