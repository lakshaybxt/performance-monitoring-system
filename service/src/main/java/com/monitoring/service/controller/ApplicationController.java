package com.monitoring.service.controller;

import com.monitoring.service.dto.ApplicationRegistrationRequest;
import com.monitoring.service.dto.ApplicationRegistrationResponse;
import com.monitoring.service.service.ApplicationService;
import com.monitoring.service.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationController {

  private final ApplicationService applicationService;
  private final SecurityUtils securityUtils;

  @PostMapping
  public ResponseEntity<Void> registerApplication(@RequestBody @Valid ApplicationRegistrationRequest request) {
    UUID userId = securityUtils.getAuthenticatedUserId();
    applicationService.registerApplication(request, userId);
    return ResponseEntity.ok().build();
  }

  @GetMapping
  public ResponseEntity<List<ApplicationRegistrationResponse>> getRegisteredUserApplications() {
    UUID userId = securityUtils.getAuthenticatedUserId();
    List<ApplicationRegistrationResponse> applications = applicationService.getRegisteredApplicationsOfUser(userId);
    return ResponseEntity.ok(applications);
  }

  @GetMapping(path = "/all")
  public ResponseEntity<List<ApplicationRegistrationResponse>> getAllRegisteredApplications() {
    List<ApplicationRegistrationResponse> applications = applicationService.getAllApplications().stream()
        .map(app -> ApplicationRegistrationResponse.builder()
            .name(app.getName())
            .baseUrl(app.getBaseUrl())
            .id(app.getId())
            .email(app.getEmail())
            .build())
        .toList();
    return ResponseEntity.ok(applications);
  }

  @DeleteMapping(path = "/{applicationId}")
  public ResponseEntity<Void> deleteApplication(@PathVariable UUID applicationId) {
    applicationService.deleteApplication(applicationId);
    return ResponseEntity.ok().build();
  }
}
