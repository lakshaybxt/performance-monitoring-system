# Performance Monitoring System - Architecture Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Style](#architecture-style)
3. [Service Breakdown](#service-breakdown)
4. [System Flow](#system-flow)
5. [Communication Patterns](#communication-patterns)
6. [Deployment Architecture](#deployment-architecture)
7. [Architecture Diagram](#architecture-diagram)
8. [Technology Stack](#technology-stack)
9. [Future Improvements](#future-improvements)

---

## Project Overview

### What the System Does

The **Performance Monitoring System** is a microservices-based platform designed to monitor, collect, and visualize system metrics and performance indicators across distributed infrastructure. It provides real-time insight into application health, resource utilization, and system performance through a comprehensive dashboard and alerting mechanism.

### Key Features

- **Metrics Collection**: Continuous collection of performance metrics from monitored services
- **Real-time Dashboard**: Web-based monitoring UI with live metrics visualization
- **Alerting System**: Proactive notifications when metrics exceed defined thresholds
- **Authentication & Authorization**: Secure access to monitoring data with user management
- **Service Discovery**: Dynamic service registration and discovery using Eureka
- **High Availability**: Load balancing and scalable architecture across multiple instances
- **API Gateway**: Centralized entry point for all client requests

---

## Architecture Style

### Microservices Architecture

This system adopts a **microservices architecture** pattern, where the application is decomposed into independently deployable, loosely coupled services that communicate via well-defined APIs.

**Key Characteristics:**
- **Service Autonomy**: Each service has its own responsibility and can be developed, deployed, and scaled independently
- **Resilience**: Service failures are isolated and don't cascade across the entire system
- **Scalability**: Individual services can be scaled based on specific demand
- **Technology Flexibility**: Each service can use different technology stacks when appropriate
- **Fault Tolerance**: Built-in resilience patterns through service discovery and load balancing

### Core Architectural Components

- **Service Discovery** (Eureka Server): Maintains a dynamic registry of available service instances
- **API Gateway**: Single entry point that routes requests to appropriate backend services
- **Load Balancing**: Distributes traffic across multiple instances for optimal resource utilization
- **Authentication Layer**: Centralized authentication and authorization service
- **Data Processing Pipeline**: Metrics collection, processing, and storage
- **Notification Engine**: Asynchronous alerting and notification system

---

## Service Breakdown

### 1. API Gateway (`api-gateway`)

**Responsibility:**
- Acts as the single entry point for all client requests
- Handles request routing to appropriate backend services
- Implements cross-cutting concerns (logging, rate limiting, request transformation)
- Provides unified API interface to clients

**Technology:** Spring Boot (Java)

**Key Functions:**
- Route incoming requests to auth-service, monitoring-service, or notification-service
- Forward metrics queries to the monitoring service
- Handle API versioning and backward compatibility
- Implement API rate limiting and throttling

**Interactions:**
- Routes requests to: `auth-service`, `service` (monitoring-service), `notification-service`
- Communicates with Eureka for service discovery
- Sends logs and metrics to monitoring-service

---

### 2. Auth Service (`auth-service`)

**Responsibility:**
- Manages user authentication and authorization
- Issues and validates JWT tokens or authentication credentials
- Manages user roles and permissions
- Provides OAuth/session management

**Technology:** Spring Boot (Java)

**Key Functions:**
- User login/logout endpoints
- Token generation and validation
- Role-based access control (RBAC)
- User management operations

**Interactions:**
- Called by: API Gateway (for token validation), all services (for permission checks)
- Communicates with Eureka for registration
- May interact with a dedicated auth database

---

### 3. Eureka Server (`eureka-server`)

**Responsibility:**
- Provides service discovery and registration
- Maintains dynamic registry of all service instances
- Health checking of registered services
- Load balancer aware service lookup

**Technology:** Spring Boot with Spring Cloud Eureka (Java)

**Key Functions:**
- Service instance registration and deregistration
- Service instance lookup by service name
- Health status monitoring
- Automatic removal of unhealthy instances

**Interactions:**
- Receives registration from: All backend services
- Queried by: API Gateway, inter-service calls, Load Balancer

---

### 4. Monitoring Service (`service`)

**Responsibility:**
- Collects and processes performance metrics
- Stores metrics data (time-series data)
- Provides metrics retrieval APIs
- Performs data aggregation and analysis

**Technology:** Spring Boot (Java)

**Key Functions:**
- Accept metrics data from monitored systems
- Time-series data storage and indexing
- Metrics query and aggregation endpoints
- Historical data retention and cleanup
- Threshold evaluation for alerting

**Interactions:**
- Receives metric submissions from: Monitored applications, agents
- Calls: Notification Service (when thresholds exceeded)
- Queried by: Monitoring UI via API Gateway
- Communicates with Eureka for registration

---

### 5. Notification Service (`notification-service`)

**Responsibility:**
- Handles alert generation and delivery
- Sends notifications through multiple channels (email, SMS, webhooks, in-app)
- Manages notification preferences and escalation policies
- Tracks notification delivery status

**Technology:** Spring Boot (Java)

**Key Functions:**
- Receive alert triggers from monitoring-service
- Format and deliver notifications
- Support multiple notification channels
- Implement notification scheduling and batching
- Manage notification templates

**Interactions:**
- Receives alerts from: Monitoring Service
- Sends notifications to: External services (email, SMS APIs), users
- Communicates with Eureka for registration

---

### 6. Monitoring UI (`monitoring-ui`)

**Responsibility:**
- Provides user-facing dashboard for metrics visualization
- Displays real-time and historical metric data
- Allows configuration of alerts and thresholds
- Shows system health and status overview

**Technology:** React with TypeScript (Frontend)

**Key Functions:**
- Real-time metric visualization using charts/graphs
- Alert management and configuration UI
- User authentication and profile management
- Historical data visualization and reporting
- Interactive dashboards and custom views

**Interactions:**
- Calls: API Gateway (for all backend operations)
- Sends queries to: Monitoring Service via API Gateway
- Authenticates via: Auth Service via API Gateway
- Receives notifications: From Notification Service (via WebSocket or polling)

---

### 7. Load Balancer EC2 (`load-balancer-EC2`)

**Responsibility:**
- Distributes incoming traffic across multiple service instances
- Provides high availability and fault tolerance
- Health checks and automatic instance failover
- Session persistence when required

**Technology:** Spring Boot (Java) or Nginx/HAProxy

**Key Functions:**
- Layer-4/7 load balancing
- Health probing of backend instances
- Connection pooling and management
- SSL/TLS termination
- Request routing based on path, host, or other criteria

**Interactions:**
- Receives traffic from: External clients
- Routes to: API Gateway instances
- May query Eureka for dynamic instance discovery
- Reports metrics: To monitoring-service

---

## System Flow

### 1. User Authentication and Request Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. AUTHENTICATION FLOW                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Client                                                 │
│    │                                                    │
│    ├─► [1] POST /login (credentials)                   │
│    │   └──► API Gateway                                │
│    │       └──► Auth Service                           │
│    │           └─► Validate credentials                │
│    │               └─► Generate JWT Token              │
│    │                                                   │
│    │◄─── [2] Return JWT Token                         │
│    │                                                   │
│    └─ Store JWT in Local Storage/Cookies              │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATED REQUEST FLOW                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Client (with JWT)                                       │
│    │                                                     │
│    ├─► [1] GET /api/metrics (JWT Header)               │
│    │   └──► API Gateway                                 │
│    │       ├─► Validate JWT with Auth Service          │
│    │       │                                            │
│    │       ├─► Check Authorization (RBAC)              │
│    │       │                                            │
│    │       ├─► Route to Monitoring Service             │
│    │       │   └─► Query metrics from database          │
│    │       │                                            │
│    │       └─► Return metrics JSON                      │
│    │                                                    │
│    │◄──── [2] Metrics Data                             │
│    │                                                    │
│    └─ Render in Dashboard                              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2. Metrics Collection and Alerting Flow

```
┌──────────────────────────────────────────────────────────┐
│ 3. METRICS & ALERTING FLOW                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Monitored Systems                                       │
│    │                                                     │
│    ├─► [1] POST /api/metrics (metric data)             │
│    │   └──► API Gateway                                 │
│    │       └──► Monitoring Service                      │
│    │           ├─► Store in Time-Series DB              │
│    │           ├─► Check against thresholds             │
│    │           │                                        │
│    │           └─► IF threshold exceeded:               │
│    │               ├─► [2] POST /alerts                 │
│    │               │   └──► Notification Service        │
│    │               │       ├─► Format alerts            │
│    │               │       └─► Send via channels        │
│    │               │           (email, SMS, webhook)    │
│    │               │                                    │
│    │               └─► [3] Store alert history          │
│    │                                                    │
│    └─► Monitoring UI polls/subscribes                   │
│        └─► Displays alerts on dashboard                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3. Service Discovery and Registration Flow

```
┌──────────────────────────────────────────────────────────┐
│ 4. SERVICE DISCOVERY FLOW                                │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Service Startup                                         │
│    │                                                     │
│    ├─► [1] Service starts (Auth, Monitoring, etc.)     │
│    │   └──► Register with Eureka Server                 │
│    │       ├─► serviceName: "auth-service"             │
│    │       ├─► instanceId: "auth-service:8001"         │
│    │       └─► health: /actuator/health                │
│    │                                                    │
│    └─► Eureka maintains heartbeat with service          │
│        └─► Updates registry every 30 sec (default)     │
│                                                          │
│  Service Lookup (by API Gateway/Load Balancer)          │
│    │                                                    │
│    ├─► [2] Query Eureka: "Get all auth-service"       │
│    │       instances                                   │
│    │   └──► Eureka returns:                             │
│    │       [                                            │
│    │         { url: "http://service1:8001" },          │
│    │         { url: "http://service2:8001" }           │
│    │       ]                                            │
│    │                                                    │
│    └─► Load Balance across instances                    │
│                                                          │
│  Service Failure                                         │
│    │                                                    │
│    ├─► [3] Service stops/becomes unhealthy             │
│    │   └──► Failed health checks                        │
│    │       └──► Eureka removes from registry            │
│    │           └─► Requests route to healthy instances  │
│    │                                                    │
└──────────────────────────────────────────────────────────┘
```

---

## Communication Patterns

### HTTP/REST Communication

**Synchronous Communication:**
- Most inter-service communication uses HTTP/REST
- API Gateway to backend services
- Monitoring UI to backend services via API Gateway
- Monitoring Service to Notification Service

**Request/Response Pattern:**
```
Client → API Gateway → [Service Discovery lookup via Eureka]
                      → Specific Service Instance
                      → Response back through Gateway
```

### Service-to-Service Communication

**Direct Service Discovery:**
- Services query Eureka to discover other service instances
- Client-side load balancing across returned instances
- Built-in retry and circuit breaker patterns (Spring Cloud)

**API Gateway Mediation:**
- Most service-to-service calls routed through API Gateway
- Enables centralized logging, monitoring, and security
- Decouples services from direct dependencies

### Asynchronous Communication

**Event-Driven Alerting:**
- Monitoring Service detects threshold breach
- Posts alert event to Notification Service
- Notification Service processes asynchronously
- Enables non-blocking operations and scalability

---

## Deployment Architecture

### Container & Orchestration

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS INFRASTRUCTURE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────┐                 │
│  │  Clients (Web/API)                   │                 │
│  └────────────┬─────────────────────────┘                 │
│               │                                            │
│  ┌────────────▼─────────────────────────┐                 │
│  │  Load Balancer (EC2 / AWS ELB)       │                 │
│  │  Port: 80/443 → 8080                 │                 │
│  └────────────┬─────────────────────────┘                 │
│               │                                            │
│  ┌────────────▼─────────────────────────┐                 │
│  │  API Gateway (Multiple Instances)    │                 │
│  │  - Docker Container on EC2           │                 │
│  │  - Port: 8080                        │                 │
│  └────┬─────────────┬────────────┬──────┘                 │
│       │             │            │                        │
│  ┌────▼──┐  ┌──────▼──┐  ┌──────▼──┐  ┌─────────────┐   │
│  │ Auth  │  │Monitor-├──┤Notif'n  │  │  Eureka     │   │
│  │Service│  │Service │  │Service  │  │  Server     │   │
│  │EC2-X  │  │EC2-X   │  │EC2-X    │  │  EC2-X      │   │
│  └───────┘  └───┬────┘  └────┬────┘  └─────────────┘   │
│                 │            │                          │
│           ┌─────▼────────────▼─────┐                     │
│           │  Database (PostgreSQL) │                     │
│           │  Time-Series Data      │                     │
│           │  RDS Instance          │                     │
│           └────────────────────────┘                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Scaling Strategy

**Horizontal Scaling:**
- Each service can be scaled independently
- Add more EC2 instances running service containers
- Load Balancer distributes requests across instances
- Eureka automatically discovers new instances

**Vertical Scaling:**
- Increase instance size (CPU, memory) for specific services
- Useful for database tier or intensive processing services

**Data Layer Scaling:**
- Time-series database optimization for metrics ingestion
- Read replicas for high-query workloads
- Connection pooling and caching strategies

### Containerization

**Docker Deployment:**
- Each service packaged as Docker container
- Dockerfile in service roots enables container builds
- Docker Compose for local development and testing
- Container registry holds built images

**Container Management:**
- Services run on EC2 instances via Docker
- Service discovery via Eureka replaces traditional container orchestration
- Health checks built into container runtime

---

## Architecture Diagram

### System Overview

```
                              ┌──────────────────────┐
                              │   Monitored Systems  │
                              │  (Applications,      │
                              │   Infrastructure)    │
                              └──────────┬───────────┘
                                         │
                                         │ Metrics
                                         │ POST /metrics
                                         │
                         ┌───────────────▼──────────────┐
                         │   External Clients           │
                         │  (Users, Applications)       │
                         └───────────────┬──────────────┘
                                         │
                                    HTTP/HTTPS
                                         │
                    ┌────────────────────▼─────────────────┐
                    │                                      │
                    │    AWS LOAD BALANCER (ELB)          │
                    │    (Port: 80/443)                   │
                    │                                      │
                    └────────────────────┬─────────────────┘
                                         │
            ┌────────────────────────────┼────────────────────────────┐
            │                            │                            │
            │                            │                            │
   ┌────────▼─────────┐      ┌──────────▼──────────┐    ┌───────────▼────┐
   │   API GATEWAY    │      │    API GATEWAY      │    │  API GATEWAY   │
   │   Instance 1     │      │    Instance 2       │    │  Instance N    │
   │   (Docker/EC2)   │      │    (Docker/EC2)     │    │  (Docker/EC2)  │
   └────────┬─────────┘      └──────────┬──────────┘    └───────────┬────┘
            │                           │                           │
            └───────────────┬───────────┴───────────┬────────────────┘
                            │                       │
                  ┌─────────▼────────┐    ┌─────────▼────────┐
                  │ Service Discovery│    │   Auth/Logging   │
                  │   (EUREKA)       │    │   Cross-Cutting  │
                  │   Instance 1     │    │   Concerns       │
                  └──────────────────┘    └──────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
    ┌───────▼────────┐          ┌──────────▼──────────┐
    │                │          │                     │
    │  AUTH-SERVICE  │          │  MONITORING SERVICE │
    │  (Spring Boot) │          │   (Spring Boot)     │
    │  - Instances   │          │  - Instances        │
    │  - JWT Token   │          │  - Metrics APIs     │
    │  - User DB     │          │  - Threshold Logic  │
    │                │          │  - Alerting         │
    └────────────────┘          └──────────┬──────────┘
                                           │
                                           │ Alert
                                           │ Events
                                           │
                    ┌──────────────────────▼────────────────┐
                    │   NOTIFICATION SERVICE                │
                    │   (Spring Boot)                       │
                    │  - Alert Processing                   │
                    │  - Multi-channel delivery             │
                    │  - Email, SMS, Webhooks               │
                    └──────────────────────┬─────────────────┘
                                           │
                    ┌──────────────────────┴─────────────────┐
                    │        MONITORING UI (React)           │
                    │  - Dashboard                           │
                    │  - Metrics Visualization               │
                    │  - Alert Management                    │
                    └───────────────────────────────────────┘
                                           │
                                           │ Polling/
                                           │ WebSocket
                                           │
                    ┌──────────────────────▼─────────────────┐
                    │      PostgreSQL RDS                    │
                    │  - Time-series metrics                 │
                    │  - User data                           │
                    │  - Alert history                       │
                    │  - Configuration                       │
                    └───────────────────────────────────────┘

```

---

## Technology Stack

### Backend Services

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Spring Boot | 3.x | Application framework |
| **Service Discovery** | Spring Cloud Eureka | 4.x | Service registration & discovery |
| **API Gateway** | Spring Cloud Gateway | 4.x | Request routing & mediation |
| **Runtime** | Java | 17+ | JVM runtime environment |
| **Build Tool** | Maven | 3.8+ | Dependency & build management |

### Data Layer

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **RDBMS** | PostgreSQL | Relational data storage |
| **Time-Series** | PostgreSQL + TimescaleDB (optional) | Efficient metrics storage |
| **Caching** | Redis (optional) | Performance optimization |
| **ORM** | Hibernate/JPA | Database abstraction |

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18+ | UI framework |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **Build Tool** | Vite | 5.x | Fast bundler |
| **Styling** | CSS Modules / Tailwind | Latest | Component styling |

### Infrastructure & Deployment

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Containerization** | Docker | Container packaging |
| **Orchestration** | Docker Compose | Local/dev deployment |
| **Cloud Platform** | AWS | Hosting infrastructure |
| **Compute** | EC2 | VM instances for services |
| **Database** | RDS (PostgreSQL) | Managed database service |
| **Load Balancing** | AWS ELB / Custom | Traffic distribution |
| **Networking** | VPC, Security Groups | Network isolation & security |

### Monitoring & Logging

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Application Metrics** | Micrometer | Metrics collection |
| **Health Checks** | Spring Actuator | Service health endpoints |
| **Logging** | SLF4J + Logback | Centralized logging |

---

## Future Improvements

### 1. Advanced Monitoring & Observability
- **Distributed Tracing:** Implement Jaeger/Zipkin for request tracing
- **Centralized Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)
- **Log Aggregation:** Centralize logs from all services
- **APM:** Application Performance Monitoring (New Relic, DataDog)

### 2. Caching Layer
**Add Redis for:**
- Frequently accessed metrics
- User session caching
- Rate limiting state
- Query result caching

### 3. Database Optimization
- **Time-Series Optimization:** TimescaleDB for metrics storage
- **Data Retention Policies:** Implement data archival and cleanup
- **Query Performance:** Add materialized views for common queries
- **Replication:** Master-slave setup for high availability

### 4. Enhanced Security
- **API Security:** OAuth 2.0 / OpenID Connect
- **Encryption:** TLS for all service-to-service communication
- **Secret Management:** HashiCorp Vault or AWS Secrets Manager
- **RBAC Enhancement:** Fine-grained permission model

### 5. Container Orchestration
**Migration Path:**
- Kubernetes adoption for production
- Helm charts for service deployment
- Auto-scaling policies
- Automated rollout/rollback

### 6. Testing & CI/CD
- **Integration Tests:** Full workflow testing
- **E2E Tests:** Complete user flows
- **Performance Tests:** Load and stress testing
- **CI/CD Pipeline:** GitLab CI / GitHub Actions
- **Automated Deployments:** Blue-green or canary deployments

### 7. Resilience Patterns
- **Retry Logic:** Exponential backoff for transient failures
- **Bulkheads:** Resource isolation between services

### 8. Multi-tenancy
- Support for multiple organization deployments
- Data isolation and segregation
- Tenant-aware authentication/authorization

### 9. Mobile Application
- Native mobile app for alert notifications
- Cross-platform support (iOS/Android)
- Push notification integration

---

## Development Guidelines

### Service Communication
1. Always use API Gateway for external client requests
2. Service-to-service calls use Eureka for discovery
3. Prefer REST over other protocols unless specifically justified
4. Document all APIs with OpenAPI/Swagger

### Deployment
1. Build Docker images for each service
2. Use Docker Compose for local development
3. Deploy to AWS EC2 with proper security groups
4. Monitor service health via Eureka

### Configuration Management
1. Use environment variables for environment-specific config
2. Centralize configuration in application.yaml
3. Never commit secrets or credentials
4. Use AWS Secrets Manager for production secrets

### Monitoring & Logging
1. Enable Spring Actuator on all services
2. Log all inter-service calls
3. Monitor Eureka registry for service health
4. Set up alerts for critical metrics

---

## Conclusion

This microservices architecture provides a scalable, maintainable foundation for a performance monitoring system. The distributed nature enables independent service scaling and deployment while maintaining clear service boundaries. Through service discovery, API Gateway routing, and pub/sub alerting patterns, the system achieves high availability and responsiveness.

As the system evolves, the roadmap includes message queue integration, advanced observability, container orchestration, and multi-tenancy support to meet growing operational demands.

---

*Last Updated: March 21, 2026*
*Version: 1.0*
