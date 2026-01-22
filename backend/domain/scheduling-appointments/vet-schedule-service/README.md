# Vet Schedule Service

## VETRESERVE-UCE

---

## 📌 Overview

The **Vet Schedule Service** is responsible for managing veterinarians’ availability schedules within the **VETRESERVE-UCE** platform.

This service allows veterinarians to define their working days and time ranges and provides internal availability queries to other services, such as the **Appointment Management Service**, to support appointment validation.

It belongs to the **Scheduling & Appointments** domain and is implemented as an independent microservice following cloud-native and DevOps best practices.

---

## 🧱 Architecture & Design

- **Architecture Style:** Microservices  
- **Design Pattern:** Layered Architecture  
- **Communication:** REST API  
- **Coupling:** Low coupling through strict domain separation  
- **Responsibility Scope:** Vet availability scheduling only  

The service does **not** manage appointments or client interactions.  
Its sole responsibility is to manage veterinarian schedules and expose availability information to trusted services.

---

## 📡 API Endpoints

### Vet Schedules

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/schedules` | Create a veterinarian availability schedule (VET only) |

### Internal Availability

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/schedules/availability/internal` | Internal availability check for other services |

### Health Check

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/health` | Service health verification |

---

## 🔐 Security

- JWT-based authentication
- Role-based access control:
  - **VET** users can create schedules
- Internal availability endpoint is not publicly exposed
- Stateless authorization using JWT claims

Access control is enforced at the API layer to prevent unauthorized schedule manipulation.

---

## 🧠 Business Rules

- Only users with role **VET** can create schedules
- Veterinarians must be in **ACTIVE** status
- Schedules are defined using:
  - Day
  - Start time
  - End time
- Internal availability queries are restricted to trusted services
- Appointment conflict validation is delegated to other services

---

## 🧪 Testing

### Unit Testing

A  unit test is implemented to validate service availability.

- **Tested endpoint:** `/health`
- **Testing framework:** pytest
- **Client:** FastAPI TestClient

The test is intentionally minimal to satisfy academic requirements and is fully isolated from:
- Database connections
- External services
- Authentication mechanisms

Environment-based configuration ensures safe execution during CI/CD pipelines.

---

## 🔁 CI/CD Readiness

- Unit tests can be executed automatically in CI pipelines
- Prevents deployment of unhealthy services
- Compatible with GitHub Actions–based workflows

---

## 📦 Technologies & Libraries

### Core
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- python-jose
- psycopg2-binary

### Database
- SQLite (local / testing)
- PostgreSQL (QA / PROD)

### Testing
- pytest
- FastAPI TestClient

---

## 📐 Design Principles Applied

- **Single Responsibility Principle (SRP)**  
- **Encapsulation**  
- **Low Coupling**  
- **KISS (Keep It Simple)**  

The service focuses exclusively on veterinarian availability management and delegates appointment lifecycle handling to other services.

---

## 🔗 Domain Context

- **Domain:** Scheduling & Appointments  
- **Related Services:**
  - Appointment Management Service
  - Notification & Automation Services
  - Reporting & Analytics Services

---

