# Plan de Migrare la Kubernetes

## Status Actual

✅ **Completat:**
- MongoDB local adăugat în docker-compose.yaml cu volum persistent
- MongoDB Express adăugat pentru gestionare DB (port 8081)
- Portainer adăugat pentru gestionare cluster (port 9000)
- Toate microserviciile modificate să suporte MongoDB local
- Conexiunile MongoDB suportă atât local cât și Atlas (backward compatible)

## Servicii Disponibile

### Microservicii Business Logic
1. **auth-service** - Port 3000
2. **restaurant-service** - Port 3001
3. **reservations-service** - Port 3002
4. **menu-order-service** - Port 3003
5. **websocket-gateway** - Port 3005

### Infrastructură
- **MongoDB** - Port 27017 (cu volume persistent)
- **MongoDB Express** - Port 8081 (UI pentru gestionare DB)
- **Portainer** - Port 9000 (UI pentru gestionare cluster)
- **Kafka** - Port 9092, 29092
- **Zookeeper** - Port 2181
- **Kong Gateway** - Port 8000, 8001

## Credențiale MongoDB

- **Username:** admin
- **Password:** admin123
- **Baze de date separate per microserviciu:**
  - `auth_db` - pentru auth-service
  - `restaurant_db` - pentru restaurant-service
  - `reservations_db` - pentru reservations-service
  - `menu_order_db` - pentru menu-order-service

**Connection Strings:**
- Auth: `mongodb://admin:admin123@mongodb:27017/auth_db?authSource=admin`
- Restaurant: `mongodb://admin:admin123@mongodb:27017/restaurant_db?authSource=admin`
- Reservations: `mongodb://admin:admin123@mongodb:27017/reservations_db?authSource=admin`
- Menu-Order: `mongodb://admin:admin123@mongodb:27017/menu_order_db?authSource=admin`

**Notă:** Fiecare microserviciu are propria bază de date pentru izolare completă și scalabilitate independentă (best practice în arhitectura microserviciilor).

## Acces Servicii

- **MongoDB Express:** http://localhost:8081 (admin/admin123)
- **Portainer:** http://localhost:9000 (crează cont la prima accesare)
- **Kong Gateway:** http://localhost:8000

## Pași Următori pentru Kubernetes

### 1. Testare Docker Compose
```bash
cd backend/restaurant-management-app
docker-compose up -d
docker-compose ps  # Verifică că toate serviciile sunt healthy
```

### 2. Creare Resurse Kubernetes

Pentru fiecare microserviciu trebuie creat:
- **Deployment** - definește pod-urile și replicile
- **Service** - expune serviciul în cluster
- **ConfigMap** - pentru configurații
- **Secret** - pentru credențiale (MongoDB, etc.)
- **PersistentVolumeClaim** - pentru MongoDB

### 3. Structură Recomandată

```
k8s/
├── namespace.yaml
├── mongodb/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── pvc.yaml
│   └── secret.yaml
├── mongo-express/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── portainer/
│   ├── deployment.yaml
│   └── service.yaml
├── auth-service/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── restaurant-service/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── reservations-service/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── menu-order-service/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── kafka/
│   ├── zookeeper-deployment.yaml
│   ├── zookeeper-service.yaml
│   ├── kafka-deployment.yaml
│   └── kafka-service.yaml
└── kong/
    ├── deployment.yaml
    └── service.yaml
```

### 4. Helm Chart

După ce toate resursele funcționează, creăm un Helm chart:
```
helm/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── _helpers.tpl
    ├── mongodb.yaml
    ├── mongo-express.yaml
    ├── portainer.yaml
    ├── auth-service.yaml
    ├── restaurant-service.yaml
    ├── reservations-service.yaml
    ├── menu-order-service.yaml
    ├── kafka.yaml
    └── kong.yaml
```

## Note Importante

1. **MongoDB URI:** Toate serviciile verifică mai întâi variabila `MONGODB_URI`. Dacă nu există, folosesc variabilele individuale (DB_HOST, DB_PORT, etc.)

2. **Network:** În Kubernetes, serviciile se comunică prin numele Service-ului (ex: `mongodb:27017`)

3. **Volumes:** MongoDB necesită PersistentVolumeClaim pentru date persistente

4. **Secrets:** Credențialele MongoDB trebuie să fie în Secrets, nu hardcodate

5. **Health Checks:** Toate serviciile au health checks configurate în docker-compose

## Comenzi Utile

```bash
# Verifică status servicii
docker-compose ps

# Verifică loguri
docker-compose logs -f [service-name]

# Oprește toate serviciile
docker-compose down

# Oprește și șterge volume-urile
docker-compose down -v

# Rebuild un serviciu
docker-compose up -d --build [service-name]
```

