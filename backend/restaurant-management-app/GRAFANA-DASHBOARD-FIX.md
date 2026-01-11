# Fix Grafana Dashboard Provisioning

## Problema

Dashboard-ul Grafana nu apare în UI, iar logurile arată:
```
error="Dashboard title cannot be empty"
```

## Cauza

JSON-ul dashboard-ului avea un wrapper `{"dashboard": {...}}`, dar pentru Grafana provisioning, JSON-ul trebuie să fie direct obiectul dashboard, fără wrapper.

**Format greșit:**
```json
{
  "dashboard": {
    "id": null,
    "uid": "restaurant-app",
    "title": "Restaurant Management App - Monitoring",
    ...
  }
}
```

**Format corect (pentru provisioning):**
```json
{
  "id": null,
  "uid": "restaurant-app",
  "title": "Restaurant Management App - Monitoring",
  ...
}
```

## Soluție

Am eliminat wrapper-ul `{"dashboard": {...}}` din `grafana-dashboard-configmap.yaml`, lăsând doar obiectul dashboard direct.

## Verificare

După upgrade, verifică:
1. Logurile Grafana nu mai arată eroarea "Dashboard title cannot be empty"
2. Dashboard-ul apare în Grafana UI la **Dashboards** > **Browse**
3. Dashboard-ul se numește "Restaurant Management App - Monitoring"

## Upgrade

Rulează:
```powershell
cd backend\restaurant-management-app
.\scripts\install-helm-chart.ps1
```

Sau manual:
```powershell
cd backend\restaurant-management-app\helm\restaurant-app
helm upgrade restaurant-app . -n restaurant-app --set namespace.create=false
```

## După Upgrade

1. Așteaptă câteva secunde pentru ca Grafana să reîncărce dashboard-urile
2. Accesează Grafana: http://localhost:3030 (admin/admin123)
3. Mergi la **Dashboards** > **Browse**
4. Ar trebui să vezi "Restaurant Management App - Monitoring"
