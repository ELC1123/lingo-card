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

@RestController
@CrossOrigin(origins="http://localhost:5173") // Allow CORS for frontend running on this origin
@RequestMapping("/api/packs")
public class PackController {

    @Autowired
    private CardRepository cardRepository;

    // Define endpoints for managing packs here
    // Only temporary, will change to actually generate packs later
    private final String[] COMMONS = {"Pikachu", "Bulbasaur", "Charmander", "Squirtle"};
    private final String[] UNCOMMONS = {"Jigglypuff", "Meowth", "Psyduck", "Machop"};
    private final String[] RARES = {"Dragonite", "Gyarados", "Snorlax", "Lapras"};
    private final String[] ULTRA_RARES = {"Mewtwo", "Lugia", "Ho-Oh", "Rayquaza"}; 

    // Endpoint to open a pack
    @PostMapping("/open-pack")
    public List<Card> openPack(@RequestParam(defaultValue = "surging-sparks") String set) {
        // Generate a pack of 5 cards
        List<Card> pack = new ArrayList<>();
        Random rand = new Random();
        
        // Check for God Pack first
        int godPackRoll = rand.nextInt(1000);
        if(godPackRoll == 0) { // 0.1% chance for God Pack
            // Add 5 Ultra Rare cards
            for (int i = 0; i < 5; i++) {
                pack.add(generateCard(ULTRA_RARES, "Ultra Rare", set, rand));
            }
            return pack;
        }

        // Regular pack generation
        // SLOTS 1 - 3 - COMMON
        for (int i = 0; i < 3; i++) {
            pack.add(generateCard(COMMONS, "Common", set, rand));
        }

        // SLOT 4 - UNCOMMON
        pack.add(generateCard(UNCOMMONS, "Uncommon", set, rand));

        // SLOT 5 - RARE or BETTER
        int rareRoll = rand.nextInt(100);
        if (rareRoll < 80) { // 80% chance for Rare
            pack.add(generateCard(RARES, "Rare", set, rand));
        } else { // 20% chance for Ultra Rare
            pack.add(generateCard(ULTRA_RARES, "Ultra Rare", set, rand)); 
        }  
        return pack;
    }

    /**
     * Generates a card with given parameters
     * @param pool      The array of card names to choose from
     * @param rarity    The rarity of the card to generate
     * @param set       The set code of the card to generate
     * @param rand      The random number generator to use
     * @return          The generated card
     */
    public Card generateCard(String[] pool, String rarity, String set, Random rand) {
        // Create new card
        Card card = new Card();
        card.setName(pool[rand.nextInt(pool.length)]);
        card.setRarity(rarity);
        card.setSetCode(set);

        // Temporary image URL generation
        card.setImageUrl("https://images.pokemontcg.io/base1/" + (rand.nextInt(50) + 1) + ".png");

        return card;
    }
}
