package com.lingocard.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.lingocard.backend.model.Card;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PokemonTCGService {
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
        List<Card> boosterPack = new ArrayList<>();

        // Fetch cards from the specified set
        String url = "https://api.tcgdex.net/v2/en/cards?set=" + setCode;

        // Make the API call and parse the response
        try {
            JsonNode cardsArray = fetchFromApi(url);

            // Check if dataNode is an array and has elements
            if(cardsArray.isArray() && cardsArray.size() > 0) {
                List<JsonNode> commons = new ArrayList<>();
                List<JsonNode> uncommons = new ArrayList<>();
                List<JsonNode> rarePlus = new ArrayList<>();

                for(JsonNode node : cardsArray) {
                    String cardId = node.path("id").asText();
                    JsonNode fullCardData = fetchFromApi(API_BASE_URL + "/cards/" + cardId);
                    String rarity = fullCardData.path("rarity").asText("Common").toLowerCase();

                    // Bucket cards based on rarity, defaulting to "Common" if not provided
                    if(rarity.contains("uncommon")) {
                        uncommons.add(node);
                    } else if(rarity.contains("common")) {
                        commons.add(node);
                    } else {
                        rarePlus.add(node);
                    }
                }

                // Debugging output to verify bucket sizes
                System.out.println("Buckets -> C: " + commons.size() + " UC: " + uncommons.size() + " R+: " + rarePlus.size());

                List<JsonNode> selectedNodes = new ArrayList<>();
                selectedNodes.add(pickRandom(commons, cardsArray));
                selectedNodes.add(pickRandom(commons, cardsArray));
                selectedNodes.add(pickRandom(commons, cardsArray));
                selectedNodes.add(pickRandom(uncommons, cardsArray));
                selectedNodes.add(pickRandom(rarePlus, cardsArray));

                for(JsonNode node : selectedNodes) {
                    boosterPack.add(fullCard(node, setCode));
                }
            } 
        } catch (Exception e) {
            System.out.println("⚠️ API FAILED: " + e.getMessage());
            return getBackupPack();
        }

        return boosterPack;
    }

    // Helper method to pick a random card from a bucket, or fallback to the full array if the bucket is empty
    private JsonNode pickRandom(List<JsonNode> bucket, JsonNode fallbackArray) {
        Random rand = new Random();
        if(bucket.isEmpty()) {
            return fallbackArray.get(rand.nextInt(fallbackArray.size()));
        }
        return bucket.get(rand.nextInt(bucket.size()));
    }

    // Helper method to create a full Card object with all necessary fields, including a second API call for rarity
    private Card fullCard(JsonNode cardNode, String setCode) {
        // Create a new Card object and populate its fields
        Card card = new Card(); 
        card.setName(cardNode.path("name").asText("Unknown"));
        card.setSetCode(setCode);

        // Handle image URL - if the API doesn't provide a valid image, use a default placeholder
        String imageBase = cardNode.path("image").asText("");
        card.setImageUrl(imageBase + (imageBase.isEmpty() ? "" : "/high.webp"));

        // Handle rarity - if the API doesn't provide a rarity, default to "Common"
        String cardId = cardNode.path("id").asText();
        try {
            JsonNode fullCardData = fetchFromApi(API_BASE_URL + "/cards/" + cardId);
            card.setRarity(fullCardData.path("rarity").asText("Common"));
        } catch (Exception e) {
            card.setRarity("Unknown");
        }
        return card;
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
