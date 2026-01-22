# User Management Service

## VETRESERVE-UCE

---

## 📌 Overview

The **User Management Service** is responsible for managing the user lifecycle within the **VETRESERVE-UCE** platform.

This microservice handles user registration, role assignment, approval workflows, and internal credential validation required by the authentication process.

It belongs to the **Identity & Access** domain and is fully isolated from business and clinical domains.

---

## 🧱 Architecture & Design

- Architecture Style: Microservices
- Design Pattern: Layered Architecture
- Communication: REST API
- Coupling: Low coupling
- Responsibility: User lifecycle management

This service does **not generate authentication tokens**.  
Authentication responsibilities are delegated to the **Auth & Identity Service**, ensuring proper separation of concerns and single responsibility.

---

## 🔐 Security Features

- Secure password hashing using bcrypt and Argon2
- Role-Based Access Control (RBAC)
- JWT role enforcement for admin-only operations
- Internal-only credential validation endpoint
- CORS policy enforcement

---

## 📡 API Endpoints

### Public Endpoints

POST `/users/register`  
Registers a new user with role CLIENT or VET.

---

### Admin Endpoints

GET `/users/vets/pending`  
Lists all pending veterinarian accounts.  
(ADMIN role required)

PUT `/users/{user_id}/approve`  
Approves a veterinarian account.  
(ADMIN role required)

---

### Internal Endpoints

POST `/users/internal/validate`  
Internal endpoint used exclusively by the Auth & Identity Service to validate user credentials.

---

### Health Check

GET `/health`  
Service health verification endpoint.

---

## 🧪 Testing

### Unit Testing

A **unit test** is implemented using `pytest` to validate service availability.

- Tested endpoint: `/health`
- Purpose:
  - Verify service startup
  - Validate FastAPI routing
  - Enable CI/CD pipeline validation

Test file:


---

## 🔁 CI/CD Readiness

- Unit tests can be executed automatically in **GitHub Actions**
- Prevents deployments with failing services
- Supports continuous integration workflows

---

## 📦 Technologies & Libraries

Core:
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL (psycopg2)
- passlib (bcrypt, argon2)
- python-jose

Testing:
- pytest
- httpx
- anyio

---

## 📐 Design Principles Applied

- Single Responsibility Principle (SRP)
- Low Coupling
- Encapsulation
- KISS (Keep It Simple)

---

