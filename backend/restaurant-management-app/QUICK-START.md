# Quick Start - Deploy pe Kubernetes

Ghid rapid pentru deploy aplicație Restaurant Management pe Kubernetes.

## ⚡ Deploy Rapid (Un singur script)

**IMPORTANT: Înainte de deploy, asigură-te că ai un cluster Kubernetes configurat!**

### Verifică cluster-ul:
```powershell
.\scripts\check-cluster.ps1
```

### Dacă nu ai cluster, creează unul:

**Pentru Kind:**
```powershell
# Instalează Kind (dacă nu este instalat)
# https://kind.sigs.k8s.io/docs/user/quick-start/

# Creează cluster
kind create cluster --name restaurant-cluster
```

**Pentru Minikube:**
```powershell
# Instalează Minikube (dacă nu este instalat)
# https://minikube.sigs.k8s.io/docs/start/

# Pornește cluster
minikube start
```

### Apoi rulează deploy:
```powershell
.\scripts\full-deploy.ps1
```

Acest script face automat:
1. ✅ Build toate imaginile Docker
2. ✅ Load imagini în cluster (Kind sau Minikube)
3. ✅ Deploy toate resursele Kubernetes
4. ✅ Verificare status

## 📋 Pași Manuali (dacă preferi)

### 1. Build Imagini
```powershell
.\scripts\build-images.ps1
```

### 2. Load în Cluster

**Pentru Kind:**
```powershell
.\scripts\load-images-kind.ps1
```

**Pentru Minikube:**
```powershell
.\scripts\load-images-minikube.ps1
```

### 3. Deploy
```powershell
cd k8s
.\deploy.ps1
```

### 4. Port-Forward (pentru localhost:3000-3003)
```powershell
cd ..\scripts
.\port-forward.ps1
```

## 🌐 Accesare Servicii

### Opțiunea 1: NodePort (direct)
- Auth Service: `http://localhost:30000`
- Restaurant Service: `http://localhost:30001`
- Reservations: `http://localhost:30002`
- Menu Order: `http://localhost:30003`
- MongoDB Express: `http://localhost:30081`
- Portainer: `http://localhost:30090`

**Pentru Minikube:**
```powershell
minikube ip  # Obține IP-ul
# Apoi: http://<minikube-ip>:30000
```

### Opțiunea 2: Port-Forward (localhost:3000-3003)
```powershell
.\scripts\port-forward.ps1
```

Apoi accesează:
- Auth Service: `http://localhost:3000`
- Restaurant Service: `http://localhost:3001`
- Reservations: `http://localhost:3002`
- Menu Order: `http://localhost:3003`

## ✅ Verificare Status

```powershell
.\scripts\check-status.ps1
```

Sau manual:
```powershell
kubectl get all -n restaurant-app
kubectl get pods -n restaurant-app
```

## 🔧 Troubleshooting

### Storage Class (pentru Kind)

Dacă folosești Kind și PVC-urile nu se creează:

```powershell
# Instalează local-path-provisioner
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml

# Actualizează PVC-urile
# Editează k8s/mongodb/pvc.yaml și k8s/portainer/pvc.yaml
# Schimbă: storageClassName: standard -> storageClassName: local-path
```

### Pod-urile nu pornesc

```powershell
# Verifică logurile
kubectl logs -n restaurant-app <pod-name>

# Verifică descrierea
kubectl describe pod -n restaurant-app <pod-name>

# Verifică evenimentele
kubectl get events -n restaurant-app --sort-by='.lastTimestamp'
```

### Imagini nu se încarcă

```powershell
# Verifică dacă imaginile există
docker images | Select-String "restaurant-"

# Reîncarcă în Kind
.\scripts\load-images-kind.ps1
```

## 🗑️ Ștergere Deployment

```powershell
kubectl delete namespace restaurant-app
```

## 📚 Documentație Completă

- `k8s/DEPLOY.md` - Ghid detaliat pentru deploy
- `scripts/README.md` - Documentație scripturi
- `README-KUBERNETES.md` - Documentație completă Kubernetes

## 🎯 Checklist Pre-Deploy

- [ ] Cluster Kubernetes rulează (Kind sau Minikube)
  - **Verifică:** `.\scripts\check-cluster.ps1`
  - **Creează Kind:** `.\scripts\setup-kind-cluster.ps1`
  - **Creează Minikube:** `.\scripts\setup-minikube-cluster.ps1`
- [ ] `kubectl` este configurat și conectat
- [ ] `docker` este instalat și rulează
- [ ] Storage class disponibil în cluster
- [ ] Porturile 30000-30003, 30081, 30090 sunt libere

## 🔧 Scripturi Utile

- `check-cluster.ps1` - Verifică dacă cluster-ul rulează
- `setup-kind-cluster.ps1` - Creează cluster Kind
- `setup-minikube-cluster.ps1` - Pornește cluster Minikube
- `full-deploy.ps1` - Deploy complet automat
- `check-status.ps1` - Verifică status deployment

## 📝 Note

- NodePort-urile sunt setate la 30000-30003 (range-ul permis în Kubernetes)
- Pentru acces la localhost:3000-3003, folosește `port-forward.ps1`
- Credențiale MongoDB: `admin/admin123`
- Credențiale MongoDB Express: `admin/admin123`

