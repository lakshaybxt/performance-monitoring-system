# Coding Practices & Rules

Inferred from the current repository. Prefer what the code already does; call out inconsistencies below.

## Project overview

- Multi-module microservices platform: Eureka (`eureka-server`), Spring Cloud Gateway (`api-gateway`), JWT auth (`auth-service`), metrics/alerts (`service`), Kafka email alerts (`notification-service`), React dashboard (`monitoring-ui`). `load-balaner-EC2` is a demo Eureka client, not core.
- Clients talk only to the gateway on port `8080`. Downstream services register with Eureka and are reached via `lb://SERVICE-NAME`.
- Auth is JWT Bearer. The gateway validates tokens and forwards `X-User-Id`, `X-Username`, `X-User-Roles`; monitoring-service trusts those headers (`GatewayHeaderFilter`).
- Async work uses Kafka topic `notification-email-send`. Live dashboard charts use GraphQL (`/graphql`); CRUD/list APIs are REST.

## Language & tooling

| Surface | Stack | Commands |
|---|---|---|
| Backend services | Java 21, Maven Wrapper (`./mvnw`), Spring Boot (mixed 3.5.x / 4.0.x), Spring Cloud, Lombok, JPA/PostgreSQL | `./mvnw spring-boot:run`, `./mvnw test`, `./mvnw clean package -DskipTests` |
| Auth extras | MapStruct, springdoc OpenAPI, Caffeine/Redis, Guava rate limit | same Maven commands |
| Frontend | React 19, TypeScript 5.9 (strict), Vite 8, ESM (`"type": "module"`), Redux Toolkit + RTK Query, React Router 7, Recharts | `npm run dev`, `npm run lint`, `npm run build` (`tsc -b && vite build`) |
| Lint/format | Frontend: ESLint 9 flat config (`eslint.config.js`). No Prettier. Backend: no Checkstyle/Spotless at repo root; `auth-service` has `.pre-commit-config.yaml` + yamllint. | |
| Tests | Backend: `*ApplicationTests` Spring context smoke tests only. Frontend: no test runner. | |

## Repo conventions

### Directory structure

**Backend (typical Java layout per service):**

- `controller/` — REST (and GraphQL `@Controller` resolvers in `service`)
- `service/` + `service/impl/` — business logic (auth uses interface + impl)
- `domain/` or `domain/entity/` — JPA entities
- `dto/` **or** `domain/dto/request` + `domain/dto/response` (auth)
- `repos/` — Spring Data repositories
- `config/` — Security, Kafka, Rest, OpenAPI
- `security/` — filters (`JwtSecurityFilter`, `GatewayHeaderFilter`)
- `kafka/topics`, `kafka/events`, `kafka/consumer`
- `scheduler/`, `utils/`

**Frontend (`monitoring-ui/src`):**

- `pages/` — route screens + co-located `*.css`
- `components/{home,dashboard,shared}/` — UI pieces + co-located CSS (not CSS modules)
- `features/auth/`, `features/api/` — Redux slices / RTK Query APIs
- `app/store.ts` — store, `RootState`, `AppDispatch`
- `utils/` — small helpers

### Naming

- **Java packages:** `com.monitoring.<module>` (`auth`, `service`, `api_gateway`, `notification`). Eureka uses `com.microservice.eureka_server`; demo uses `com.aws.demo`.
- **Spring `spring.application.name`:** kebab / Eureka-style (`auth-service`, `api-gateway`). Gateway `lb://` IDs are uppercase (`AUTH-SERVICE`, `MONITORING-SERVICE`).
- **Java types:** PascalCase classes; DTOs named `*Dto` (auth) or `*Request` / `*Response` (monitoring). Kafka constants in `KafkaTopics`.
- **REST paths:** plural resource nouns, no `/api` prefix (`/auth`, `/applications`, `/alerts`, `/metrics`, `/notification`).
- **TS/React:** PascalCase components, default-export pages; camelCase hooks (`useLoginMutation`). RTK `reducerPath` strings: `"api"`, `"monitoringApi"`.
- **localStorage:** key `"token"`.
- **YAML:** `application.yaml` in most services; Eureka uses `application.yml`; demo uses `application.properties`.

