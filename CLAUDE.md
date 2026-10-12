# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Overview

**Performance Monitoring System** — A microservices-based platform for collecting, processing, and visualizing system metrics and performance indicators across distributed infrastructure.

**Core Architecture:**
- **Eureka Server** (`eureka-server`) — Service registry/discovery on port 8761
- **API Gateway** (`api-gateway`) — Spring Cloud Gateway with Resilience4j circuit breakers, port 8080
- **Auth Service** (`auth-service`) — JWT authentication/authorization, port 8081, PostgreSQL `authDB` on 5432
- **Monitoring Service** (`service`) — Metrics collection, GraphQL + REST, port 8082, PostgreSQL `serviceDB` on 5433, Kafka on 9092
- **Notification Service** (`notification-service`) — Async email/webhook alerts via Kafka, port 8084
- **Monitoring UI** (`monitoring-ui`) — React 19 + TypeScript + Redux Toolkit + Vite + Recharts
- **Demo Service** (`load-balaner-EC2`) — Eureka client on port 8089 (not required for core)

---

## Common Commands

### Prerequisites
- JDK 21+, Node.js 18+, Docker & Docker Compose, Apache Kafka on `localhost:9092`

### Startup Sequence (must follow order)
```bash
# 1. Databases
cd auth-service && docker-compose up -d
cd ../service && docker-compose up -d

# 2. Eureka Server
cd ../eureka-server && ./mvnw clean package -DskipTests && ./mvnw spring-boot:run

# 3. Core Services (can run in parallel terminals)
cd ../auth-service && ./mvnw spring-boot:run
cd ../service && ./mvnw spring-boot:run
cd ../notification-service && ./mvnw spring-boot:run

# 4. API Gateway
cd ../api-gateway && ./mvnw spring-boot:run

# 5. Frontend
cd ../monitoring-ui && npm install && npm run dev
```

### Build & Test
```bash
# Backend (any service directory)
./mvnw clean package -DskipTests   # build
./mvnw spring-boot:run             # run
./mvnw test                        # unit/integration tests

# Frontend
cd monitoring-ui
npm run lint      # ESLint
npm run build     # production build (tsc -b && vite build)
npm run dev       # Vite dev server
```

---

## Architecture Highlights

### Communication Patterns
- **All external traffic** → API Gateway (`http://localhost:8080`)
- **Service-to-service** → Eureka discovery (`lb://SERVICE-NAME` in Gateway routes)
- **Async alerts** → Kafka topic `notification-email-send` (Monitoring → Notification)
- **Gateway validates JWT**, forwards `X-User-Id`, `X-Username`, `X-User-Roles` headers
- **Monitoring Service trusts gateway headers** (see `GatewayHeaderFilter`)

### API Routing (via Gateway)
| Path Prefix | Target Service |
|-------------|----------------|
| `/auth/**` | `AUTH-SERVICE` |
| `/applications/**`, `/alerts/**`, `/metrics/**`, `/graphql/**` | `MONITORING-SERVICE` |
| `/notification/**` | `NOTIFICATION-SERVICE` |

### Key Endpoints
- `POST /auth/register` — public, returns user entity (should return DTO)
- `POST /auth/login` — public, returns `{ token, expiration }`
- `POST /auth/verify` — public, plaintext response
- `POST /applications` — JWT, registers monitored app
- `GET /metrics/{appId}` — JWT, returns Spring `Page<MetricsResponse>`
- `GET /alerts/{appId}` — JWT, returns Spring `Page<AlertResponse>`
- `POST /graphql` — mixed auth, GraphQL queries for live charts

---

## Code Conventions

### Backend (Java/Spring)
- **Package:** `com.monitoring.<module>` (auth, service, api_gateway, notification)
- **Spring app name:** kebab-case (`auth-service`, `monitoring-service`)
- **Eureka IDs:** UPPERCASE (`AUTH-SERVICE`, `MONITORING-SERVICE`)
- **Structure per service:** `controller/`, `service/` + `impl/`, `domain/`/`entity/`, `dto/` or `domain/dto/{request,response}`, `repos/`, `config/`, `security/`, `kafka/`, `scheduler/`
- **Lombok:** `@RequiredArgsConstructor`, `@Builder`, `@Data`/`@Getter`/`@Setter`, `@Slf4j`
- **Validation:** Jakarta Bean Validation on DTOs (`@Valid @RequestBody`)
- **Error handling:** Auth has `GlobalExceptionHandler` → `ErrorDto{status,message}`; Monitoring has no `@ControllerAdvice` (Spring defaults)

### Frontend (React/TypeScript)
- **Structure:** `src/pages/`, `src/components/{home,dashboard,shared}/`, `src/features/{auth,api}/`, `src/app/store.ts`, `src/utils/`
- **State:** Redux Toolkit + RTK Query (`features/api/apiSlice.ts` for REST, `features/api/monitoringSlice.ts` + `graphqlBaseQuery.ts` for GraphQL)
- **Auth:** JWT in `localStorage.token` → Redux `auth` slice → `ProtectedRoute` guards `/dashboard`
- **API base:** Hardcoded `http://localhost:8080` (should use `import.meta.env.VITE_API_BASE`)

---

## Known Inconsistencies (from CODING_PRACTICES.md)

| Issue | Current | Recommended |
|-------|---------|-------------|
| Spring Boot versions | Mixed (3.5.x & 4.0.x) | Align on one BOM |
| DTO layout | Auth: `domain.dto.*` + `*Dto`; Monitoring: flat `dto` + `*Request`/`*Response` | Standardize on `dto.request`/`dto.response` |
| Error envelope | Auth: `{status,message}`; Monitoring: none; Gateway: empty 401 | JSON `ErrorDto` everywhere |
| REST vs GraphQL | Both export `useGetMetricsQuery`/`useGetAlertsQuery` | One source: GraphQL for charts, REST for CRUD |
| Frontend API base | Hardcoded `localhost:8080` | `VITE_API_BASE` env var |
| Secrets in git | JWT secret, DB passwords, Eureka creds in YAML | Move to env vars / `application-local.yaml` (gitignored) |
| Tests | Context-load only | Add slice tests for controllers/filters |

---

## Configuration Files
- **Backend:** `src/main/resources/application.yaml` per service (Eureka uses `.yml`, demo uses `.properties`)
- **Frontend:** `vite.config.ts`, `tsconfig*.json`, `eslint.config.js` (flat config, ESLint 9)
- **Docker Compose:** Only for PostgreSQL (in `auth-service/` and `service/`); Kafka expected externally

---

## Security Notes
- Stateless JWT, CSRF disabled
- Gateway is JWT checkpoint; downstream services trust gateway headers
- CORS bean in auth-service allows `http://localhost:5173` but security chain disables CORS — effective CORS is inconsistent
- **Never commit secrets** — rotate keys after moving to env vars