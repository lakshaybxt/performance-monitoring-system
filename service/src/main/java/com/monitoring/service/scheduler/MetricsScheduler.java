package com.monitoring.service.scheduler;

import com.monitoring.service.service.MetricsCollectorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MetricsScheduler {

  private final MetricsCollectorService metricsCollectorService;

  @Scheduled(fixedRate = 60000)
  public void collectMetrics() {
    log.info("Starting metrics collection job");

    metricsCollectorService.collectMetricsForAllApplications();

    log.info("Metrics collection completed");

  }
}
