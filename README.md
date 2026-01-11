# Cloud Restaurant Management System

A cloud-native microservices-based restaurant management application built with NestJS, MongoDB, Kafka, and Kubernetes.

## Architecture

This application follows a **microservices architecture** with the following services:

### Core Services

| Service | Port | NodePort | Description |
|---------|------|----------|-------------|
| **Auth Service** | 3000 | 30000 | User authentication and authorization |
| **Restaurant Service** | 3001 | 30001 | Restaurant management and operations |
| **Reservations Service** | 3002 | 30002 | Table reservations and booking management |
| **Menu & Order Service** | 3003 | 30003 | Menu management and order processing |

### Infrastructure Services

| Service | Port | NodePort | Description |
|---------|------|----------|-------------|
| **MongoDB** | 27017 | - | Primary database (NoSQL) |
| **Kafka** | 9092/29092 | - | Message broker for async communication |
| **Zookeeper** | 2181 | - | Kafka coordination service |
| **Mongo Express** | 8081 | 30081 | MongoDB web-based admin interface |
| **Portainer** | 9000/9443 | 30090/30443 | Kubernetes cluster management UI |

### Monitoring & Observability

| Service | Port | NodePort | Description |
|---------|------|----------|-------------|
| **Prometheus** | 9090 | 30091 | Metrics collection and monitoring |
| **Grafana** | 3000 | 30300 | Metrics visualization and dashboards |
| **Loki** | 3100 | - | Log aggregation and storage |
| **Promtail** | - | - | Log collection agent (DaemonSet) |

## Technology Stack

- **Backend Framework:** NestJS (Node.js/TypeScript)
- **Database:** MongoDB 7.0
- **Message Queue:** Apache Kafka with Zookeeper
- **Container Orchestration:** Kubernetes (Kind/Minikube)
- **Package Manager:** Helm
- **Monitoring:** Prometheus + Grafana
- **Logging:** Loki + Promtail
- **Containerization:** Docker

## Features

- **Microservices Architecture:** Independent, scalable services
- **Event-Driven Communication:** Kafka for async messaging between services
- **Horizontal Pod Autoscaling:** Auto-scaling based on CPU/Memory usage
- **Persistent Storage:** PersistentVolumeClaims for databases
- **Health Monitoring:** Prometheus metrics and Grafana dashboards
- **Centralized Logging:** Loki for log aggregation with Promtail agents
- **API Documentation:** Swagger UI available for each service

## Accessing the Application

Once deployed, access the services at:

```
http://localhost:30000  - Auth Service
http://localhost:30001  - Restaurant Service  
http://localhost:30002  - Reservations Service
http://localhost:30003  - Menu & Order Service (Swagger UI)
http://localhost:30081  - Mongo Express
http://localhost:30090  - Portainer
http://localhost:30091  - Prometheus
http://localhost:30300  - Grafana (admin/admin123)
                         Loki logs available in Grafana: Explore > Select "Loki"
```

## Application Overview

The **Cloud Restaurant Management System** is a comprehensive, enterprise-grade solution designed to handle the complete lifecycle of restaurant operations across multiple locations. Built with modern cloud-native principles, it provides real-time order processing, inventory management, and customer service capabilities.

### Core Functionalities

#### Authentication & Authorization
- **JWT-based Authentication:** Secure token-based authentication system
- **Role-Based Access Control (RBAC):** Multiple user roles (Admin, Manager, Waiter, Kitchen Staff, Driver, Customer)
- **Multi-tenant Support:** Isolated data and operations per restaurant
- **Session Management:** Token refresh and secure logout mechanisms

#### Restaurant Management
- **Multi-Restaurant Platform:** Support for restaurant chains and multiple locations
- **Restaurant Profiles:** Complete restaurant information, operating hours, and capacity
- **Staff Management:** Role assignment and permission management
- **Table Management:** Table layout, capacity, and availability tracking

