package com.monitoring.service.scheduler;

import com.monitoring.service.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertScheduler {

  private final AlertService alertService;

  @Scheduled(fixedRate = 60000)
  public void checkAlerts() {
    log.info("Starting alert check job");

    alertService.checkAlertsForAllApplications();

    log.info("Alert check completed");

  }
}
