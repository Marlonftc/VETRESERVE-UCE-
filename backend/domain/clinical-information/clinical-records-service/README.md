# Clinical Records Service

## VETRESERVE-UCE

---

## 📌 Overview

The **Clinical Records Service** is responsible for managing veterinary clinical records within the **VETRESERVE-UCE** platform.

This microservice allows the creation, retrieval, update, and deletion of clinical records associated with pets and veterinarians. It also reacts to domain events to automatically generate records when appointments are completed.

The service follows an **event-driven microservices architecture** and belongs to the **Clinical Information** domain.

---

## 🧱 Architecture & Design

- **Architecture Style:** Microservices  
- **Design Pattern:** Layered Architecture + Event-Driven  
- **Communication:** REST API, Kafka, RabbitMQ, Webhooks (n8n)  
- **Database:** MongoDB  
- **Coupling:** Low coupling through asynchronous events  
- **Responsibility Scope:** Clinical record management only  

The service owns its data and does not depend on synchronous calls to other domains for core operations.

---

## 📡 API Endpoints

### Clinical Records

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/clinical-records` | Create a clinical record |
| GET | `/clinical-records/{record_id}` | Get a clinical record by ID |
| GET | `/clinical-records/pet/{pet_id}` | List clinical records by pet |
| PUT | `/clinical-records/{record_id}` | Update a clinical record |
| DELETE | `/clinical-records/{record_id}` | Delete a clinical record |

### Health Check

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/health` | Service health verification |

---

## 🔁 Event-Driven Behavior

### Kafka Consumer
- Listens to `AppointmentCompleted` events
- Automatically creates clinical records based on completed appointments
- Consumer runs in a background thread and is enabled via configuration

### RabbitMQ Publisher
- Publishes `ClinicalRecordCreated` events
- Enables downstream processing (notifications, analytics)

### n8n Integration
- Sends webhook notifications for automation workflows
- Includes retry mechanism for reliability

---

## 🔐 Security

- No direct authentication at this layer
- Service operates within a trusted internal network
- Security and authorization are enforced at gateway and infrastructure level

---

## 🧠 Business Rules

- Each clinical record is associated with a pet
- Records may optionally reference a veterinarian
- Records are immutable once deleted
- Event publishing is non-blocking and does not affect core operations
- Failures in messaging systems do not block record persistence

---

## 🧪 Testing

### Unit Testing

A  unit test is implemented to validate service availability.

- **Tested endpoint:** `/health`
- **Testing framework:** pytest
- **Client:** FastAPI TestClient

Tests are isolated and do not require:
- MongoDB
- Kafka brokers
- RabbitMQ
- External webhooks

This ensures safe execution during CI/CD pipelines.

---

## 🔁 CI/CD Readiness

- Health endpoint enables automated deployment validation
- Unit tests integrate cleanly with CI pipelines
- Service can be deployed independently in QA and PROD environments

---

## 📦 Technologies & Libraries

### Core
- FastAPI
- Uvicorn
- Python

### Database
- MongoDB (pymongo)

### Messaging
- Kafka (kafka-python)
- RabbitMQ (pika)

### Automation
- n8n (webhook integration)

### Testing
- pytest
- FastAPI TestClient

---

## 📐 Design Principles Applied

- **Single Responsibility Principle (SRP)**  
- **Low Coupling**  
- **High Cohesion**  
- **Event-Driven Design**  
- **Encapsulation**  

The service focuses exclusively on clinical data management and delegates communication and automation to asynchronous mechanisms.

---

## 🔗 Domain Context

- **Domain:** Clinical Information  
- **Related Services:**
  - Appointment Management Service
  - Notification Service
  - Reporting & Analytics Service

The Clinical Records Service acts as a core source of medical information within the platform.

---

