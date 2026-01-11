# Test Autoscaling - HPA

Ghid rapid pentru testarea autoscaling-ului HPA pentru auth-service.

## Upgrade Helm Chart (Aplică HPA)

```powershell
cd backend\restaurant-management-app
.\scripts\install-helm-chart.ps1
```

## Verificare HPA

### 1. Verifică HPA este creat

```powershell
kubectl get hpa -n restaurant-app
```

**Așteptat:**
```
NAME               REFERENCE                   TARGETS           MINPODS   MAXPODS   REPLICAS   AGE
auth-service-hpa   Deployment/auth-service     <unknown>/70%     1         5         1          10s
```

### 2. Verifică detalii HPA

```powershell
kubectl describe hpa auth-service-hpa -n restaurant-app
```

**Așteptat:**
- Reference: `Deployment/auth-service`
- Min replicas: `1`
- Max replicas: `5`
- Targets: CPU 70%, Memory 80%

### 3. Verifică metrici disponibile

```powershell
kubectl top pods -n restaurant-app -l app=auth-service
```

## Test Scale Up (Simulare Load)

### Opțiunea 1: Monitorizare în timp real

```powershell
# Terminal 1: Monitorizează HPA
kubectl get hpa auth-service-hpa -n restaurant-app --watch

# Terminal 2: Monitorizează pod-urile
kubectl get pods -n restaurant-app -l app=auth-service --watch

# Terminal 3: Monitorizează metrici
while ($true) {
    kubectl top pods -n restaurant-app -l app=auth-service
    Start-Sleep -Seconds 10
}
```

### Opțiunea 2: Generare load (simplificat)

Pentru a testa autoscaling-ul fără load real, poți:

1. **Reduce resursele request pentru a simula load mai mare:**
   ```powershell
   kubectl set resources deployment auth-service -n restaurant-app --requests=cpu=50m,memory=128Mi
   ```

2. **Monitorizează scaling:**
   ```powershell
   kubectl get hpa auth-service-hpa -n restaurant-app --watch
   kubectl get pods -n restaurant-app -l app=auth-service --watch
   ```

3. **Verifică metrici:**
   ```powershell
   kubectl top pods -n restaurant-app -l app=auth-service
   ```

### Opțiunea 3: Load test real (dacă ai tool)

```powershell
# Port-forward auth-service
kubectl port-forward -n restaurant-app svc/auth-service 4000:3000

# În alt terminal, generează load (exemplu)
for ($i=1; $i -le 1000; $i++) {
    curl http://localhost:4000/health
    Start-Sleep -Milliseconds 50
}
```

## Test Scale Down

După ce load-ul scade:

1. **Monitorizează HPA:**
   ```powershell
   kubectl get hpa auth-service-hpa -n restaurant-app --watch
   ```

2. **Așteaptă 5 minute** (stabilization window pentru scale down)

3. **Verifică că replicile au scăzut:**
   ```powershell
   kubectl get deployment auth-service -n restaurant-app
   kubectl get pods -n restaurant-app -l app=auth-service
   ```

## Verificare Finală

```powershell
# HPA status
kubectl get hpa auth-service-hpa -n restaurant-app

# Deployment status
kubectl get deployment auth-service -n restaurant-app

# Pod-uri
kubectl get pods -n restaurant-app -l app=auth-service

# Metrici
kubectl top pods -n restaurant-app -l app=auth-service
```

## Rezultate Așteptate

### Înainte de load:
- Replici: 1
- CPU utilizare: < 70%
- Memory utilizare: < 80%

### În timpul load:
- Replici: 1 → 2 → 3 → ... (până la max 5)
- CPU utilizare: > 70% (cauzează scale-up)
- Memory utilizare: > 80% (cauzează scale-up)

### După load (5+ minute):
- Replici: 5 → 4 → 3 → ... → 1 (scale-down gradual)
- CPU utilizare: < 70%
- Memory utilizare: < 80%

## Troubleshooting Rapid

### HPA nu apare

```powershell
# Verifică dacă autoscaling este enabled în values.yaml
helm get values restaurant-app -n restaurant-app | Select-String -Pattern "autoscaling"
```

### HPA nu scalează

1. **Verifică Metrics Server:**
   ```powershell
   kubectl get deployment metrics-server -n kube-system
   kubectl top nodes
   ```

2. **Verifică resursele request (necesare pentru HPA):**
   ```powershell
   kubectl describe deployment auth-service -n restaurant-app | Select-String -Pattern "Requests"
   ```

3. **Verifică metrici:**
   ```powershell
   kubectl top pods -n restaurant-app -l app=auth-service
   ```
