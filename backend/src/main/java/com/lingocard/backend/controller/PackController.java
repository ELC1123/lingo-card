package com.lingocard.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lingocard.backend.model.Card;
import com.lingocard.backend.repository.CardRepository;
import com.lingocard.backend.service.PokemonTCGService;

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

    /**
     * Opens a booster pack from the specified set and saves the pulled cards.
     * @param set set code to open (defaults to 'me01')
     * @return list of saved `Card` entities representing the opened pack
     */
    @PostMapping("/open-pack")
    public List<Card> openPack(@RequestParam(defaultValue = "me01") String set) {
        // Use the service to generate a pack (business logic encapsulated in the service layer)
        List<Card> cards = pokemonTCGService.generateBoosterPack(set);

        // Persist generated cards and return persisted entities to the client
        return cardRepository.saveAll(cards);
    }
}
