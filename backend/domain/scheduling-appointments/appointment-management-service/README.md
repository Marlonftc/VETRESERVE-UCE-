# Appointment Management Service

## VETRESERVE-UCE

---

## 📌 Overview

The **Appointment Management Service** is responsible for handling veterinary appointment scheduling within the VETRESERVE-UCE platform.

This service allows clients to create appointments with veterinarians, validates availability through an external scheduling service, enforces time conflict rules, and publishes domain events when appointments are created.

It belongs to the **Scheduling & Appointments** domain and follows an event-driven microservices architecture.

---

## 🧱 Architecture & Design

- **Architecture Style:** Microservices  
- **Design Pattern:** Layered Architecture  
- **Communication:** REST API + Event-Driven (Kafka)  
- **Coupling:** Low coupling through external service delegation  
- **Responsibility Scope:** Appointment lifecycle only  

The service does **not** manage vet schedules directly.  
Vet availability is validated through the **Vet Schedule Service**, ensuring proper domain separation.

---

## 📡 API Endpoints

### Appointments

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/appointments` | Create a new appointment (CLIENT only) |
| GET | `/appointments/vet` | Retrieve appointments for a vet (VET only) |

### Health Check

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/health` | Service health verification |

---

## 🔐 Security

- JWT-based authentication
- Role-based access control:
  - CLIENT: create appointments
  - VET: view assigned appointments
- Stateless authorization using JWT claims

---

## 🧠 Business Rules

- Only CLIENT users can create appointments
- Vet availability is validated before creation
- Overlapping appointments for the same vet are blocked
- Time conflicts are detected using range overlap rules
- Appointments are persisted only if all validations pass

---

## 📣 Event-Driven Communication

When an appointment is successfully created, the service publishes a domain event:

- **Event:** `AppointmentCreated`
- **Broker:** Kafka
- **Topic:** `appointment.created`

This enables asynchronous processing by other services such as notifications, analytics, or automation workflows.

Kafka publishing is non-blocking and does not interrupt the core business operation.

---

## 🧪 Testing

### Unit Testing

A unit test is implemented to validate service availability.

- **Tested endpoint:** `/health`
- **Testing framework:** pytest
- **Client:** FastAPI TestClient

The test is fully isolated and does not require:
- Database connections
- Kafka brokers
- External services

Environment-based configuration ensures safe execution during CI/CD pipelines.

---

## 🔁 CI/CD Readiness

- Unit tests can be executed automatically in **GitHub Actions**
- Prevents deployments when the service is unhealthy
- Supports continuous integration pipelines

---

## 📦 Technologies & Libraries

### Core
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- python-jose
- psycopg2-binary

### Messaging
- kafka-python

### HTTP & External Communication
- requests

### Testing
- pytest
- httpx
- anyio

---

## 📐 Design Principles Applied

- **Single Responsibility Principle (SRP)**  
- **Low Coupling**  
- **Encapsulation**  
- **KISS (Keep It Simple)**  

The service focuses exclusively on appointment management and delegates scheduling validation and downstream processing to other services.

---

## 🔗 Domain Context

- **Domain:** Scheduling & Appointments  
- **Related Services:**
  - Vet Schedule Service
  - Notification & Automation Services
  - Reporting & Analytics Services

---

