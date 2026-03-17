package com.monitoring.service.controller;

import com.monitoring.service.domain.Alert;
import com.monitoring.service.dto.AlertResponse;
import com.monitoring.service.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/alerts")
public class AlertsController {

  private final AlertService alertService;

  @GetMapping("/{applicationId}")
  public ResponseEntity<Page<AlertResponse>> getAlerts(
      @PathVariable UUID applicationId,
      @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC)
      Pageable pageable) {

    Page<Alert> alertsPage = alertService.getAlerts(applicationId, pageable);
    Page<AlertResponse> responses = alertsPage.map(alert ->  AlertResponse.builder()
        .id(alert.getId())
        .applicationId(alert.getApplication().getId())
        .alertType(alert.getAlertType())
        .message(alert.getMessage())
        .severity(alert.getSeverity())
        .resolved(alert.getResolved())
        .createdAt(alert.getCreatedAt())
        .build());

    return ResponseEntity.ok(responses);
  }
}
