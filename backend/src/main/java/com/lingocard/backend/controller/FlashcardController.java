package com.lingocard.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lingocard.backend.model.Flashcard;
import com.lingocard.backend.repository.FlashcardRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/flashcards")
@RequiredArgsConstructor
public class FlashcardController {
    private final FlashcardRepository flashcardRepository;
    
    @GetMapping
    public ResponseEntity<List<Flashcard>> getFlashcardsByLevel(@RequestParam(defaultValue = "1") int level) {
        List<Flashcard> cards = flashcardRepository.findByHskLevel(level);
        return ResponseEntity.ok(cards);
    }
}
