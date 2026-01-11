# Monitoring Setup - Prometheus & Grafana

Acest document descrie configurația sistemului de monitorizare pentru aplicația Restaurant Management App folosind Prometheus și Grafana.

## Componente

### 1. Prometheus
- **Imagină**: `prom/prometheus:v2.48.0`
- **Port**: 9090 (interior), NodePort 30091 (exterior)
- **Storage**: 10Gi PersistentVolumeClaim
- **Retenție date**: 15 zile

### 2. Grafana
- **Imagină**: `grafana/grafana:10.3.1`
- **Port**: 3000 (interior), NodePort 30300 (exterior)
- **Credențiale default**:
  - Utilizator: `admin`
  - Parolă: `admin123`
- **Storage**: 5Gi PersistentVolumeClaim
- **Dashboard**: Pre-configurat cu panouri pentru CPU, memorie, pod status, network I/O

### 3. Metrics Server
Necesar pentru colecția de metrici Kubernetes. Vezi [METRICS-SERVER.md](k8s/METRICS-SERVER.md) pentru instrucțiuni de instalare.

## Instalare

### Pasul 1: Instalează Metrics Server

Pentru Kind:
```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

Pentru Minikube:
```bash
minikube addons enable metrics-server
```

### Pasul 2: Instalează aplicația cu Helm (include Prometheus și Grafana)

```bash
cd helm/restaurant-app
helm install restaurant-app . -n restaurant-app --create-namespace
```

Sau pentru upgrade:
```bash
helm upgrade restaurant-app . -n restaurant-app
```

### Pasul 3: Verifică statusul

```bash
# Verifică pod-urile
kubectl get pods -n restaurant-app

# Verifică serviciile
kubectl get svc -n restaurant-app

# Verifică PVC-urile
kubectl get pvc -n restaurant-app
```

## Accesare Servicii

### Prometheus

**NodePort**:
```bash
# Obține IP-ul nodului
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].value}')

# Accesează Prometheus
echo "Prometheus: http://$NODE_IP:30091"
```

**Port Forward**:
```bash
kubectl port-forward -n restaurant-app svc/prometheus 9090:9090
# Accesează: http://localhost:9090
```

**Notă**: Prometheus pe portul 9090 nu intră în conflict cu serviciile tale locale.

### Grafana

**NodePort**:
```bash
# Obține IP-ul nodului
NODE_IP=$(kubectl get nodes -o jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].value}')

# Accesează Grafana
echo "Grafana: http://$NODE_IP:30300"
```

**Port Forward** (folosește port local 3030 pentru a evita conflictul cu auth-service care rulează local pe 3000):
```bash
kubectl port-forward -n restaurant-app svc/grafana 3030:3000
# Accesează: http://localhost:3030
```

**Explicație**: 
- Grafana rulează pe portul **3000 în interiorul containerului** Kubernetes
- La port-forward, mapăm `port_local:port_container` → `3030:3000`
- Astfel accesezi Grafana pe `localhost:3030`, evitând conflictul cu auth-service care rulează local pe `localhost:3000`
- **Nu este nevoie** să schimbi porturile în cod sau configurații!

**Credențiale default**: `admin` / `admin123`

## Configurare Prometheus

Prometheus este configurat să colecteze metrici din:

1. **Prometheus însuși** - metrici interne
2. **Kubernetes API Server** - metrici API
3. **Kubernetes Nodes** - metrici de la noduri
4. **Kubernetes Pods** - pod-uri cu annotation `prometheus.io/scrape: "true"`
5. **Kubernetes Services** - servicii cu annotation `prometheus.io/scrape: "true"`
6. **Kubernetes Endpoints** - endpoint-uri cu annotation `prometheus.io/scrape: "true"`
7. **cAdvisor** - metrici de containere (CPU, memorie, network I/O)

### Annotations pentru scraping

Deployment-urile serviciilor au deja configurate annotations:
```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "<port>"
  prometheus.io/path: "/metrics"
```

## Dashboard Grafana

Dashboard-ul pre-configurat include:

1. **CPU Usage by Service** - utilizare CPU pe servicii
2. **Memory Usage by Service** - utilizare memorie pe servicii
3. **Pod Restarts** - număr de restarts pentru pod-uri
4. **Network I/O** - trafic de rețea (RX/TX)
5. **Running Pods** - statistici pod-uri în rulare
6. **Total Pods** - total pod-uri în namespace
7. **Failed Pods** - pod-uri eșuate
8. **Pending Pods** - pod-uri în așteptare
9. **Pod Status Details** - tabel cu detalii despre pod-uri

## Adăugare Metrici Custom

Pentru a adăuga metrici custom din aplicații:

1. **Expune endpoint `/metrics`** în aplicație (folosind biblioteci precum `prom-client` pentru Node.js)
2. **Adaugă annotations** în deployment (deja configurate)
3. **Verifică în Prometheus** că target-ul apare în Status > Targets
4. **Creează panouri noi** în Grafana folosind metricile expuse

### Exemplu pentru NestJS:

```typescript
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
})
```

## Troubleshooting

### Prometheus nu colectează metrici

1. Verifică că Metrics Server rulează:
   ```bash
   kubectl get deployment metrics-server -n kube-system
   ```

2. Verifică target-urile în Prometheus:
   - Accesează Prometheus UI
   - Navighează la Status > Targets
   - Verifică statusul target-urilor

3. Verifică annotations pe pod-uri:
   ```bash
   kubectl get pod <pod-name> -n restaurant-app -o yaml | grep prometheus.io
   ```

4. Verifică logs Prometheus:
   ```bash
   kubectl logs -n restaurant-app deployment/prometheus
   ```

### Grafana nu afișează date

1. Verifică conectivitatea la Prometheus:
   - În Grafana, mergi la Configuration > Data Sources
   - Testează conexiunea la Prometheus

2. Verifică că Prometheus colectează metrici:
   - În Prometheus UI, verifică că există metrici în Graph > Metrics

3. Verifică logs Grafana:
   ```bash
   kubectl logs -n restaurant-app deployment/grafana
   ```

### Probleme cu PVC

Dacă PVC-urile nu se creează (mai ales în Kind):

1. Verifică StorageClass:
   ```bash
   kubectl get storageclass
   ```

2. Pentru Kind, folosește `local-path`:
   ```bash
   # Instalează local-path-provisioner
   kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml
   
   # Setează ca default
   kubectl patch storageclass local-path -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
   ```

3. Actualizează `values.yaml` pentru a folosi `local-path`:
   ```yaml
   prometheus:
     storage:
       storageClass: local-path
   grafana:
     storage:
       storageClass: local-path
   ```

## Dezinstalare

```bash
helm uninstall restaurant-app -n restaurant-app
```

**Notă**: PVC-urile nu sunt șterse automat. Pentru ștergere:
```bash
kubectl delete pvc prometheus-storage grafana-storage -n restaurant-app
```

## Referințe

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Kubernetes Metrics Server](https://github.com/kubernetes-sigs/metrics-server)

