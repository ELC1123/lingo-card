package com.lingocard.backend.repository;

import com.lingocard.backend.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository abstraction for persisting `Card` entities.
 *
 * Extends `JpaRepository` to inherit common CRUD methods for convenience.
 */
@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    // Additional query methods can be declared here when needed (e.g., findBySetCode)
}
