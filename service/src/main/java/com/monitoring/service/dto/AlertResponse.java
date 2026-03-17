package com.monitoring.service.dto;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record AlertResponse(
     UUID id,
     UUID applicationId,
     String alertType,
     String message,
     String severity,
     Boolean resolved,
     LocalDateTime createdAt
) {
}
