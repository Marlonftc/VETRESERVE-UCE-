# Pet Management Service

VETRESERVE-UCE

## 📌 Overview

The Pet Management Service is responsible for managing pets associated with clients in the VETRESERVE-UCE platform.

It allows authenticated CLIENT users to register pets and retrieve pets by owner.  
This service also publishes domain events when a pet is created, enabling event-driven communication with other services.

This microservice belongs to the **Client & Pet Management** domain.

---

## 🧱 Architecture & Design

- **Architecture Style:** Microservices
- **Internal Pattern:** Layered Architecture
  - API Layer (FastAPI routers)
  - Service Layer (business logic)
  - Persistence Layer (SQLAlchemy models)
- **Communication:**
  - REST API (synchronous)
  - Kafka (event streaming)
  - RabbitMQ (asynchronous messaging)
  - MQTT (real-time notifications)

---

## 📡 API Endpoints

### Pets

| Method | Endpoint              | Description                         |
|------|-----------------------|-------------------------------------|
| POST | /pets/                | Create a new pet (CLIENT only)      |
| GET  | /pets/owner/{owner_id}| List pets by owner                  |

### Health Check

| Method | Endpoint | Description |
|------|----------|-------------|
| GET  | /health  | Service health verification |

---

## 🔐 Security

- Authentication handled via JWT
- User context obtained from Auth & Identity Service
- Role-based validation (CLIENT only for pet creation)
- Stateless authorization

---

## 📦 Data Management

- **Database:** PostgreSQL
- **ORM:** SQLAlchemy
- **Entity:** Pet
- **Table:** pets

---

## 📣 Event-Driven Communication

When a pet is created, the service publishes a **PetCreated** domain event.

### Kafka
- Topic: `pet.created`
- Purpose: Event streaming and integration with downstream services
- Non-blocking behavior (business logic is not affected if Kafka is unavailable)

### RabbitMQ
- Queue-based asynchronous communication
- Used for integration with notification workflows

### MQTT
- Topic-based real-time notifications
- Used for lightweight messaging and event propagation

---

## 🧪 Testing

### Unit Testing

A  unit test is implemented to validate service availability.

- **Tested endpoint:** `/health`
- **Testing framework:** pytest
- **Client:** FastAPI TestClient

The test does **not depend on databases or external services**, ensuring isolation, reliability, and fast execution.

---

## 🔁 CI/CD Readiness

- Unit tests can be executed automatically in GitHub Actions
- Prevents deployments with broken services
- Supports continuous integration workflows

---

## 📦 Technologies & Libraries

### Core
- FastAPI
- Uvicorn
- SQLAlchemy
- psycopg2-binary
- python-dotenv
- python-jose

### Messaging
- Kafka (kafka-python)
- RabbitMQ (pika)
- MQTT (paho-mqtt)

### Testing
- pytest
- httpx
- anyio

---

## 📐 Design Principles Applied

- **Single Responsibility Principle (SRP)**  
  The service focuses exclusively on pet management.

- **Low Coupling**  
  Authentication, notifications, and automation are delegated to other services.

- **Encapsulation**  
  Business logic is isolated in the service layer.

- **Event-Driven Architecture**  
  Domain events are published without blocking core operations.

---

## 🔗 Domain Context

- **Domain:** Client & Pet Management
- **Related Services:**
  - Owner Management Service
  - Auth & Identity Service
  - Notification & Automation Services

---



