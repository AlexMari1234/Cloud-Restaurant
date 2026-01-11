# Metrics Server Installation Guide

Metrics Server este necesar pentru ca Prometheus să poată colecta metrici Kubernetes standard (CPU și memorie pentru noduri și poduri).

## Instalare pentru Kind

Pentru Kind, Metrics Server necesită configurații speciale:

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

Apoi editează deployment-ul pentru a adăuga flag-ul `--kubelet-insecure-tls`:

```bash
kubectl patch deployment metrics-server -n kube-system --type='json' -p='[{"op": "add", "path": "/spec/template/spec/containers/0/args/-", "value": "--kubelet-insecure-tls"}]'
```

## Instalare pentru Minikube

Pentru Minikube, Metrics Server este deja inclus, dar trebuie activat:

```bash
minikube addons enable metrics-server
```

## Verificare

După instalare, verifică că Metrics Server rulează corect:

```bash
kubectl get deployment metrics-server -n kube-system
kubectl top nodes
kubectl top pods -n restaurant-app
```

## Note

- Metrics Server colectează metrici de utilizare a resurselor la nivel de nod și pod
- Aceste metrici sunt disponibile prin API-ul Kubernetes și pot fi scrape-ate de Prometheus prin endpoint-ul `/metrics/cadvisor`
- Pentru cluster-uri de producție, asigură-te că certificatul TLS este configurat corect

