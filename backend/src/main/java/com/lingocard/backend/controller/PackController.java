package com.lingocard.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.lingocard.backend.model.Card;
import com.lingocard.backend.model.User;
import com.lingocard.backend.repository.CardRepository;
import com.lingocard.backend.repository.UserRepository;
import com.lingocard.backend.service.PokemonTCGService;
import com.lingocard.backend.service.SseService;

import lombok.RequiredArgsConstructor;

/**
 * Controller responsible for pack-related endpoints.
 *
 * Exposes an endpoint to "open" a booster pack which uses the service to generate cards
 * and stores the resulting cards in the user's collection (database).
 */
@RestController
@RequestMapping("/api/packs")
@RequiredArgsConstructor
public class PackController {

    // Service used to generate booster pack contents
    private final PokemonTCGService pokemonTCGService;

    // Repository to persist cards into the collection table
    private final CardRepository cardRepository;
    private final SseService sseService;
    private final UserRepository userRepository;

    /**
     * Opens a booster pack from the specified set and saves the pulled cards.
     * @param set set code to open (defaults to 'me01')
     * @return list of saved `Card` entities representing the opened pack
     */
    @PostMapping("/open-pack")
    public ResponseEntity<?> openPack(@RequestParam(defaultValue = "me01") String set) {
        // Use the service to generate a pack (business logic encapsulated in the service layer)
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));

        // check coin count
        int PACK_COST = 100;
        if(user.getCoins() < PACK_COST) {
            return ResponseEntity.badRequest().body("Not enough coins to open pack");
        }

        // subtract coins and save
        user.setCoins(user.getCoins() - PACK_COST);
        userRepository.save(user);

        // generate pack and save cards
        List<Card> cards = pokemonTCGService.generateBoosterPack(set);
        List<Card> savedCards = cardRepository.saveAll(cards);

        return ResponseEntity.ok(savedCards);
    }

    /**
     * Shows progress of fetching cards from a set
     * @return progress of fetching cards
     */
    @GetMapping("/stream-progress")
    public SseEmitter streamProgress() {
        return sseService.createEmitter();
    }
}
