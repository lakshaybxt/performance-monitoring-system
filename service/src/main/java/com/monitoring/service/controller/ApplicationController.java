package com.monitoring.service.controller;

import com.monitoring.service.dto.ApplicationRegistrationRequest;
import com.monitoring.service.dto.ApplicationRegistrationResponse;
import com.monitoring.service.service.ApplicationService;
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

  @PostMapping
  public ResponseEntity<Void> registerApplication(@RequestBody @Valid ApplicationRegistrationRequest request) {
    applicationService.registerApplication(request);
    return ResponseEntity.ok().build();
  }

  @GetMapping(path = "/{userId}")
  public ResponseEntity<List<ApplicationRegistrationResponse>> getRegisteredApplications(@PathVariable UUID userId) {
    List<ApplicationRegistrationResponse> applications = applicationService.getRegisteredApplicationsOfUser(userId);
    return ResponseEntity.ok(applications);
  }

  @GetMapping(path = "/all")
  public ResponseEntity<List<ApplicationRegistrationResponse>> getAllRegisteredApplications() {
    List<ApplicationRegistrationResponse> applications = applicationService.getAllApplications().stream()
        .map(app -> ApplicationRegistrationResponse.builder()
            .name(app.getName())
            .baseUrl(app.getBaseUrl())
            .userId(app.getUserId())
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
