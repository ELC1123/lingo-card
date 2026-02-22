package com.lingocard.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.lingocard.backend.model.MasterCard;

/**
 * Repository for master library of cards. The method `findBySetCode` is used by the
 * service layer to load all master cards for a specific set when building packs.
 */
public interface MasterCardRepository extends JpaRepository<MasterCard, Long> {
    /**
     * Find master cards belonging to a particular set code.
     * @param setCode set identifier (e.g., "me01")
     */
    List<MasterCard> findBySetCode(String setCode);
}
