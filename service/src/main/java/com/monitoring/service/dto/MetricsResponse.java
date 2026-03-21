package com.monitoring.service.dto;


import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record MetricsResponse(
     UUID id,
     UUID applicationId,
     Double cpuUsage,
     Double memoryUsage,
     Double responseTime,
     Integer threadCount,
     LocalDateTime createdAt
) {}