**Style observed:** Java mostly 2-space indent, Lombok (`@RequiredArgsConstructor`, `@Builder`, `@Data`/`@Getter`/`@Setter`, `@Slf4j`). TypeScript uses double quotes more often than single; semicolons are inconsistent. Imports: JDK/Spring first, then third-party, then local.

### API design

All browser/API traffic goes through `http://localhost:8080`.

| Method | Path | Auth | Response |
|---|---|---|---|
| POST | `/auth/register` | public | `200` + `User` entity JSON |
| POST | `/auth/login` | public | `{ "token": string, "expiration": number }` |
| POST | `/auth/verify` | public | `200` plaintext `"Account verified successfully"` or `400` plaintext error |
| POST | `/applications` | JWT | `200` empty body |
| GET | `/applications` | JWT | `ApplicationRegistrationResponse[]` |
| GET | `/applications/all` | JWT | `ApplicationRegistrationResponse[]` |
| DELETE | `/applications/{applicationId}` | JWT | `200` empty body |
| GET | `/metrics/{applicationId}` | JWT | Spring `Page<MetricsResponse>` (default size 50, sort `createdAt` DESC) |
| GET | `/alerts/{applicationId}` | JWT | `ResponseEntity<Page<AlertResponse>>` same paging defaults |
| POST | `/graphql` | mixed (actuator/graphql permitted in monitoring security) | GraphQL `{ metrics, alerts }` |

Gateway public paths: `/auth/login`, `/auth/register`, `/auth/verify`, `/graphiql`. Other routes require `Authorization: Bearer <jwt>`. Circuit breakers forward to `/authServiceFallback`, `/monitoringServiceFallback`, `/notificationServiceFallback`.

### Error handling

- **Auth-service:** `@ControllerAdvice` `GlobalExceptionHandler` returns `ErrorDto`: `{ "status": number, "message": string }`. Validation → `400`; unexpected → `500` with generic message.
- **Verify endpoint:** catches `RuntimeException` in the controller and returns plaintext `400`, bypassing `ErrorDto`.
- **Gateway:** missing/invalid JWT → `401` empty body.
- **Monitoring-service:** no `@ControllerAdvice`; validation/errors follow Spring defaults. Controllers return `ResponseEntity` or raw `Page`.

### Validation

- Jakarta Bean Validation on inbound DTOs; controllers use `@Valid @RequestBody`.
- Auth: `@Email`, `@NotBlank`, `@Size(min = 7, max = 20)` on passwords, custom `message` strings.
- Applications: `@NotBlank` name/email; `baseUrl` must match `^(http|https)://.*$`.
- Frontend currently does little schema validation; login/register rely on API errors + `react-toastify`.

### Security

- Stateless JWT (`SessionCreationPolicy.STATELESS`), CSRF disabled.
- Gateway is the JWT checkpoint; monitoring-service authenticates from gateway headers, not by re-parsing JWT.
- JWT claims used: `userId`, `username`, `email`, `enabled`, `roles`, `exp`.
- CORS bean in auth-service allows `http://localhost:5173` but CORS is also `.cors(disable)` on the filter chain — effective CORS is inconsistent.
- Secrets (JWT key, DB password, Eureka basic auth, encryption key) currently live in `application.yaml`. Do not add more secrets to git; move to env vars.

### Frontend data fetching

- **RTK Query REST** (`features/api/apiSlice.ts`): `baseUrl: "http://localhost:8080"`, `prepareHeaders` sets `Authorization` from `state.auth.token`.
- **RTK Query GraphQL** (`features/api/monitoringSlice.ts` + `graphqlBaseQuery.ts`): `http://localhost:8080/graphql` via `graphql-request` / `gql`.
- Auth session: `jwt-decode` → Redux `auth` slice; hydrate from `localStorage.token`; `ProtectedRoute` gates `/dashboard`.
- Toasts via `react-toastify`. Prefer generated hooks (`useLoginMutation`, etc.) over ad-hoc `fetch`.

### Config & env

