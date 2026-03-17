package com.monitoring.service.controller;

import com.monitoring.service.domain.Alert;
import com.monitoring.service.domain.Metrics;
import com.monitoring.service.dto.AlertResponse;
import com.monitoring.service.service.AlertService;
import com.monitoring.service.service.MetricsCollectorService;
import org.springframework.security.oauth2.jwt.Jwt;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class MonitoringQueryResolver {

  private final MetricsCollectorService metricService;
  private final AlertService alertService;

  @QueryMapping
  public List<Metrics> metrics(
      @Argument UUID applicationId,
      @Argument int minutes,
      Authentication authentication
  ) {

    Jwt jwt = (Jwt) authentication.getPrincipal();

    String userId = jwt.getClaim("userId");
    LocalDateTime time = LocalDateTime.now().minusMinutes(minutes);

    return metricService.getRecentMetrics(applicationId, time, userId);
  }

  @QueryMapping
  public List<Alert> alerts(
      @Argument UUID applicationId,
      @Argument int limit,
      @Argument int offset
  ) {

    limit = Math.max(1, Math.min(limit, 100));
    Pageable pageable = PageRequest.of(offset / limit, limit);

    return alertService.getAlerts(applicationId, pageable).stream().toList();
  }
}
