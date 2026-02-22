package com.lingocard.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lingocard.backend.model.Card;
import com.lingocard.backend.repository.CardRepository;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin(origins="http://localhost:5173") // Allow CORS for frontend running on this origin
@RequestMapping("/api/collection")
@RequiredArgsConstructor
public class CollectionController {
    
    private final CardRepository cardRepository;

    @GetMapping
    public List<Card> getCollection() {
        return cardRepository.findAll(); // Return all cards in the collection
    }
}
