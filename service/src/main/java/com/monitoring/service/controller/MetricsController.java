package com.monitoring.service.controller;

import com.monitoring.service.domain.Metrics;
import com.monitoring.service.dto.MetricsResponse;
import com.monitoring.service.service.MetricsCollectorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/metrics")
public class MetricsController {

  private final MetricsCollectorService metricsService;

  @GetMapping("/{applicationId}")
  public Page<MetricsResponse> getMetrics(
      @PathVariable UUID applicationId,
      @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC)
      Pageable pageable) {

    return metricsService.getMetrics(applicationId, pageable);
  }
}
