package com.lingocard.backend.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lingocard.backend.model.Card;
import com.lingocard.backend.repository.CardRepository;
import com.lingocard.backend.service.PokemonTCGService;

@RestController
@CrossOrigin(origins="http://localhost:5173") // Allow CORS for frontend running on this origin
@RequestMapping("/api/packs")
public class PackController {

    @Autowired
    private PokemonTCGService pokemonTCGService;

    @Autowired
    private CardRepository cardRepository;

    @PostMapping("/open-pack")
    public List<Card> openPack(@RequestParam(defaultValue = "me01") String set) {
        // sv8 = surging sparks
        List<Card> cards = pokemonTCGService.generateBoosterPack(set);
        return cardRepository.saveAll(cards); // Save generated cards to the database and return them
    }
}
