# Scripts pentru Deploy Restaurant Management App

Acest folder conține scripturi PowerShell pentru build, load și deploy aplicației pe Kubernetes.

## Scripturi Disponibile

### 1. `full-deploy.ps1` ⭐ (Recomandat)
**Script complet care face totul automat:**
- Build imagini Docker
- Load imagini în cluster (Kind sau Minikube)
- Deploy toate resursele Kubernetes
- Verificare status

```powershell
.\scripts\full-deploy.ps1
```

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

### Opțiunea 1: Deploy Complet (Recomandat)
```powershell
# Un singur script face totul
.\scripts\full-deploy.ps1

# Apoi, într-un alt terminal, pentru port-forward:
.\scripts\port-forward.ps1
```

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

După deploy, serviciile sunt accesibile prin:

### NodePort (direct)
- Auth Service: `http://localhost:30000`
- Restaurant Service: `http://localhost:30001`
- Reservations: `http://localhost:30002`
- Menu Order: `http://localhost:30003`
- MongoDB Express: `http://localhost:30081`
- Portainer: `http://localhost:30090`

**Pentru Minikube:**
```powershell
minikube ip  # Obține IP-ul
# Apoi accesează: http://<minikube-ip>:30000
```

### Port-Forward (localhost:3000-3003)
```powershell
.\scripts\port-forward.ps1
```

Apoi accesează:
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


