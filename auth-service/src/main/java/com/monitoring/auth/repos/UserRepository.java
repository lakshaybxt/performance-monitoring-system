package com.monitoring.auth.repos;

import com.monitoring.auth.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for User persistence operations.
 */
public interface UserRepository extends JpaRepository<User, UUID> {
    /**
     * Check if an email is already registered.
     */
    boolean existsByEmail(String email);
    /**
     * Check if a username is already taken.
     */
    boolean existsByUsername(String username);
    /**
     * Find a user by email.
     */
    Optional<User> findByEmail(String email);
}
