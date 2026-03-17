package com.monitoring.service.service;

import com.monitoring.service.repos.AlertRepository;
import com.monitoring.service.repos.MetricRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CleanupService {

  private final MetricRepository metricRepository;
  private final AlertRepository alertRepository;

  @Transactional
  public void cleanupOldMetrics() {

    LocalDateTime cutoff = LocalDateTime.now().minusDays(7);

    log.info("Deleting metrics older than {}", cutoff);

    metricRepository.deleteOlderThan(cutoff);

    log.info("Old metrics cleanup completed");
  }

  @Transactional
  public void cleanupOldAlerts() {

    LocalDateTime cutoff = LocalDateTime.now().minusDays(30);

    log.info("Deleting alerts older than {}", cutoff);

    alertRepository.deleteResolvedAlerts(cutoff);

    log.info("Old alerts cleanup completed");
  }
}
