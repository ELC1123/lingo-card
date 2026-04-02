package com.lingocard.backend.repository;

import com.lingocard.backend.model.Flashcard;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByHskLevel(int hskLevel);
}
