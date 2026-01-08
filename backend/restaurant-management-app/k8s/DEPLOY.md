# Deploy cu kubectl - Ghid Rapid

Acest ghid explică cum să deployezi aplicația folosind resursele Kubernetes directe (fără Helm).

## Cerințe Prealabile

1. **Cluster Kubernetes local** (Kind sau Minikube)
2. **kubectl** configurat și conectat la cluster
3. **Imagini Docker** construite și încărcate în cluster

## Pasul 1: Construirea Imaginilor Docker

Înainte de deploy, construiește imaginile pentru microservicii:

```bash
cd backend/restaurant-management-app

# Build toate serviciile
docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .
docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .
docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .
docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .
```

## Pasul 2: Încărcarea Imaginilor în Cluster

### Pentru Kind:
```bash
kind load docker-image restaurant-auth-service:latest
kind load docker-image restaurant-restaurant-service:latest
kind load docker-image restaurant-reservations-service:latest
kind load docker-image restaurant-menu-order-service:latest
```

### Pentru Minikube:
```bash
# Activează docker environment-ul Minikube
eval $(minikube docker-env)

# Rebuild imaginile (sau folosește minikube image load)
docker build -f services/auth-service/Dockerfile -t restaurant-auth-service:latest .
docker build -f services/restaurant-service/Dockerfile -t restaurant-restaurant-service:latest .
docker build -f services/reservations-service/Dockerfile -t restaurant-reservations-service:latest .
docker build -f services/menu-order-service/Dockerfile -t restaurant-menu-order-service:latest .
```

## Pasul 3: Deploy

### Opțiunea A: Folosind Script-ul (Recomandat)

**Linux/Mac:**
```bash
cd backend/restaurant-management-app/k8s
chmod +x deploy.sh
./deploy.sh
```

**Windows (PowerShell):**
```powershell
cd backend\restaurant-management-app\k8s
.\deploy.ps1
```

### Opțiunea B: Comenzi Manuale

Aplică resursele în ordinea corectă:

```bash
cd backend/restaurant-management-app/k8s

# 1. Namespace
kubectl apply -f namespace.yaml

# 2. MongoDB (Secret, PVC, Deployment, Service)
kubectl apply -f mongodb/secret.yaml
kubectl apply -f mongodb/pvc.yaml
kubectl apply -f mongodb/deployment.yaml
kubectl apply -f mongodb/service.yaml

# Așteaptă MongoDB să fie ready
kubectl wait --for=condition=ready pod -l app=mongodb -n restaurant-app --timeout=120s

# 3. MongoDB Express
kubectl apply -f mongo-express/deployment.yaml
kubectl apply -f mongo-express/service.yaml

# 4. Portainer
kubectl apply -f portainer/pvc.yaml
kubectl apply -f portainer/deployment.yaml
kubectl apply -f portainer/service.yaml

# 5. Zookeeper
kubectl apply -f kafka/zookeeper-deployment.yaml
kubectl apply -f kafka/zookeeper-service.yaml

# Așteaptă Zookeeper să fie ready
kubectl wait --for=condition=ready pod -l app=zookeeper -n restaurant-app --timeout=120s

# 6. Kafka
kubectl apply -f kafka/kafka-deployment.yaml
kubectl apply -f kafka/kafka-service.yaml

# Așteaptă puțin pentru Kafka
sleep 30

# 7. ConfigMap
kubectl apply -f configmap.yaml

# 8. Microservicii
kubectl apply -f auth-service/deployment.yaml
kubectl apply -f auth-service/service.yaml

kubectl apply -f restaurant-service/deployment.yaml
kubectl apply -f restaurant-service/service.yaml

kubectl apply -f reservations-service/deployment.yaml
kubectl apply -f reservations-service/service.yaml

kubectl apply -f menu-order-service/deployment.yaml
kubectl apply -f menu-order-service/service.yaml
```

## Pasul 4: Verificare Status

```bash
# Verifică toate resursele
kubectl get all -n restaurant-app

# Verifică pod-urile
kubectl get pods -n restaurant-app

# Verifică serviciile
kubectl get svc -n restaurant-app

# Verifică logurile unui serviciu
kubectl logs -n restaurant-app deployment/auth-service

# Verifică descrierea unui pod (pentru debugging)
kubectl describe pod -n restaurant-app <pod-name>
```

## Accesare Servicii

Serviciile sunt expuse prin NodePort:

| Serviciu | NodePort | URL |
|----------|----------|-----|
| Auth Service | 30000 | http://localhost:30000 |
| Restaurant Service | 30001 | http://localhost:30001 |
| Reservations Service | 30002 | http://localhost:30002 |
| Menu Order Service | 30003 | http://localhost:30003 |
| MongoDB Express | 30081 | http://localhost:30081 |
| Portainer | 30090 | http://localhost:30090 |

**Pentru Minikube:**
```bash
# Obține IP-ul
minikube ip

# Accesează la: http://<minikube-ip>:<nodePort>
# Sau folosește port-forward:
kubectl port-forward -n restaurant-app svc/auth-service 3000:3000
```

## Ștergere Deployment

```bash
# Șterge toate resursele
kubectl delete namespace restaurant-app

# Sau șterge manual fiecare resursă
kubectl delete -f menu-order-service/
kubectl delete -f reservations-service/
kubectl delete -f restaurant-service/
kubectl delete -f auth-service/
kubectl delete -f configmap.yaml
kubectl delete -f kafka/
kubectl delete -f portainer/
kubectl delete -f mongo-express/
kubectl delete -f mongodb/
kubectl delete -f namespace.yaml
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

### Probleme cu Imagini

```bash
# Verifică dacă imaginile există în cluster (Kind)
docker images | grep restaurant

# Reîncarcă imagini în Kind
kind load docker-image restaurant-auth-service:latest
```

### Probleme cu Storage

```bash
# Verifică storage class-urile
kubectl get storageclass

# Pentru Kind, instalează local-path-provisioner
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml

# Actualizează PVC-urile să folosească local-path
# Editează k8s/mongodb/pvc.yaml și k8s/portainer/pvc.yaml
# Schimbă storageClassName: standard cu storageClassName: local-path
```

### Pod-urile rămân în Pending

```bash
# Verifică descrierea pod-ului pentru a vedea de ce nu pornește
kubectl describe pod -n restaurant-app <pod-name>

# Verifică dacă există resurse suficiente în cluster
kubectl describe nodes
```

## Note Importante

1. **Storage Class**: Asigură-te că storage class-ul din PVC-uri există în cluster
   - Pentru Kind: folosește `local-path`
   - Pentru Minikube: folosește `standard`

2. **Ordinea Deploy**: Respectă ordinea pentru a evita probleme cu dependențele

3. **Health Checks**: Serviciile au health checks configurate pe `/health` - asigură-te că endpoint-ul există

4. **Credențiale**: MongoDB folosește `admin/admin123` - pentru producție, folosește Secrets mai sigure

