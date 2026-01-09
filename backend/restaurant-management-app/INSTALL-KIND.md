# Instalare Kind pe Windows

Kind (Kubernetes in Docker) este un tool pentru rularea clusterelor Kubernetes local în containere Docker.

## ⚡ Instalare Rapidă (Script Automat)

Cel mai simplu mod este să folosești scriptul automat:

```powershell
.\scripts\install-kind.ps1
```

Scriptul va încerca:
1. Chocolatey (dacă este instalat)
2. Scoop (dacă este instalat)
3. Instalare manuală (descărcare directă)

## 📋 Metode de Instalare

### Opțiunea 1: Chocolatey (Cel mai simplu)

**Instalează Chocolatey (dacă nu îl ai):**
```powershell
# Rulează în PowerShell ca Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

**Instalează Kind:**
```powershell
choco install kind -y
```

### Opțiunea 2: Scoop

**Instalează Scoop (dacă nu îl ai):**
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

**Instalează Kind:**
```powershell
scoop install kind
```

### Opțiunea 3: Manual (Fără Package Manager)

1. **Descarcă Kind:**
   - Deschide: https://github.com/kubernetes-sigs/kind/releases/latest
   - Descarcă `kind-windows-amd64.exe`

2. **Instalează:**
   - Rename la `kind.exe`
   - Copiază în un folder din PATH (ex: `C:\Windows\System32` sau creează `%USERPROFILE%\.local\bin` și adaugă-l la PATH)

3. **Verifică:**
   ```powershell
   kind --version
   ```

### Opțiunea 4: Go Install (Pentru dezvoltatori)

```powershell
go install sigs.k8s.io/kind@latest
```

## ✅ Verificare Instalare

După instalare, verifică:

```powershell
kind --version
```

Ar trebui să vezi ceva de genul: `kind v0.20.0 go1.21.0 windows/amd64`

## 🚀 Creare Cluster

După instalare, creează cluster-ul:

```powershell
.\scripts\setup-kind-cluster.ps1
```

Sau manual:

```powershell
kind create cluster --name restaurant-cluster
```

## 🔧 Cerințe

Kind necesită:
- **Docker Desktop** instalat și rulează
- **kubectl** instalat (pentru interacțiune cu cluster-ul)

### Instalare Docker Desktop

Dacă nu ai Docker Desktop:
1. Descarcă de la: https://www.docker.com/products/docker-desktop/
2. Instalează și pornește Docker Desktop
3. Asigură-te că rulează (ar trebui să vezi iconița Docker în system tray)

### Instalare kubectl

```powershell
# Cu Chocolatey
choco install kubernetes-cli

# Sau manual
# https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
```

## 🐛 Troubleshooting

### "kind: command not found"

După instalare, reîncarcă terminalul PowerShell pentru a actualiza PATH-ul.

### "Docker is not running"

Asigură-te că Docker Desktop rulează:
```powershell
docker ps
```

Dacă nu funcționează, pornește Docker Desktop manual.

### "Cannot connect to Docker daemon"

Verifică dacă Docker Desktop este pornit și rulează corect.

## 📚 Resurse

- **Kind Documentation:** https://kind.sigs.k8s.io/
- **Quick Start:** https://kind.sigs.k8s.io/docs/user/quick-start/
- **GitHub:** https://github.com/kubernetes-sigs/kind

## 💡 Note

- Kind creează cluster-uri Kubernetes în containere Docker
- Este perfect pentru development și testing local
- Cluster-urile sunt ușor de creat și șters
- Nu necesită VM sau resurse mari

## 🎯 Pași Următori

După instalarea Kind:

1. **Creează cluster:**
   ```powershell
   .\scripts\setup-kind-cluster.ps1
   ```

2. **Verifică cluster:**
   ```powershell
   .\scripts\check-cluster.ps1
   ```

3. **Deploy aplicația:**
   ```powershell
   .\scripts\full-deploy.ps1
   ```


