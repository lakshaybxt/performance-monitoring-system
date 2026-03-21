package com.monitoring.service.service;

import com.monitoring.service.domain.Application;
import com.monitoring.service.dto.ApplicationRegistrationRequest;
import com.monitoring.service.dto.ApplicationRegistrationResponse;
import com.monitoring.service.repos.AlertRepository;
import com.monitoring.service.repos.ApplicationRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

  private final ApplicationRepository applicationRepository;
  private final AlertRepository alertRepository;

  @Transactional
  public void registerApplication(ApplicationRegistrationRequest request, UUID userId) {
    log.info("Registering application: {}", request.getName());

    Application app = Application.builder()
        .name(request.getName())
        .baseUrl(request.getBaseUrl())
        .email(request.getEmail())
        .userId(userId)
        .build();

    applicationRepository.save(app);

    log.info("Application registered successfully: {}", request.getName());
  }

  public List<ApplicationRegistrationResponse> getRegisteredApplicationsOfUser(UUID userId) {
    log.info("Fetching registered applications for user: {}", userId);

    List<Application> applications = applicationRepository.findByUserId(userId);

    if(applications == null || applications.isEmpty()) {
      log.info("No applications found for user: {}", userId);
      return List.of();
    }

    List<ApplicationRegistrationResponse> response = applications.stream()
        .map(app -> ApplicationRegistrationResponse.builder()
            .name(app.getName())
            .baseUrl(app.getBaseUrl())
            .id(app.getId())
            .email(app.getEmail())
            .build())
        .toList();

    log.info("Found {} applications for user: {}", response.size(), userId);

    return response;
  }

  public List<Application> getAllApplications() {
    log.info("Fetching all registered applications");
    return applicationRepository.findAll();
  }

  @Transactional
  public void deleteApplication(UUID applicationId) {
    log.info("Deleting application with ID: {}", applicationId);
    applicationRepository.deleteById(applicationId);
    log.info("Application deleted successfully with ID: {}", applicationId);
  }
}
