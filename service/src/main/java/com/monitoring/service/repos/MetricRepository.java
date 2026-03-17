package com.monitoring.service.repos;

import com.monitoring.service.domain.Metrics;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MetricRepository extends JpaRepository<Metrics, UUID> {
  @Query("""
      SELECT m FROM Metrics m
      WHERE m.application.id = :appId
      AND m.createdAt >= :time
      """)
  List<Metrics> findRecentMetrics(UUID appId, LocalDateTime time);

  @Modifying
  @Query("""
      DELETE FROM Metrics m
      WHERE m.createdAt < :time
      """)
  void deleteOlderThan(LocalDateTime time);

  Page<Metrics> findByApplicationId(UUID applicationId, Pageable pageable);

  List<Metrics> findTop200ByApplicationIdAndCreatedAtAfterOrderByCreatedAtAsc(
      UUID applicationId,
      LocalDateTime time
  );
}