#### Reservation System
- **Real-time Table Booking:** Online reservation with instant confirmation
- **Availability Management:** Automatic table allocation based on party size and time
- **Booking Modifications:** Cancel, reschedule, and modify reservations
- **Customer History:** Track customer preferences and visit history
- **Waitlist Management:** Queue system for walk-in customers

#### Menu & Order Processing
- **Dynamic Menu Management:** 
  - Multi-level category structure (main categories and subcategories)
  - Product management with images, descriptions, and pricing
  - Dietary information and allergen warnings
  - Real-time menu updates across all channels

- **Order Types:**
  - **Dine-in Orders:** Table-based ordering with batch management for courses
  - **Takeaway Orders:** Pre-order and pickup scheduling
  - **Delivery Orders:** Address management and driver assignment

- **Order Workflow:**
  - Order placement and validation
  - Kitchen acceptance and preparation tracking
  - Real-time status updates (Pending → Preparing → Ready → Served/Delivered)
  - Payment processing and receipt generation

#### Kitchen Operations
- **Order Display System:** Kitchen dashboard for incoming orders
- **Batch Processing:** Group orders by courses (appetizers, mains, desserts)
- **Priority Management:** Handle rush orders and special requests
- **Status Tracking:** Real-time updates from kitchen to service staff
- **Preparation Timing:** Coordinate multiple items for synchronized delivery

#### Delivery Management
- **Driver Assignment:** Automatic or manual driver allocation
- **Route Optimization:** Efficient delivery routing
- **Order Tracking:** Real-time GPS tracking and status updates
- **Delivery Confirmation:** Digital signatures and photo confirmation
- **Performance Metrics:** Delivery time tracking and driver ratings

#### Shopping Cart & Checkout
- **Persistent Cart:** Save items across sessions
- **Order Customization:** Modify quantities, add special instructions
- **Order Type Selection:** Switch between dine-in, takeaway, and delivery
- **Price Calculation:** Real-time total with taxes and delivery fees

#### Analytics & Reporting
- **Order Analytics:** Track order volumes, popular items, and peak times
- **Revenue Reports:** Daily, weekly, and monthly financial summaries
- **Customer Insights:** Order history, preferences, and loyalty metrics
- **Performance Monitoring:** Kitchen efficiency and delivery times
- **Inventory Tracking:** Stock levels and reorder alerts

### Event-Driven Architecture

The system uses **Apache Kafka** for asynchronous communication between services, enabling:

- **Real-time Notifications:** Instant updates to all stakeholders (customers, kitchen, waiters, drivers)
- **Order Events:** Complete audit trail of order lifecycle
- **Scalability:** Handle high-volume events without blocking
- **Reliability:** Message persistence and guaranteed delivery
- **Decoupling:** Services can evolve independently

### Technical Features

- **RESTful APIs:** Clean, documented APIs for all operations
- **Swagger Documentation:** Interactive API testing and documentation
- **Database Indexing:** Optimized queries for fast performance
- **Caching Strategy:** Redis-compatible for session and query caching
- **Error Handling:** Comprehensive error messages and logging
- **Data Validation:** Input validation with DTOs and class-validator
- **Transaction Support:** Atomic operations for critical workflows

## Key Highlights

- **Cloud-Native:** Designed for Kubernetes deployment
- **Scalable:** Horizontal auto-scaling configured for all services
- **Observable:** Complete monitoring stack with Prometheus + Grafana + Loki
- **Resilient:** Health checks and automatic pod restarts
- **Developer-Friendly:** Helm charts for easy deployment and upgrades

### Features

- **7-day retention:** Logs stored for 168 hours
- **Automatic labeling:** Namespace, pod, container, and app labels added automatically
- **Real-time streaming:** Live log tailing in Grafana
- **Full-text search:** Search across all logs with LogQL
- **Persistent storage:** 10Gi PVC for log data