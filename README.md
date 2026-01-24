🐾 VETRESERVE-UCE

VETRESERVE-UCE is a distributed web platform for veterinary appointment and clinical record management, developed under a microservices-based architecture for an academic and institutional context (Universidad Central del Ecuador).

The project applies cloud architecture, DevOps practices, and distributed systems principles, integrating synchronous and asynchronous communication patterns.

🏗️ High-Level Architecture

The system follows a domain-driven, cloud-native architecture, with clear separation between frontend, backend services, messaging, and infrastructure.

Frontend (Vercel)
        |
        v
NGINX API Gateway (Public EC2)
        |
        v
Microservices (Private EC2)
        |
        +--> PostgreSQL
        +--> MongoDB
        +--> Kafka
        +--> RabbitMQ
        +--> MQTT

📂 Repository Structure
VETRESERVE-UCE/
├── backend/
│   └── domain/
│       ├── identity-access/
│       ├── client-pet/
│       ├── scheduling-appointments/
│       ├── clinical-information/
│       └── communication-insights/
│
├── frontend/
│   └── web-app/
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   └── terraform/
│
├── docs/
│   ├── diagrams/
│   └── architecture/
│
├── .github/workflows/
├── package.json
├── turbo.json
└── README.md

🧩 Core Components
🔹 Frontend

Technology: React + Vite

Deployment: Vercel

Purpose: User interface for clients, veterinarians, and administrators

Communication: REST API via API Gateway

🔹 API Gateway

Technology: NGINX (Dockerized)

Responsibilities:

Request routing

JWT forwarding

CORS handling

Isolation of private microservices

🔹 Backend Microservices

Language: Python (FastAPI)

Architecture: Domain-Driven Design (DDD)

Communication:

REST (synchronous)

Kafka / RabbitMQ / MQTT (asynchronous)

📡 Messaging & Event-Driven Architecture
Technology	Purpose
Kafka	Domain events (appointments, notifications, records)
RabbitMQ	Internal notification queues
MQTT	Lightweight real-time messaging
Redis	Cache and notification support
🗄️ Data Persistence
Database	Usage
PostgreSQL	Users, pets, schedules, appointments
MongoDB	Clinical records
Redis	Cache / notifications
🔐 Security

JWT-based authentication

Role-based access control:

ADMIN

VET

CLIENT

Token validation at API Gateway and service level

🚀 Deployment
Backend

AWS EC2

Docker containers

Private subnets

Exposed only through API Gateway

Frontend

Deployed on Vercel

Environment-based API configuration

VITE_API_BASE_URL=http://<API-GATEWAY-PUBLIC-IP>

🧪 Testing

Manual testing with Postman

End-to-end validation:

User registration & login

Pet creation

Schedule management

Appointment booking

Event notification flow

📘 Documentation

Detailed documentation, diagrams, and architectural decisions