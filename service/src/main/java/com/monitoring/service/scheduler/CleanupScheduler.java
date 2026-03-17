package com.monitoring.service.scheduler;

import com.monitoring.service.service.CleanupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class CleanupScheduler {

  private final CleanupService cleanupService;

  @Scheduled(cron = "0 0 3 * * *")
  public void runCleanup() {

    log.info("Starting metrics cleanup job");

    cleanupService.cleanupOldMetrics();

    log.info("Metrics cleanup completed");

    log.info("Starting alert cleanup job");

    cleanupService.cleanupOldAlerts();

    log.info("Alert cleanup completed");

  }
}
