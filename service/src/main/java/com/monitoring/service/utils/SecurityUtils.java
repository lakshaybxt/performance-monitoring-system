package com.monitoring.service.utils;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SecurityUtils {

  public UUID getAuthenticatedUserId() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    if (auth == null || !auth.isAuthenticated()) {
      throw new AccessDeniedException("User is not authenticated");
    }

    try {
      return UUID.fromString((String) auth.getPrincipal());
    } catch (IllegalArgumentException e) {
      throw new AccessDeniedException("Invalid user ID format in token");
    }
  }
}
