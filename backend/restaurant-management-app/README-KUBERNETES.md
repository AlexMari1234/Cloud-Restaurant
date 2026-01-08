# Restaurant Management App - Kubernetes Deployment Guide

Acest ghid explică cum să deployezi aplicația Restaurant Management pe un cluster Kubernetes local (Kind sau Minikube).

## Cerințe

- Kubernetes cluster local (Kind sau Minikube)
- `kubectl` instalat și configurat
- `helm` v3+ instalat
- `docker` instalat (pentru build imagini)

## Structură Proiect

```
backend/restaurant-management-app/
├── k8s/                    # Resurse Kubernetes directe (fără Helm)
│   ├── namespace.yaml
│   ├── mongodb/
│   ├── mongo-express/
│   ├── portainer/
│   ├── kafka/
│   ├── auth-service/
│   ├── restaurant-service/
│   ├── reservations-service/
│   └── menu-order-service/
└── helm/                   # Helm chart
    └── restaurant-app/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
```

## Opțiunea 1: Deploy cu Helm (Recomandat)

### Pasul 1: Construirea Imaginilor Docker

Înainte de deploy, trebuie să construiești imaginile Docker pentru microservicii:

```bash
cd backend/restaurant-management-app

# Build auth-service
docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .

# Build restaurant-service
docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .

# Build reservations-service
docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .

# Build menu-order-service
docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .
```

### Pasul 2: Încărcarea Imaginilor în Cluster

**Pentru Kind:**
```bash
kind load docker-image restaurant-auth-service:latest
kind load docker-image restaurant-restaurant-service:latest
kind load docker-image restaurant-reservations-service:latest
kind load docker-image restaurant-menu-order-service:latest
```

**Pentru Minikube:**
```bash
eval $(minikube docker-env)
# Apoi rebuild imaginile sau folosește minikube image load
```

### Pasul 3: Configurarea Storage Class

Verifică storage class-ul disponibil în cluster:

```bash
kubectl get storageclass
```

Pentru **Kind**, folosește `local-path`:
```bash
# Instalează local-path-provisioner dacă nu există
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml
```

Actualizează `helm/restaurant-app/values.yaml`:
```yaml
mongodb:
  storage:
    storageClass: local-path  # sau standard pentru Minikube
```

### Pasul 4: Instalarea cu Helm

```bash
cd helm/restaurant-app

# Instalează aplicația
helm install restaurant-app . --namespace restaurant-app --create-namespace

# Verifică statusul
helm status restaurant-app --namespace restaurant-app

# Listează toate resursele
kubectl get all -n restaurant-app
```

### Pasul 5: Upgrade și Dezinstalare

```bash
# Upgrade aplicația (după modificări în values.yaml)
helm upgrade restaurant-app . --namespace restaurant-app

# Dezinstalează aplicația
helm uninstall restaurant-app --namespace restaurant-app
```

## Opțiunea 2: Deploy Direct cu kubectl

Dacă preferi să folosești resursele Kubernetes directe (fără Helm):

```bash
cd backend/restaurant-management-app/k8s

# Aplică toate resursele
kubectl apply -f namespace.yaml
kubectl apply -f mongodb/
kubectl apply -f mongo-express/
kubectl apply -f portainer/
kubectl apply -f kafka/
kubectl apply -f configmap.yaml
kubectl apply -f auth-service/
kubectl apply -f restaurant-service/
kubectl apply -f reservations-service/
kubectl apply -f menu-order-service/

# Verifică statusul
kubectl get all -n restaurant-app
```

## Accesare Servicii

După deploy, serviciile sunt accesibile prin NodePort:

| Serviciu | Port Intern | NodePort | URL |
|----------|-------------|----------|-----|
| Auth Service | 3000 | 30000 | http://localhost:30000 |
| Restaurant Service | 3001 | 30001 | http://localhost:30001 |
| Reservations Service | 3002 | 30002 | http://localhost:30002 |
| Menu Order Service | 3003 | 30003 | http://localhost:30003 |
| MongoDB Express | 8081 | 30081 | http://localhost:30081 |
| Portainer | 9000 | 30090 | http://localhost:30090 |

**Pentru Minikube:**
```bash
# Obține IP-ul clusterului
minikube ip

# Accesează serviciile la: http://<minikube-ip>:<nodePort>
```

**Pentru Kind:**
```bash
# Obține IP-ul clusterului
kubectl get nodes -o wide

# Accesează serviciile la: http://<node-ip>:<nodePort>
# Sau folosește port-forward:
kubectl port-forward -n restaurant-app svc/auth-service 3000:3000
```

## Credențiale

- **MongoDB:**
  - Username: `admin`
  - Password: `admin123`
  
- **MongoDB Express:**
  - Username: `admin`
  - Password: `admin123`

- **Portainer:**
  - Creează cont la prima accesare

## Verificare Status

```bash
# Verifică toate pod-urile
kubectl get pods -n restaurant-app

# Verifică logurile unui serviciu
kubectl logs -n restaurant-app deployment/auth-service

# Verifică descrierea unui pod
kubectl describe pod -n restaurant-app <pod-name>

# Verifică serviciile
kubectl get svc -n restaurant-app

# Verifică volume-urile persistente
kubectl get pvc -n restaurant-app
```

## Troubleshooting

### Pod-urile nu pornesc

```bash
# Verifică evenimentele
kubectl get events -n restaurant-app --sort-by='.lastTimestamp'

# Verifică logurile
kubectl logs -n restaurant-app <pod-name>

# Verifică descrierea pod-ului
kubectl describe pod -n restaurant-app <pod-name>
```

### Probleme cu Storage

```bash
# Verifică storage class-urile disponibile
kubectl get storageclass

# Verifică PVC-urile
kubectl get pvc -n restaurant-app

# Verifică PV-urile
kubectl get pv
```

### Probleme cu Imagini

```bash
# Verifică dacă imaginile sunt în cluster (Kind)
docker images | grep restaurant

# Reîncarcă imagini în Kind
kind load docker-image restaurant-auth-service:latest
```

## Monitorizare

Pentru monitorizare cu Prometheus și Grafana, vezi secțiunea de monitorizare din documentația proiectului.

## Next Steps

1. Configurează Ingress pentru acces extern
2. Adaugă Prometheus și Grafana pentru monitorizare
3. Configurează autoscaling (HPA)
4. Adaugă logging (Loki)
5. Configurează CI/CD pentru deploy automat

## Note Importante

- Asigură-te că storage class-ul este configurat corect pentru cluster-ul tău
- Pentru producție, folosește Secrets mai sigure
- Consideră folosirea Ingress în loc de NodePort pentru producție
- Configurează resource limits potrivite pentru fiecare serviciu

