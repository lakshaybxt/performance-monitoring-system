package com.monitoring.service.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "alerts",
    indexes = {
        @Index(name = "idx_alert_application", columnList = "application_id"),
        @Index(name = "idx_alert_created_at", columnList = "createdAt")
    }
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Alert {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "application_id", nullable = false)
  private Application application;

  @Column(nullable = false)
  private String alertType;

  @Column(nullable = false)
  private String message;

  @Column(nullable = false)
  private String severity;

  @Column(nullable = false)
  private Boolean resolved = false;

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