# Owner Management Service

## VETRESERVE-UCE

---

## 📌 Overview

The Owner Management Service is responsible for managing pet owners within the VETRESERVE-UCE platform.
It allows authenticated users to create and retrieve owner records associated with their account.

This microservice belongs to the **Client & Pet Management** domain and focuses exclusively on owner-related data.

---

## 🎯 Responsibility

- Create pet owner records
- Retrieve owners list
- Retrieve owner details by ID
- Enforce role-based access control for owner creation

This service does **not** handle authentication or user identity logic.
Authentication data is provided via JWT by the API Gateway.

---

## 🧱 Architecture & Design

- **Architecture Style:** Microservices
- **Pattern:** Layered Architecture
- **Domain Isolation:** Client & Pet Management
- **Communication:** REST API
- **Coupling:** Low coupling with other services

The service follows clear separation of concerns between:
- API layer
- Service layer
- Data access layer

---

## 🔐 Security

- JWT-based authentication
- Token validated locally using shared JWT utilities
- Role-based authorization enforced at endpoint level
- Only users with role `CLIENT` can create owners

---

## 📡 API Endpoints

### Owner Management

| Method | Endpoint        | Description                     |
|------|----------------|---------------------------------|
| POST | `/owners`       | Create a new owner (CLIENT only) |
| GET  | `/owners`       | List all owners                 |
| GET  | `/owners/{id}`  | Get owner by ID                 |

### Health Check

| Method | Endpoint  | Description                  |
|------|-----------|------------------------------|
| GET  | `/health` | Service health verification  |

---

## 🧪 Unit Testing

A unit test is implemented to validate service availability.

### Test Description

- **Tested endpoint:** `/health`
- **Purpose:**
  - Verify the service starts correctly
  - Validate FastAPI routing
  - Enable CI/CD pipeline validation

### Test Characteristics

- Does not depend on databases
- Does not depend on external services
- Executes quickly and reliably
- Suitable for automated pipelines

### Test File


---

## 🔁 CI/CD Readiness

- Unit tests can be executed automatically using **GitHub Actions**
- Prevents deployments with broken services
- Ensures service availability before promotion to QA or PROD

---

## 📦 Technologies & Libraries

### Core
- FastAPI
- Uvicorn
- SQLAlchemy
- psycopg2-binary
- python-jose
- python-dotenv

### Testing
- pytest
- httpx

---

## 📐 Design Principles Applied

- **Single Responsibility Principle (SRP)**
- **Low Coupling**
- **Encapsulation**
- **KISS (Keep It Simple)**

The service focuses exclusively on owner management and delegates authentication and identity concerns to other components.

---

## 🔗 Domain Context

- **Domain:** Client & Pet Management
- **Related Services:**
  - Auth & Identity Service
  - User Management Service


