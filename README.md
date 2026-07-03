# Performance Monitoring System

A microservices-based platform designed to collect, process, and visualize system metrics and performance indicators across distributed infrastructure. It features service discovery, a central API gateway, JWT-based security, database-backed storage, and asynchronous event-driven alerting.

---

## 🏗️ Architecture Overview

The application comprises the following components:
*   **Eureka Server** (`/eureka-server`): Service registry and discovery.
*   **API Gateway** (`/api-gateway`): Single-entry gateway routing with circuit-breakers.
*   **Auth Service** (`/auth-service`): Handles authentication, authorization, and JWT issuance.
*   **Monitoring Service** (`/service`): Main processing and storage core for time-series metrics.
*   **Notification Service** (`/notification-service`): Delivers alerts asynchronously over Kafka.
*   **Monitoring UI** (`/monitoring-ui`): React + TypeScript dashboard.

*Note: The `load-balaner-EC2` folder is a demonstration service for scaling and service discovery and is not required for running the core application.*

---

## 🛠️ Prerequisites

To run the system locally, ensure you have the following installed and running:
1.  **Java Development Kit (JDK) 21** or higher
2.  **Node.js** (v18+) and **npm**
3.  **Docker** and **Docker Compose**
4.  **Apache Kafka** (running locally on `localhost:9092`)

---

## 🚀 Startup Guide (Sequence)

For a successful local startup and dynamic service discovery, services must be started in the following order:

```
┌──────────────────────────────────────┐
│  Step 1: Start Databases & Kafka     │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│  Step 2: Start Eureka Discovery      │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│  Step 3: Start Core Applications     │
│  (Auth, Monitoring, Notification)    │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│  Step 4: Start API Gateway           │
└──────────────────┬───────────────────┘
                   ▼
┌──────────────────────────────────────┐
│  Step 5: Start Frontend UI           │
└──────────────────────────────────────┘
```

### Step 1: Start Databases & Infrastructure

Start the PostgreSQL databases containerized via Docker. In production, this can be managed RDS instances.

1.  **Auth Service Database** (PostgreSQL running on host port `5432` with database `authDB`):
    ```bash
    cd auth-service
    docker-compose up -d
    cd ..
    ```

2.  **Monitoring Service Database** (PostgreSQL running on host port `5433` with database `serviceDB`):
    ```bash
    cd service
    docker-compose up -d
    cd ..
    ```

3.  **Kafka Broker**: Ensure Apache Kafka is running on `localhost:9092`. The Monitoring Service publishes events to Kafka, which the Notification Service consumes asynchronously.

---

### Step 2: Start Eureka Server (Service Registry)

The registry must be fully running so backend services can register on startup.

1.  Navigate to the Eureka directory:
    ```bash
    cd eureka-server
    ```
2.  Build and package:
    ```bash
    ./mvnw clean package -DskipTests
    ```
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```
4.  **Access Eureka Dashboard**: Open `http://localhost:8761` in your browser.
    *   **Username**: `lakshay`
    *   **Password**: `lakshay`

*(Keep this terminal running and open a new terminal for the next step).*

---

### Step 3: Start Core Applications

Now start the business logic microservices. They will register themselves with Eureka automatically.

1.  **Auth Service** (Port `8081`):
    ```bash
    cd auth-service
    ./mvnw clean package -DskipTests
    ./mvnw spring-boot:run
    ```

2.  **Monitoring Service** (Port `8082`):
    ```bash
    cd service
    ./mvnw clean package -DskipTests
    ./mvnw spring-boot:run
    ```

3.  **Notification Service** (Port `8084`):
    ```bash
    cd notification-service
    ./mvnw clean package -DskipTests
    ./mvnw spring-boot:run
    ```

Check the Eureka Server dashboard (`http://localhost:8761`) to verify that `AUTH-SERVICE`, `MONITORING-SERVICE`, and `NOTIFICATION` have registered successfully.

---

### Step 4: Start API Gateway

The API Gateway routes client traffic to registered microservices. It should be started after the downstreams are up so they are immediately discoverable.

1.  Navigate to the Gateway directory:
    ```bash
    cd api-gateway
    ```
2.  Build and package:
    ```bash
    ./mvnw clean package -DskipTests
    ```
3.  Run the application:
    ```bash
    ./mvnw spring-boot:run
    ```

The API Gateway will now run on port `8080`, proxying requests dynamically.

---

### Step 5: Start Frontend UI

Once the backend is fully operational, run the development server for the UI dashboard.

1.  Navigate to the UI directory:
    ```bash
    cd monitoring-ui
    ```
2.  Install required dependencies:
    ```bash
    npm install
    ```
3.  Launch Vite dev server:
    ```bash
    npm run dev
    ```

The application UI will typically be accessible on `http://localhost:5173` or as printed in your terminal.

---

## 🔀 API Routing Reference

All client calls must route through the API Gateway on port `8080` instead of calling service ports directly:

| Endpoint Pattern | Target Service | Purpose |
| :--- | :--- | :--- |
| `/auth/**` | `AUTH-SERVICE` | Register, login, token validation |
| `/applications/**`, `/alerts/**`, `/metrics/**`, `/graphql/**` | `MONITORING-SERVICE` | Query system metrics, configure metrics & GraphQL queries |
| `/notification/**` | `NOTIFICATION-SERVICE` | Trigger or configure alerts and notification deliveries |

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
To execute tests for any Spring Boot service, navigate to its directory and run:
```bash
./mvnw test
```

### Frontend Code Quality
Check and build the UI assets using:
```bash
cd monitoring-ui
npm run lint
npm run build
```
>>>>>>> e1b6de6 (Used GeminiCLI)
