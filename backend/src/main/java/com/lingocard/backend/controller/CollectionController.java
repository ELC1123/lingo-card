package com.lingocard.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lingocard.backend.model.Card;
import com.lingocard.backend.repository.CardRepository;

import lombok.RequiredArgsConstructor;

/**
 * Controller exposing the user's card collection endpoints.
 *
 * Currently exposes a simple endpoint to retrieve all persisted `Card` entities.
 */
@RestController
@RequestMapping("/api/collection")
@RequiredArgsConstructor
public class CollectionController {
    
    // Repository backing the collection endpoints
    private final CardRepository cardRepository;

    /**
     * GET /api/collection
     * Retrieve all cards in the user's collection. Consider adding pagination
     * if the collection grows large to avoid sending huge responses.
     */
    @GetMapping
    public List<Card> getCollection() {
        return cardRepository.findAll();
    }
}
