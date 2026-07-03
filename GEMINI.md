# Performance Monitoring System - AI Development Instructions

This document provides context, architecture overviews, directory mappings, and instructions for building, running, testing, and developing this microservices project. It is intended to guide LLMs and developers working in this workspace.

---

## 🚀 Project Overview

The **Performance Monitoring System** is a microservices-based system designed to monitor, collect, process, and visualize application and infrastructure performance metrics in real-time. It uses a modern distributed architecture, featuring:
- Centralized service discovery and routing.
- Multi-channel notification alerts.
- High-performance, time-series data storage and visualization.
- Secure communication via JWT tokens.

### Key Technology Stack
- **Backend Infrastructure:** Java 21, Spring Boot 3.5.x/4.0.x, Spring Cloud (Gateway, Netflix Eureka Server).
- **Frontend Infrastructure:** React 19, TypeScript 5, Redux Toolkit, Vite, Recharts (for visualization), React Router 7.
- **Data & Messaging Layer:** PostgreSQL (Time-Series Database), Apache Kafka, Hibernate/JPA.
- **Containerization & Tooling:** Docker, Docker Compose, Maven.

---

## 📂 Project Directory Structure

- **`/eureka-server`**: Service registry using Netflix Eureka. Runs on port `8761`.
- **`/api-gateway`**: Gateway router with Spring Cloud Gateway and Resilience4j circuit breakers. Runs on port `8080`.
- **`/auth-service`**: Handles user authentication, authorization, registration, and JWT issuance. Runs on port `8081` and connects to PostgreSQL database (`authDB`) on port `5432`.
- **`/service`**: The main **Monitoring Service** which computes application metrics. Runs on port `8082`, uses GraphQL / GraphiQL (port `8082/graphql`), connects to PostgreSQL (`serviceDB`) on port `5433`, and communicates with Kafka on port `9092`.
- **`/notification-service`**: Manages email alerts and webhook notifications. Runs on port `8084` and consumes events from Kafka on port `9092`.
- **`/load-balaner-EC2`**: Known in Spring as `demo-service`, runs on port `8089` and registers to Eureka to demonstrate scaling and service discovery.
- **`/monitoring-ui`**: The React + TypeScript frontend dashboard which aggregates visualization metrics from the API Gateway.

---

## 🛠️ Building & Running

### Prerequisites
1. **Java Development Kit (JDK) 21** or higher.
2. **Node.js** (v18+ recommended) and `npm`.
3. **Docker** and **Docker Compose** installed and running.

### 1. Database & Middleware Setup
Before running the backend microservices, start the databases. Sibling containers are defined within the respective service directories:

- **Start Auth Database:**
  ```bash
  cd auth-service
  docker-compose up -d
  ```
  *Launches PostgreSQL (`postgres`) on host port `5432` with database `authDB`.*

- **Start Monitoring Database:**
  ```bash
  cd service
  docker-compose up -d
  ```
  *Launches PostgreSQL (`postgres-monitoring`) on host port `5433` with database `serviceDB`.*

### 2. Running Backend Microservices (Spring Boot)
For each service (`eureka-server`, `api-gateway`, `auth-service`, `service`, `notification-service`, `load-balaner-EC2`), use the Maven wrapper to build and run the application.

*Always start `eureka-server` first, followed by the others.*

- **Build and package all backend services (run from each service folder or in parallel):**
  ```bash
  ./mvnw clean package -DskipTests
  ```

- **Run Service:**
  ```bash
  ./mvnw spring-boot:run
  ```

#### Ports Mapping Recap:
- **Eureka Server:** `http://localhost:8761`
- **API Gateway:** `http://localhost:8080`
- **Auth Service:** `http://localhost:8081`
- **Monitoring Service:** `http://localhost:8082`
- **Notification Service:** `http://localhost:8084`
- **Demo Service:** `http://localhost:8089`

### 3. Running Frontend (`monitoring-ui`)
- **Install dependencies:**
  ```bash
  cd monitoring-ui
  npm install
  ```
- **Run the development server (Vite):**
  ```bash
  npm run dev
  ```
- **Lint the code:**
  ```bash
  npm run lint
  ```
- **Build for production:**
  ```bash
  npm run build
  ```

---

## 🧪 Testing

### Backend Unit & Integration Tests
Each backend service includes standard Spring Boot context and smoke tests. To execute tests for any microservice:
```bash
cd <service-directory>
./mvnw test
```

### Frontend Code Quality
Check and format frontend assets with:
```bash
cd monitoring-ui
npm run lint
```

---

## ✍️ Development & Contribution Guidelines

### General Code Conventions
- **Keep Code Idiomatic & Modular:** Mimic existing patterns in each module.
- **Imports structure:** Ensure imports are clean and grouped (standard Java/React library imports first, then external packages, then local source code).
- **Configuration over hardcoding:** Use `application.yaml` / `application.properties` or environment variables for configurables. Never commit credentials or secrets.

### Backend Development Style
- **Lombok Usage:** Use `@Data`, `@Getter`, `@Setter`, `@NoArgsConstructor`, and `@AllArgsConstructor` where appropriate to keep classes clean.
- **REST Endpoints:** Follow RESTful conventions. API requests should route through the `api-gateway` (`http://localhost:8080`) instead of calling internal service ports directly.
- **Exception Handling:** Standardize exceptions and use `@ControllerAdvice` if custom, user-friendly API responses are required.

### Frontend Development Style
- **TypeScript Strictness:** Maintain strong typing across all React components, hooks, and Redux slices.
- **State Management:** Use `@reduxjs/toolkit` and `react-redux` for global application state (especially Auth and Dashboard metrics).
- **Responsiveness & Style:** Use modern CSS modules or classes in line with the dashboard themes for styling components.
