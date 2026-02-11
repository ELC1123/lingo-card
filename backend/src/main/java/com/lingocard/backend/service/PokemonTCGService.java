package com.lingocard.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jackson.autoconfigure.JacksonProperties.Json;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.lingocard.backend.model.Card;
import com.lingocard.backend.repository.CardRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PokemonTCGService {

    @Autowired
    private CardRepository cardRepository;

    // Base URL for the Pokemon TCG API
    private final String API_BASE_URL = "https://api.tcgdex.net/v2/en";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Generates a booster pack of 5 random cards from the specified set.
     * @param setCode   The set code for the Pokemon TCG set
     * @return          A list of 5 randomly selected cards from the specified set
     */
    public List<Card> generateBoosterPack(String setCode) {
        List<Card> cachedCards = cardRepository.findAll().stream()
            .filter(c -> setCode.equals(c.getSetCode()))
            .collect(Collectors.toList());

        if(cachedCards.isEmpty()) {
            System.out.println("Caching set " + setCode + " for the first time...");
            cacheSet(setCode);
            cachedCards = cardRepository.findAll().stream()
                .filter(c -> setCode.equals(c.getSetCode()))
                .collect(Collectors.toList());
        }

        // Bucket the Local data
        List<Card> commons = new ArrayList<>();
        List<Card> uncommons = new ArrayList<>();
        List<Card> rarePlus = new ArrayList<>();

        // Sort cards into buckets based on rarity
        for (Card c : cachedCards) {
            switch (c.getRarity().toLowerCase()) {
                case "common":
                    commons.add(c);
                    break;
                case "uncommon":
                    uncommons.add(c);
                    break;
                default:
                    rarePlus.add(c);
            }
        }

        List<Card> boosterPack = new ArrayList<>();
        Random rand = new Random();

        // Pick 3 commons, 1 uncommon, and 1 rare+ card
        if (!commons.isEmpty()) {
            for (int i = 0; i < 3; i++) {
                boosterPack.add(commons.get(rand.nextInt(commons.size())));
            }
        } 
        if (!uncommons.isEmpty()) {
            boosterPack.add(uncommons.get(rand.nextInt(uncommons.size())));
        }
        if (!rarePlus.isEmpty()) {
            boosterPack.add(rarePlus.get(rand.nextInt(rarePlus.size())));
        }

        // If we couldn't fill the pack properly, fill the rest with random cards from the set
        while(boosterPack.size() < 5 && !cachedCards.isEmpty()) {
            boosterPack.add(cachedCards.get(rand.nextInt(cachedCards.size())));
        }

        return boosterPack;
    }

    private void cacheSet(String setCode) {
        String url = "https://api.tcgdex.net/v2/en/cards?set=" + setCode;
        try {
            JsonNode cardsArray = fetchFromApi(url);
            for(JsonNode node : cardsArray) {
                String cardId = node.path("id").asText();
                JsonNode fullCardData = fetchFromApi(API_BASE_URL + "/cards/" + cardId);

                Card card = new Card();
                card.setName(node.path("name").asText("Unknown"));
                card.setSetCode(setCode);
                card.setRarity(fullCardData.path("rarity").asText("Unknown"));

                String imageBase = node.path("image").asText("");
                card.setImageUrl(imageBase + (imageBase.isEmpty() ? "" : "/high.webp"));

                cardRepository.save(card);
            }
        } catch (Exception e) {
            System.out.println("⚠️ Caching failed: " + e.getMessage());
        }
    }

    // Helper method to handle HTTP calls cleanly
    private JsonNode fetchFromApi(String url) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        return objectMapper.readTree(response.getBody());
    } 

    // A robust backup pack with CORRECT images
    private List<Card> getBackupPack() {
        List<Card> backup = new ArrayList<>();
        
        // Add specific cards with valid URLs
        backup.add(createBackupCard("Pikachu", "Common", "https://images.pokemontcg.io/base1/58.png"));
        backup.add(createBackupCard("Charmander", "Common", "https://images.pokemontcg.io/base1/46.png"));
        backup.add(createBackupCard("Squirtle", "Common", "https://images.pokemontcg.io/base1/63.png"));
        backup.add(createBackupCard("Bulbasaur", "Common", "https://images.pokemontcg.io/base1/44.png"));
        backup.add(createBackupCard("Mewtwo", "Rare Holo", "https://images.pokemontcg.io/base1/10.png"));

        return backup;
    }

    // Helper method to make the code above readable
    private Card createBackupCard(String name, String rarity, String url) {
        Card c = new Card();
        c.setName(name);
        c.setRarity(rarity);
        c.setSetCode("backup");
        c.setImageUrl(url);
        return c;
    }
}
