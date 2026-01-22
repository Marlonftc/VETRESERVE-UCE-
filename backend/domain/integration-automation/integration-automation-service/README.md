# Integration & Automation Service

## VETRESERVE-UCE

---

## 📌 Overview

The **Integration & Automation Service** acts as a bridge between the **VETRESERVE-UCE** platform and external automation tools, such as **n8n**.

This microservice receives internal domain events via HTTP webhooks and forwards them to external automation workflows, enabling integrations, notifications, and automated processes without coupling core business services directly to third-party systems.

It belongs to the **Integration & Automation** domain and follows a lightweight, cloud-native microservices design.

---

## 🧱 Architecture & Design

- **Architecture Style:** Microservices  
- **Design Pattern:** Layered Architecture  
- **Communication:** REST API (Webhooks)  
- **Coupling:** Low coupling through external integration isolation  
- **Responsibility Scope:** External automation and integration only  

The service does not contain business logic and does not manage domain data.

---

## 📡 API Endpoints

### Webhooks

| Method | Endpoint | Description |
|------|---------|------------|
| POST | `/webhooks/appointment-completed` | Receives appointment completed events |

### Health Check

| Method | Endpoint | Description |
|------|---------|------------|
| GET | `/health` | Service health verification |

---

## 🔐 Security

- Optional shared secret validation using HTTP headers
- Incoming webhook requests can be protected via `INTEGRATION_WEBHOOK_SECRET`
- Stateless request validation
- No direct user authentication

Security is enforced at the integration boundary to prevent unauthorized event injection.

---

## 🔁 Integration Flow

1. A domain service sends an HTTP event to this service
2. The webhook endpoint validates the optional shared secret
3. The payload is forwarded to **n8n** via HTTP
4. The response from n8n is returned to the caller

Failures in external automation do not affect core business services.

---

## 🧠 Business Rules

- Only configured webhook paths are accepted
- Invalid webhook secrets are rejected
- Payloads are forwarded as-is to automation workflows
- External integration failures are surfaced explicitly

---

## 🧪 Testing

### Unit Testing

A unit test is implemented to validate service availability.

- **Tested endpoint:** `/health`
- **Testing framework:** pytest
- **Client:** FastAPI TestClient

Tests are isolated and do not require:
- n8n
- External HTTP services
- Secrets or credentials

This ensures CI/CD compatibility.

---

## 🔁 CI/CD Readiness

- Health endpoint supports automated deployment validation
- Lightweight design enables fast startup
- Suitable for QA and PROD isolated environments

---

## 📦 Technologies & Libraries

### Core
- FastAPI
- Uvicorn
- Python

### HTTP & Integration
- requests

### Testing
- pytest
- FastAPI TestClient

---

## 📐 Design Principles Applied

- **Single Responsibility Principle (SRP)**  
- **Low Coupling**  
- **Encapsulation**  
- **KISS (Keep It Simple)**  

The service focuses exclusively on integration and automation concerns.

---

## 🔗 Domain Context

- **Domain:** Integration & Automation  
- **Related Services:**
  - Clinical Records Service
  - Notification Service
  - Reporting & Analytics Service

This service enables external automation without impacting core platform stability.

---


