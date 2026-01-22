# Reporting & Analytics Service

## VETRESERVE-UCE

---

## 📌 Overview

The **Reporting & Analytics Service** is responsible for collecting, aggregating, and exposing operational and domain metrics within the **VETRESERVE-UCE** platform.

This microservice provides observability capabilities using **Prometheus**, processes domain events asynchronously, and exposes analytics endpoints to support monitoring, reporting, and future insights.

It belongs to the **Communication & Insights** domain and is designed to operate in an event-driven, cloud-native environment.

---

## 🧱 Architecture & Design

- **Architecture Style:** Microservices  
- **Design Pattern:** Layered + Event-Driven  
- **Communication:** REST API, RabbitMQ  
- **Observability:** Prometheus metrics  
- **Coupling:** Low coupling through asynchronous event consumption  
- **Responsibility Scope:** Metrics and analytics only  

The service does not manage business transactions and does not expose client-facing operations.

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/health` | Service health verification |

### Metrics

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/metrics` | Prometheus scrape endpoint |

### Demo Analytics Events

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/analytics/events/clinical-record-created` | Simulate clinical record metric |
| POST | `/analytics/events/appointment-created` | Simulate appointment metric |

---

## 🔁 Event Processing

- The service consumes domain events from **RabbitMQ**
- Events are processed asynchronously in a background worker
- Domain counters are updated based on incoming messages
- Retry mechanisms prevent startup failures if RabbitMQ is not ready

This ensures resilience and non-blocking analytics processing.

---

## 🔐 Security

- No direct user authentication required
- Service operates inside a trusted internal network
- Access to metrics endpoint is controlled at infrastructure level

---

## 🧠 Business Rules

- Only supported domain events are processed
- Invalid or malformed messages are ignored safely
- Metrics are updated atomically using Prometheus counters
- Analytics processing does not interfere with core business flows

---

## 🧪 Testing

### Unit Testing

A unit test is implemented to validate service availability.

- **Tested endpoint:** `/health`
- **Testing framework:** pytest
- **Client:** FastAPI TestClient

Tests are isolated and do not require:
- RabbitMQ
- Prometheus server
- External dependencies

This guarantees CI/CD compatibility.

---

## 🔁 CI/CD Readiness

- Health endpoint enables automated deployment checks
- Metrics endpoint supports production monitoring
- Service can be deployed independently in QA and PROD environments

---

## 📦 Technologies & Libraries

### Core
- FastAPI
- Uvicorn
- Python

### Messaging
- RabbitMQ (pika)

### Observability
- Prometheus Client

### Testing
- pytest
- FastAPI TestClient

---

## 📐 Design Principles Applied

- **Single Responsibility Principle (SRP)**  
- **Low Coupling**  
- **Event-Driven Design**  
- **Encapsulation**  

The service focuses exclusively on analytics and observability, delegating business logic to other domains.

---

## 🔗 Domain Context

- **Domain:** Communication & Insights  
- **Related Services:**
  - Notification Service
  - Clinical Records Service
  - Appointment Management Service

The Reporting & Analytics Service enables platform-wide visibility and insight generation.

---

