package com.monitoring.service.service;

import com.monitoring.service.domain.Alert;
import com.monitoring.service.domain.Application;
import com.monitoring.service.domain.Metrics;
import com.monitoring.service.dto.AlertResponse;
import com.monitoring.service.kafka.events.EmailEvent;
import com.monitoring.service.repos.AlertRepository;
import com.monitoring.service.repos.ApplicationRepository;
import com.monitoring.service.repos.MetricRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static com.monitoring.service.kafka.topics.KafkaTopics.NOTIFICATION_EMAIL_SEND;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

  private final MetricRepository metricRepository;
  private final ApplicationRepository applicationRepository;
  private final RestTemplate restTemplate;
  private final AlertRepository alertRepository;
  private final KafkaTemplate<String, EmailEvent> kafkaTemplate;

  /*
   * Checks for alerts across all applications by analyzing recent metrics.
   * For each application, it retrieves metrics from the last 3 minutes and checks for conditions like:
   * - CPU usage above 80%
   * - Memory usage above 90%
   * - Response time above 500ms
   * If any condition is met, it creates an alert and saves it to the database.
   */
  public void checkAlertsForAllApplications() {
    List<Application> applications = applicationRepository.findAll();

    for (Application app : applications) {

      checkApplicationHealth(app);

      List<Metrics> metrics = metricRepository.findRecentMetrics(
          app.getId(),
          LocalDateTime.now().minusMinutes(3)
      );

      if (metrics.isEmpty()) {
        continue;
      }

      checkCpuAlert(app, metrics);
      checkMemoryAlert(app, metrics);
      checkResponseTimeAlert(app, metrics);
    }
  }

  private void checkCpuAlert(Application app, List<Metrics> metrics) {
    boolean highCpu = metrics.stream()
        .allMatch(m -> m.getCpuUsage() != null && m.getCpuUsage() > 0.8);

    if (highCpu) {

      Alert alert = Alert.builder()
          .application(app)
          .alertType("CPU_HIGH")
          .message("CPU usage above 80% for last 3 minutes")
          .severity("WARNING")
          .resolved(false)
          .createdAt(LocalDateTime.now())
          .build();

      alertRepository.save(alert);

      EmailEvent event = EmailEvent.builder()
          .userId(app.getId())
          .to(app.getEmail())
          .subject("CPU Alert for " + app.getName())
          .body("CPU usage exceeded 80% for application: " + app.getName())
          .build();

      kafkaTemplate.send(NOTIFICATION_EMAIL_SEND, String.valueOf(app.getUserId()), event);

      log.warn("CPU alert triggered for {}", app.getName());
    }
  }

  private void checkMemoryAlert(Application app, List<Metrics> metrics) {
    boolean highMemory = metrics.stream()
        .anyMatch(m -> m.getMemoryUsage() != null && m.getMemoryUsage() > 0.85);

    if (highMemory) {

      Alert alert = Alert.builder()
          .application(app)
          .alertType("MEMORY_HIGH")
          .message("Memory usage exceeded 85%")
          .severity("WARNING")
          .resolved(false)
          .createdAt(LocalDateTime.now())
          .build();

      alertRepository.save(alert);

      EmailEvent event = EmailEvent.builder()
          .userId(app.getId())
          .to(app.getEmail())
          .subject("Memory Alert for " + app.getName())
          .body("Memory usage exceeded 85%: " + app.getName())
          .build();

      kafkaTemplate.send(NOTIFICATION_EMAIL_SEND, String.valueOf(app.getUserId()), event);

      log.info("Memory usage alert triggered for {}", app.getName());
    }
  }

  private void checkResponseTimeAlert(Application app, List<Metrics> metrics) {

    boolean slowResponse = metrics.stream()
        .anyMatch(m -> m.getResponseTime() != null && m.getResponseTime() > 2000);

    if (slowResponse) {

      Alert alert = Alert.builder()
          .application(app)
          .alertType("RESPONSE_SLOW")
          .message("Response time exceeded 2000 ms")
          .severity("WARNING")
          .resolved(false)
          .createdAt(LocalDateTime.now())
          .build();

      alertRepository.save(alert);

      EmailEvent event = EmailEvent.builder()
          .userId(app.getId())
          .to(app.getEmail())
          .subject("RESPONSE_SLOW Alert for " + app.getName())
          .body("Response time exceeded 2000 ms: " + app.getName())
          .build();

      kafkaTemplate.send(NOTIFICATION_EMAIL_SEND, String.valueOf(app.getUserId()), event);

      log.info("Response time alert triggered for {}", app.getName());
    }
  }

  private void checkApplicationHealth(Application app) {
    try {
      String url = app.getBaseUrl() + "/actuator/health";

      Map<String, Object> response = restTemplate.getForObject(url, Map.class);

      if (response == null) {
        return;
      }

      String status = (String) response.get("status");

      if ("DOWN".equalsIgnoreCase(status)) {

        Optional<Alert> existing =
            alertRepository.findByApplicationIdAndAlertTypeAndResolvedFalse(
                app.getId(),
                "APPLICATION_DOWN"
            );

        if (existing.isEmpty()) {

          Alert alert = Alert.builder()
              .application(app)
              .alertType("APPLICATION_DOWN")
              .message("Application is DOWN")
              .severity("CRITICAL")
              .createdAt(LocalDateTime.now())
              .resolved(false)
              .build();

          alertRepository.save(alert);

          log.error("Application DOWN detected: {}", app.getName());
        } else {
          resolveAlert(app, "APPLICATION_DOWN");
        }

      }
    } catch (Exception e) {

        /*
         If the HTTP call fails completely,
         the application is also considered DOWN
        */

      Optional<Alert> existing =
          alertRepository.findByApplicationIdAndAlertTypeAndResolvedFalse(
              app.getId(),
              "APPLICATION_UNREACHABLE"
          );

      if (existing.isEmpty()) {

        Alert alert = Alert.builder()
            .application(app)
            .alertType("APPLICATION_UNREACHABLE")
            .message("Application unreachable")
            .severity("CRITICAL")
            .resolved(false)
            .createdAt(LocalDateTime.now())
            .build();

        alertRepository.save(alert);
      }
    }
  }

  private void resolveAlert(Application app, String alertType) {
    Optional<Alert> existing =
        alertRepository.findByApplicationIdAndAlertTypeAndResolvedFalse(
            app.getId(),
            alertType
        );

    existing.ifPresent(alert -> {
      alert.setResolved(true);
      alert.setUpdatedAt(LocalDateTime.now());
      alertRepository.save(alert);
    });
  }

  public Page<Alert> getAlerts(UUID applicationId, Pageable pageable) {

    Page<Alert> alerts = alertRepository.findByApplicationId(applicationId, pageable);

    if (alerts.isEmpty()) {
      log.warn("No alerts found for application {}", applicationId);
    }

    return alerts;
  }
}
