package com.monitoring.service.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "metrics",
    indexes = {
        @Index(name = "idx_metrics_application", columnList = "application_id"),
        @Index(name = "idx_metrics_timestamp", columnList = "createdAt")
    }
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Metrics {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "application_id", nullable = false)
  private Application application;

  private Double cpuUsage;
  private Double memoryUsage;
  private Double responseTime;
  private Integer threadCount;

  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;


  @PrePersist
  public void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  public void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

}
