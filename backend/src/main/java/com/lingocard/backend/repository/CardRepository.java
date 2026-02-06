package com.lingocard.backend.repository;

import com.lingocard.backend.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    // This interface will automatically inherit basic CRUD operations for Card entities
    // CRUD - Create, Read, Update, Delete
}
