package com.lingocard.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingocard.backend.model.MasterCard;

public interface MasterCardRepository extends JpaRepository<MasterCard, Long> {
    List<MasterCard> findBySetCode(String setCode);
}
