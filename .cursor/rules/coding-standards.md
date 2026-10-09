---
description: Repo-specific coding standards inferred from this performance-monitoring-system codebase. Apply when writing or reviewing Java microservices or monitoring-ui code.
alwaysApply: true
---

# Coding standards

Follow existing modules. Do not invent a new architecture for a one-line change.

## Do

- Add backend code under the matching service (`auth-service`, `service`, `api-gateway`, `notification-service`, `eureka-server`). Package new types as `com.monitoring.<module>`.
- Keep controllers thin: validate input, call a service, return `ResponseEntity` (or GraphQL types). Put business logic in `service` / `service.impl`.
- Use Lombok (`@RequiredArgsConstructor`, `@Builder`, `@Slf4j`, getters/setters or `@Data`) the way neighboring classes do.
- Expose REST **without** an `/api` prefix. Gateway routes:
  - `/auth/**` → AUTH-SERVICE
  - `/applications/**`, `/alerts/**`, `/metrics/**`, `/graphql/**` → MONITORING-SERVICE
  - `/notification/**` → NOTIFICATION-SERVICE
- Clients call **only** `http://localhost:8080` (or `VITE_API_BASE` once added). Never hardcode `8081`/`8082` from the UI.
- Public unauthenticated paths: `POST /auth/register`, `POST /auth/login`, `POST /auth/verify`. Everything else: `Authorization: Bearer <jwt>`.
- After gateway auth, downstream identity is `X-User-Id`, `X-Username`, `X-User-Roles`. Monitoring code should read those headers (see `GatewayHeaderFilter`), not re-parse JWT unless changing the gateway contract.
- Login JSON shape: `{ "token": string, "expiration": number }`. Persist the token in Redux + `localStorage` key `"token"`.
- Auth errors: `{ "status": number, "message": string }` (`ErrorDto`). Validation uses Jakarta `@Valid` + `@NotBlank` / `@Email` / `@Size`.
- Application register body: `{ name, baseUrl, email }` with `baseUrl` matching `http://` or `https://`. Success is `200` with empty body; lists return `ApplicationRegistrationResponse[]`.
- `/metrics/{applicationId}` and `/alerts/{applicationId}` return Spring **`Page`** (default size 50, sort `createdAt` DESC). Type the UI against that envelope, or use GraphQL (`monitoringSlice`) for live charts — do not assume a bare array unless `transformResponse` unwraps `.content`.
- Kafka email events go to topic `notification-email-send` (`KafkaTopics.NOTIFICATION_EMAIL_SEND`).
- Frontend: React function components, Redux Toolkit, RTK Query hooks, React Router, co-located `Component.css` (not CSS modules). Protect private screens with `ProtectedRoute`.
- Config in `application.yaml` (not new `.properties` files). Java 21. Run services with `./mvnw spring-boot:run`; UI with `npm run dev` / `npm run lint`.
- Use environment variables for secrets. Do not add JWT keys, DB passwords, or Eureka credentials to committed YAML.

## Don’t

- Don’t return JPA entities from APIs (register currently does — new endpoints must use DTOs).
- Don’t add a second API style (e.g. `/api/v1`, SOAP, random ports) without updating the gateway routes.
- Don’t duplicate `useGetMetricsQuery` / `useGetAlertsQuery` across REST and GraphQL slices; rename or keep a single export.
- Don’t call `fetch` in pages when an RTK Query endpoint already exists.
- Don’t skip `@Valid` on new request bodies.
- Don’t enable CSRF sessions; services are stateless JWT.
- Don’t put new secrets, `.env` with credentials, or `application-local.yaml` into git if it contains secrets.
- Don’t “fix” Spring Boot 3 vs 4 or `application.yml` vs `.yaml` in an unrelated PR.
- Don’t wrap `/monitor/:applicationId` as public if the APIs require a token — keep it behind `ProtectedRoute`.
- Don’t navigate to routes that are not registered (`/home` is not a route; home is `/`).
