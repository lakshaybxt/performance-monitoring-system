package com.monitoring.service.service;

import com.monitoring.service.domain.Alert;
import com.monitoring.service.domain.Application;
import com.monitoring.service.domain.Metrics;
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
   * - Memory usage above 85%
   * - Response time above 2000ms
   * If any condition is met, it creates an alert and saves to the database (deduplicated).
   * When a condition clears, the corresponding alert is auto-resolved.
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

      evaluateCpuAlert(app, metrics);
      evaluateMemoryAlert(app, metrics);
      evaluateResponseTimeAlert(app, metrics);
    }
  }

  private void evaluateCpuAlert(Application app, List<Metrics> metrics) {
    boolean breached = metrics.stream()
        .allMatch(m -> m.getCpuUsage() != null && m.getCpuUsage() > 0.8);
    evaluate(app, "CPU_HIGH", breached, "WARNING",
        "CPU usage above 80% for last 3 minutes",
        "CPU Alert for " + app.getName(),
        "CPU usage exceeded 80% for application: " + app.getName());
  }

  private void evaluateMemoryAlert(Application app, List<Metrics> metrics) {
    boolean breached = metrics.stream()
        .anyMatch(m -> m.getMemoryUsage() != null && m.getMemoryUsage() > 0.85);
    evaluate(app, "MEMORY_HIGH", breached, "WARNING",
        "Memory usage exceeded 85%",
        "Memory Alert for " + app.getName(),
        "Memory usage exceeded 85%: " + app.getName());
  }

  private void evaluateResponseTimeAlert(Application app, List<Metrics> metrics) {
    boolean breached = metrics.stream()
        .anyMatch(m -> m.getResponseTime() != null && m.getResponseTime() > 2000);
    evaluate(app, "RESPONSE_SLOW", breached, "WARNING",
        "Response time exceeded 2000 ms",
        "RESPONSE_SLOW Alert for " + app.getName(),
        "Response time exceeded 2000 ms: " + app.getName());
  }

  private void evaluate(Application app, String alertType, boolean breached, String severity,
                        String message, String emailSubject, String emailBody) {
    if (breached) {
      raiseAlert(app, alertType, severity, message, emailSubject, emailBody);
    } else {
      resolveAlert(app, alertType);
    }
  }

  private void raiseAlert(Application app, String alertType, String severity, String message,
                          String emailSubject, String emailBody) {
    // Deduplicate: only create if no unresolved alert of this type exists for this app
    Optional<Alert> existing = alertRepository.findByApplicationIdAndAlertTypeAndResolvedFalse(
        app.getId(), alertType);
    if (existing.isPresent()) {
      return;
    }

    Alert alert = Alert.builder()
        .application(app)
        .alertType(alertType)
        .message(message)
        .severity(severity)
        .resolved(false)
        .createdAt(LocalDateTime.now())
        .build();

    alertRepository.save(alert);

    // Send Kafka notification
    EmailEvent event = EmailEvent.builder()
        .userId(app.getUserId())
        .to(app.getEmail())
        .subject(emailSubject)
        .body(emailBody)
        .build();

    kafkaTemplate.send(NOTIFICATION_EMAIL_SEND, String.valueOf(app.getUserId()), event);

    log.warn("{} alert triggered for {}", alertType, app.getName());
  }

  private void checkApplicationHealth(Application app) {
    try {
      String url = app.getBaseUrl() + "/actuator/health";
      Map<String, Object> response = restTemplate.getForObject(url, Map.class);

      if (response == null) {
        return;
      }

      String status = String.valueOf(response.get("status"));
      boolean down = "DOWN".equalsIgnoreCase(status);

      evaluate(app, "APPLICATION_DOWN", down, "CRITICAL",
          "Application is DOWN",
          "Application DOWN: " + app.getName(),
          "Application is DOWN: " + app.getName());

      // On successful call, resolve UNREACHABLE if it was open
      if (!down) {
        resolveAlert(app, "APPLICATION_UNREACHABLE");
      }

    } catch (Exception e) {
      // HTTP call failed completely - mark as unreachable
      evaluate(app, "APPLICATION_UNREACHABLE", true, "CRITICAL",
          "Application unreachable",
          "Application Unreachable: " + app.getName(),
          "Application unreachable: " + app.getName());
    }
  }

  private void resolveAlert(Application app, String alertType) {
    Optional<Alert> existing = alertRepository.findByApplicationIdAndAlertTypeAndResolvedFalse(
        app.getId(), alertType);

    existing.ifPresent(alert -> {
      alert.setResolved(true);
      alert.setUpdatedAt(LocalDateTime.now());
      alertRepository.save(alert);
      log.info("{} alert resolved for {}", alertType, app.getName());
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
