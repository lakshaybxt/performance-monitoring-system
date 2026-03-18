package com.monitoring.api_gateway.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class FallbackController {

  @GetMapping("/authServiceFallback")
  public Mono<String> authServiceFallback() {
    return Mono.just("Authentication Service is currently unavailable. Please try again later.");
  }

  @GetMapping("/monitoringServiceFallback")
  public Mono<String> monitoringServiceFallback() {
    return Mono.just("Monitoring Service is currently unavailable. Please try again later.");
  }

  @GetMapping("/notificationServiceFallback")
  public Mono<String> notificationServiceFallback() {
    return Mono.just("Notification Service is currently unavailable. Please try again later.");
  }
}
