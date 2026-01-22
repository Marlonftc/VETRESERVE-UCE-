# Auth & Identity Service

## VETRESERVE-UCE

---

## 📌 Overview

The Auth & Identity Service is responsible for authentication and identity validation within the VETRESERVE-UCE platform.

This microservice provides secure user authentication using JWT tokens and acts as the authorization entry point for all protected backend services.

It belongs to the Identity & Access domain and is fully isolated from business logic domains.

---

## 🧱 Architecture & Design

- Architecture Style: Microservices
- Design Pattern: Layered Architecture
- Communication: REST API
- Coupling: Low coupling
- Responsibility: Authentication and token generation only

This service does not manage users directly.
User credential validation is delegated to the User Management Service.

---

## 🔐 Security Features

- JWT-based authentication
- Stateless token-based authorization
- Secure password handling using bcrypt
- Role and user status embedded in JWT claims
- CORS policy enforcement
- No session storage

---

## 📡 API Endpoints

### Authentication

POST /auth/login  
Authenticate user and issue JWT token

GET /auth/me  
Return authenticated user information

### Health Check

GET /health  
Service health verification

---

## 🧪 Testing

### Unit Testing

A  unit test is implemented using pytest to validate service availability.

Tested endpoint:
- /health

Purpose:
- Verify service startup
- Validate FastAPI routing
- Ensure CI/CD compatibility

Test file:
tests/test_health.py

This test does not depend on databases or external services.

---

## 🔁 CI/CD Readiness

- Unit tests can be executed automatically in GitHub Actions
- Prevents deployments with broken services
- Supports continuous integration workflows

---

## 📦 Technologies & Libraries

Core:
- FastAPI
- Uvicorn
- python-jose
- passlib[bcrypt]
- requests
- python-dotenv

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

--
