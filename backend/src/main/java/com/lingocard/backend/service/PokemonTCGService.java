package com.lingocard.backend.service;

import java.util.ArrayList;
import java.util.List;

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
        String url = API_BASE_URL + "/sets/" + setCode;

        // Make the API call and parse the response
        try {
            JsonNode rootNode = fetchFromApi(url);
            JsonNode cardsArray = rootNode.path("cards");

            // Check if dataNode is an array and has elements
            if(cardsArray.isArray() && cardsArray.size() > 0) {
                for(int i = 0; i < 5; i++) {
                    // Randomly select a card from the array
                    int randomIndex = (int) (Math.random() * cardsArray.size());
                    JsonNode cardNode = cardsArray.get(randomIndex);

                    // Create a new Card object and populate its fields
                    Card card = new Card(); 
                    card.setName(cardNode.path("name").asText("Unknown"));

                    // Handle image URL - if the API doesn't provide a valid image, use a default placeholder
                    String imageBase = cardNode.path("image").asText("");
                    if(imageBase != null && !imageBase.isEmpty() && !imageBase.equals("null")) {
                        card.setImageUrl(imageBase + "/high.webp");
                    } else {
                        card.setImageUrl("https://assets.tcgdex.net/en/xy/xy1/1/high.webp");
                    }

                    // Handle rarity - if the API doesn't provide a rarity, default to "Common"
                    String cardId = cardNode.path("id").asText();
                    if(cardId != null && !cardId.isEmpty() && !cardId.equals("null")) {
                        try {
                            JsonNode fullCardData = fetchFromApi(API_BASE_URL + "/cards/" + cardId);

                            if(fullCardData.has("rarity")) {
                                card.setRarity(fullCardData.path("rarity").asText());
                            } else {
                                card.setRarity("Common");
                            }
                        } catch (Exception e) {
                            System.out.println("⚠️ Failed to fetch rarity for card ID " + cardId + ": " + e.getMessage());
                            card.setRarity("Unknown");
                        }
                    }

                    // Set the set code for the card
                    card.setSetCode(setCode);

                    // Add the card to the booster pack
                    boosterPack.add(card);
                }
            } 
        } catch (Exception e) {
            System.out.println("⚠️ API FAILED: " + e.getMessage());
            System.out.println("⚠️ Serving Backup Pack...");
            return getBackupPack();
        }

        return boosterPack;
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
