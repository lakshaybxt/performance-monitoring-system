package com.monitoring.service.repos;

import com.monitoring.service.domain.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
  Optional<Alert> findByApplicationIdAndAlertTypeAndResolvedFalse(UUID applicationId, String alertType);

  @Modifying
  @Query("""
      DELETE FROM Alert a
      WHERE a.resolved = true
      AND a.updatedAt < :time
      """)
  void deleteResolvedAlerts(LocalDateTime time);

  Page<Alert> findByApplicationId(UUID applicationId, Pageable pageable);
}
