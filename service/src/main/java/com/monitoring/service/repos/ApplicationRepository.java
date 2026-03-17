package com.monitoring.service.repos;

import com.monitoring.service.domain.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
  List<Application> findByUserId(UUID userId);
}