- Per-service `src/main/resources/application.yaml` (ports: Eureka `8761`, gateway `8080`, auth `8081`, monitoring `8082`, notification `8084`, demo `8089`).
- Docker Compose only for Postgres (`auth-service` → `authDB:5432`, `service` → `serviceDB:5433`). Kafka expected at `localhost:9092`.
- Frontend has **no** `VITE_*` env; API host is hardcoded. Introduce `VITE_API_BASE` when splitting environments.
- Eureka registry URL includes basic auth credentials in config.

## Inconsistencies found

| Issue | Current behavior | Proposed standard | Low-risk migration |
|---|---|---|---|
| Spring Boot / Cloud versions | Auth/monitoring/notification on Boot **4.0.3** / Cloud **2025.1.0**; gateway **3.5.6** / **2025.0.0**; Eureka **3.5.5** | Align on one Boot + Cloud BOM per environment (document the matrix until upgraded) | Upgrade gateway/Eureka last; keep Java 21 everywhere |
| DTO package layout | Auth: `domain.dto.request/response` + `*Dto`. Monitoring: top-level `dto` + `*Request`/`*Response`; mix of class + `record` | New DTOs: `dto.request` / `dto.response`; prefer Lombok `@Builder` classes or records, not both in the same feature | Don’t mass-move; apply on new types |
| Error envelope | Auth uses `{status,message}`; verify/register mix entity/plaintext; monitoring has no handler; gateway 401 is empty | JSON `ErrorDto` for all error responses; never return JPA entities | Add `@ControllerAdvice` to `service`; change `/auth/verify` to `ErrorDto`; map register to a response DTO |
| REST list vs Page vs UI types | `/metrics` and `/alerts` return Spring `Page`; UI `apiSlice` types them as arrays | Either unwrap `.content` in RTK `transformResponse`, or type `Page<T>` | Fix `apiSlice` types to `{ content, totalElements, ... }` **or** switch UI fully to GraphQL for those views |
| Duplicate metric/alert APIs | REST in `apiSlice` **and** GraphQL in `monotoringApi`, both export `useGetMetricsQuery` / `useGetAlertsQuery` | One source: GraphQL for live charts, REST for CRUD. Don’t export colliding hook names from two APIs | Rename GraphQL hooks or stop exporting REST metrics/alerts if unused |
| Typo `monotoringApi` | Store reducer uses misspelled import | Rename to `monitoringApi` | Mechanical rename + store update |
| Frontend API base | Hardcoded `localhost:8080` | `import.meta.env.VITE_API_BASE` with localhost default | Add `.env` / `.env.example`; don’t commit secrets |
| Routes | Login success navigates to `/home`; app routes `/` as `HomePage`. `/monitor/:applicationId` is not wrapped in `ProtectedRoute`. Commented dead `/` redirect. | `/` home, `/login`, `/register`, `/dashboard`, `/monitor/:id` (protected) | Point login to `/` or add `/home` alias; wrap monitor route |
| Config file names | `application.yaml` vs `.yml` vs `.properties` | `application.yaml` for all Spring services | Rename Eureka/demo when next touched |
| Package/groupId | `com.monitoring` vs `com.microservice` vs `com.aws.demo`; folder `load-balaner-EC2` | `com.monitoring.*`; fix folder spelling when renaming is cheap | Leave Eureka/demo until a dedicated rename PR |
| Indent / quotes | Java 2 vs 4 spaces in the same class; TS semicolon mix | 2-space Java; TS double quotes + semicolons (match `apiSlice`) | Format-on-save later; don’t bikeshed existing files in feature PRs |
| Secrets in git | JWT secret, DB password, Eureka user/password, encryption key in YAML | Env vars / local overrides (`application-local.yaml` gitignored) | Rotate keys after moving them out of VCS |
| Tests | Context-load only | Keep smoke tests; add slice tests when changing controllers/filters | Start with auth validation + gateway public-path filter tests |
| Auth register response | Returns `User` entity | Return a public DTO (no password hashes / internals) | Add `RegisterResponse` and map in the controller |
| CORS | Bean allows Vite origin; security chain disables CORS | Enable CORS on gateway (the public edge), not on each service | Configure gateway CORS for `http://localhost:5173` |
