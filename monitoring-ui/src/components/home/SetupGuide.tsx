import "./SetupGuide.css";

export default function SetupGuide() {
  return (
    <div className="home-setup">
      <div className="home-setup-title">Get started in 3 steps</div>
      <div className="home-setup-sub">Connect your Spring Boot app — takes less than 5 minutes</div>

      <div className="home-steps">

        {/* Step 1 */}
        <div className="home-step">
          <div className="home-step-num">1</div>
          <div className="home-step-body">
            <div className="home-step-title">Add Actuator to your project</div>
            <div className="home-step-desc">
              Add the Spring Boot Actuator dependency to your{" "}
              <code>pom.xml</code> or <code>build.gradle</code>:
            </div>
            <pre className="home-code-block">{`<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>`}</pre>

            <div className="home-info-block">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#57ab5a" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="8" cy="8" r="6" /><line x1="8" y1="5" x2="8" y2="8" /><line x1="8" y1="11" x2="8.01" y2="11" />
              </svg>
              <div className="home-info-text">
                Expose the required endpoints in your <code>application.properties</code>:<br /><br />
                <code>management.endpoints.web.exposure.include=health,info,metrics,prometheus</code><br />
                <code>management.endpoint.health.show-details=always</code>
              </div>
            </div>

            <div className="home-endpoints-label">Required endpoints</div>
            <div className="home-endpoints">
              <div className="home-endpoint-row">
                <span className="home-method">GET</span>
                <span className="home-endpoint-path">/actuator/health</span>
                <span className="home-endpoint-desc">— app health status</span>
              </div>
              <div className="home-endpoint-row">
                <span className="home-method">GET</span>
                <span className="home-endpoint-path">/actuator/metrics</span>
                <span className="home-endpoint-desc">— JVM & system metrics</span>
              </div>
              <div className="home-endpoint-row">
                <span className="home-method">GET</span>
                <span className="home-endpoint-path">/actuator/info</span>
                <span className="home-endpoint-desc">— app info</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="home-step">
          <div className="home-step-num">2</div>
          <div className="home-step-body">
            <div className="home-step-title">Allow CORS for AppMonitor</div>
            <div className="home-step-desc">
              Your application must allow requests from AppMonitor's domain.
              Add this to your Spring Security config:
            </div>
            <pre className="home-code-block">{`@Bean
public CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration config = new CorsConfiguration();
  config.setAllowedOrigins(List.of(
    "http://localhost:5173",  // dev
    "https://appmonitor.io"   // prod
  ));
  config.setAllowedMethods(List.of("GET", "POST"));
  config.setAllowedHeaders(List.of("*"));
  UrlBasedCorsConfigurationSource source =
    new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/actuator/**", config);
  return source;
}`}</pre>

            <div className="home-warn-block">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#d4a017" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M8 1.5l6 11H2l6-11z" />
                <line x1="8" y1="6.5" x2="8" y2="9.5" />
                <circle cx="8" cy="11.5" r=".5" fill="#d4a017" />
              </svg>
              <div className="home-warn-text">
                Without CORS configured, AppMonitor cannot reach your{" "}
                <code>/actuator</code> endpoints and monitoring will fail silently.
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="home-step">
          <div className="home-step-num">3</div>
          <div className="home-step-body">
            <div className="home-step-title">Register your app on AppMonitor</div>
            <div className="home-step-desc">
              Go to the dashboard, click <strong>Register new application</strong>, and fill
              in your app's base URL. AppMonitor will start polling your Actuator endpoints automatically.
            </div>
            <div className="home-info-block">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#57ab5a" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="8" cy="8" r="6" /><polyline points="5 8 7 10 11 6" />
              </svg>
              <div className="home-info-text">
                Your base URL must be reachable from our servers. Example:{" "}
                <code>https://your-app.com</code> — we will call{" "}
                <code>https://your-app.com/actuator/health</code> to verify connectivity.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}