# Identity & Access Domain

## VETRESERVE-UCE

---

## 📌 Overview

The **Identity & Access Domain** is responsible for authentication, authorization, and user identity management within the VETRESERVE-UCE platform.

This domain provides the foundation for secure access control across all backend services and ensures that identity-related responsibilities are isolated from business and clinical logic.

---

## 🧱 Architecture & Design

- Architecture Style: Microservices
- Design Approach: Domain-Driven Design (DDD)
- Communication: REST APIs
- Coupling: Low coupling between services
- Responsibility: Identity, authentication, and access control

All services within this domain are independently deployable and follow strict separation of concerns.

---

## 📦 Domain Microservices

### Auth & Identity Service

- Responsible for authentication and authorization
- Issues JWT tokens used across the platform
- Delegates credential validation to User Management Service
- Does not manage user persistence

### User Management Service

- Manages user lifecycle (registration, roles, approvals)
- Handles veterinarian approval workflows
- Provides internal credential validation endpoint
- Does not issue authentication tokens

---

## 🔐 Security Model

- JWT-based authentication
- Role-Based Access Control (RBAC)
- Secure password hashing (bcrypt, Argon2)
- Separation between public, protected, and internal endpoints
- CORS policy enforcement

---

## 🧪 Testing Strategy

Each microservice within this domain includes a **basic unit test** that validates service availability.

- Tested endpoint: `/health`
- Purpose:
  - Verify service startup
  - Validate routing
  - Enable CI/CD pipeline validation



---

## 🔁 CI/CD Readiness

- Domain services are compatible with GitHub Actions
- Automated unit tests prevent faulty deployments
- Supports QA and Production environments

---

## 📐 Design Principles Applied

- Single Responsibility Principle (SRP)
- Low Coupling
- High Cohesion
- Encapsulation
- KISS (Keep It Simple)

---

## 🛠 Technologies Used

- FastAPI
- Uvicorn
- JWT (python-jose)
- SQLAlchemy
- PostgreSQL
- passlib (bcrypt, Argon2)
- pytest

---


