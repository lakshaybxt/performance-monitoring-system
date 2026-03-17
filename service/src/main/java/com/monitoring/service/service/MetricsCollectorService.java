package com.monitoring.service.service;

import com.monitoring.service.domain.Application;
import com.monitoring.service.domain.Metrics;
import com.monitoring.service.dto.MetricsResponse;
import com.monitoring.service.repos.ApplicationRepository;
import com.monitoring.service.repos.MetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsCollectorService {

  private final MetricRepository metricRepository;
  private final ApplicationRepository applicationRepository;
  private final RestTemplate restTemplate;

  /*
   * Collects metrics for all registered applications by calling their actuator endpoints.
   * For each application, it fetches CPU usage, memory usage, response time, and thread count,
   * then saves the collected metrics to the database.
   */
  public void collectMetricsForAllApplications() {
    log.info("Collecting metrics for all applications");

    List<Application> applications = applicationRepository.findAll();

    for (Application app : applications) {

      String baseUrl = app.getBaseUrl();

      try {

        Double cpu = fetchCpuUsage(baseUrl);
        Double memory = fetchMemoryUsage(baseUrl);
        Double responseTime = fetchResponseTime(baseUrl);
        Integer threads = fetchThreadCount(baseUrl);

        Metrics metrics = Metrics.builder()
            .application(app)
            .cpuUsage(cpu)
            .memoryUsage(memory)
            .responseTime(responseTime)
            .threadCount(threads)
            .build();

        metricRepository.save(metrics);
        log.info("Metrics collected for application: {}", app.getName());
      } catch (Exception e) {
        log.error("Failed to fetch metrics for {}", baseUrl);
      }
    }
  }

  /*
   * Fetches response time from the target application's actuator endpoint.
   * Expects the response to contain a "measurements" array with a "value" field.
   *
   * @param baseUrl The base URL of the target application
   * @return The response time as a double, or null if fetching fails
   */
  private Double fetchResponseTime(String baseUrl) {

    String url = baseUrl + "/actuator/metrics/http.server.requests";

    return getaDouble(url);
  }

  /*
   * Helper method to fetch a double value from a given actuator endpoint URL.
   * Expects the response to contain a "measurements" array with a "value" field.
   *
   * @param url The full URL of the actuator endpoint
   * @return The extracted double value, or null if fetching fails
   */
  private Double getaDouble(String url) {
    Map<String, Object> response = restTemplate.getForObject(url, Map.class);

    if (response == null || !response.containsKey("measurements")) {
      return null;
    }

    List<Map<String, Object>> measurements =
        (List<Map<String, Object>>) response.get("measurements");

    if (measurements.isEmpty()) {
      return null;
    }

    return ((Number) measurements.get(0).get("value")).doubleValue();
  }

  /*
   * Fetches thread count from the target application's actuator endpoint.
   * Expects the response to contain a "measurements" array with a "value" field.
   *
   * @param baseUrl The base URL of the target application
   * @return The thread count as an integer, or null if fetching fails
   */
  private Integer fetchThreadCount(String baseUrl) {

    String url = baseUrl + "/actuator/metrics/jvm.threads.live";

    Map<String, Object> response = restTemplate.getForObject(url, Map.class);

    if (response == null || !response.containsKey("measurements")) {
      return null;
    }

    List<Map<String, Object>> measurements =
        (List<Map<String, Object>>) response.get("measurements");

    if (measurements.isEmpty()) {
      return null;
    }

    return ((Number) measurements.get(0).get("value")).intValue();
  }

  /*
   * Fetches memory usage from the target application's actuator endpoint.
   * Expects the response to contain a "measurements" array with a "value" field.
   *
   * @param baseUrl The base URL of the target application
   * @return The memory usage as a double, or null if fetching fails
   */
  private Double fetchMemoryUsage(String baseUrl) {

    String url = baseUrl + "/actuator/metrics/jvm.memory.used";

    return getaDouble(url);
  }

  /*
   * Fetches CPU usage from the target application's actuator endpoint.
   * Expects the response to contain a "measurements" array with a "value" field.
   *
   * @param baseUrl The base URL of the target application
   * @return The CPU usage as a double, or null if fetching fails
   */
  private Double fetchCpuUsage(String baseUrl) {

    String url = baseUrl + "/actuator/metrics/system.cpu.usage";

    return getaDouble(url);
  }

  /*
   * Fetches health status from the target application's actuator endpoint.
   * Expects the response to contain a "status" field.
   *
   * @param baseUrl The base URL of the target application
   * @return The health status as a string, or null if fetching fails
   */
  private String fetchHealth(String baseUrl) {

    String url = baseUrl + "/actuator/health";

    Map<String, Object> response = restTemplate.getForObject(url, Map.class);

    return (String) response.get("status");
  }

  public Page<MetricsResponse> getMetrics(UUID applicationId, Pageable pageable) {
    return metricRepository.findByApplicationId(applicationId, pageable)
        .map(metrics -> MetricsResponse.builder()
            .id(metrics.getId())
            .applicationId(metrics.getApplication().getId())
            .cpuUsage(metrics.getCpuUsage())
            .memoryUsage(metrics.getMemoryUsage())
            .responseTime(metrics.getResponseTime())
            .threadCount(metrics.getThreadCount())
            .createdAt(metrics.getCreatedAt())
            .build());
  }

  /*
   * Fetches recent metrics for a specific application after a given timestamp.
   * Validates that the requesting user is authorized to access the application's metrics.
   *
   * @param applicationId The ID of the application for which to fetch metrics
   * @param time The timestamp after which to fetch metrics
   * @param userId The ID of the user making the request, used for authorization
   * @return A list of Metrics objects that match the criteria
   * @throws RuntimeException if the application is not found or if the user is unauthorized
   */
  public List<Metrics> getRecentMetrics(UUID applicationId, LocalDateTime time, String userId) {

    Application app = applicationRepository
        .findById(applicationId)
        .orElseThrow(() -> new RuntimeException("Application not found"));

    if (!app.getUserId().equals(UUID.fromString(userId))) {
      throw new RuntimeException("Unauthorized access");
    }

    return metricRepository
        .findTop200ByApplicationIdAndCreatedAtAfterOrderByCreatedAtAsc(
            applicationId,
            time
        );

  }
}
