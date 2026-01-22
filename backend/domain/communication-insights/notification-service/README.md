# Notification Service

## VETRESERVE-UCE

---

## 📌 Overview

The **Notification Service** is responsible for handling asynchronous notifications within the **VETRESERVE-UCE** platform.

This microservice listens to domain events emitted by other services and processes them to generate notifications. It stores notifications temporarily and forwards them to internal messaging systems for further delivery or processing.

The service follows an **event-driven architecture** and operates primarily as a background worker, exposing only a health endpoint for monitoring purposes.

---

## 🧱 Architecture & Design

- **Architecture Style:** Microservices  
- **Design Pattern:** Event-Driven + Worker-based Processing  
- **Communication:** MQTT, Redis, RabbitMQ  
- **Coupling:** Low coupling through asynchronous messaging  
- **Responsibility Scope:** Notification handling only  

The service does not expose business APIs and does not manage synchronous client requests.

---

## 🔁 Event Flow

1. The service subscribes to domain events via **MQTT**
2. Incoming events are processed by a background worker
3. Notifications are stored temporarily in **Redis** (TTL-based)
4. Notifications are published internally to **RabbitMQ** for downstream consumers

This design ensures reliability, scalability, and decoupled communication between services.

---

## 📡 API Endpoints

### Health Check

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/health` | Service health verification |

---

## 🔐 Security

- No direct user authentication required
- Service operates in a trusted internal network
- Communication secured at the infrastructure and broker level
- No sensitive data exposed via HTTP endpoints

---

## 🧠 Business Rules

- Only supported domain events are processed
- Unsupported or unknown events are ignored
- Notifications are generated per event
- Notifications stored in Redis have a limited TTL
- Message publishing failures do not block event consumption

---

## 🧪 Testing

### Unit Testing

A basic unit test is implemented to validate service availability.

- **Tested endpoint:** `/health`
- **Testing framework:** pytest
- **Client:** FastAPI TestClient

The test is fully isolated and does not require:
- MQTT broker
- Redis instance
- RabbitMQ broker

This ensures safe execution during CI/CD pipelines.

---

## 🔁 CI/CD Readiness

- Health test integrated for CI validation
- Service can be deployed independently
- Suitable for QA and PROD isolated environments

---

## 📦 Technologies & Libraries

### Core
- FastAPI
- Uvicorn
- Python

### Messaging & Infrastructure
- paho-mqtt
- Redis
- RabbitMQ (pika)

### Testing
- pytest
- FastAPI TestClient

---

## 📐 Design Principles Applied

- **Single Responsibility Principle (SRP)**  
- **Low Coupling**  
- **Event-Driven Design**  
- **Encapsulation**  

The service focuses exclusively on notification processing and delegates delivery and presentation to downstream systems.

---

## 🔗 Domain Context

- **Domain:** Communication & Insights  
- **Related Services:**
  - Client & Pet Management
  - Scheduling & Appointments
  - Reporting & Analytics

The Notification Service enables asynchronous communication across the platform.

---


