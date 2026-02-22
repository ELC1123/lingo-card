package com.lingocard.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.lingocard.backend.model.Card;
import com.lingocard.backend.model.MasterCard;
import com.lingocard.backend.repository.CardRepository;
import com.lingocard.backend.repository.MasterCardRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class PokemonTCGService {

    private final MasterCardRepository masterCardRepository;

    private final CardRepository cardRepository;

    // Base URL for the Pokemon TCG API
    private final String API_BASE_URL = "https://api.tcgdex.net/v2/en";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    /**
     * Generates a booster pack of 5 random cards from the specified set.
     * @param setCode   The set code for the Pokemon TCG set
     * @return          A list of 5 randomly selected cards from the specified set
     */
    public List<Card> generateBoosterPack(String setCode) {
        List<MasterCard> libraryCards = masterCardRepository.findBySetCode(setCode);

        if(libraryCards.isEmpty()) {
            log.info("📚 Set not found. Downloading " + setCode + " to library...");
            cacheSetToLibrary(setCode);
            libraryCards = masterCardRepository.findBySetCode(setCode);
        }

        // Bucket the Local data
        List<MasterCard> commons = libraryCards.stream().filter(c -> c.getRarity().equalsIgnoreCase("Common")).toList();
        List<MasterCard> uncommons = libraryCards.stream().filter(c -> c.getRarity().equalsIgnoreCase("Uncommon")).toList();
        List<MasterCard> rarePlus = libraryCards.stream().filter(c -> !c.getRarity().equalsIgnoreCase("Common") && !c.getRarity().equalsIgnoreCase("Uncommon")).toList();

        List<Card> boosterPack = new ArrayList<>();
        Random rand = new Random();

        // Pick 3 commons, 1 uncommon, and 1 rare+ card
        for(int i = 0; i < 3 && !commons.isEmpty(); i++) {
            MasterCard selected = commons.get(rand.nextInt(commons.size()));
            boosterPack.add(convertToUserCard(selected));
        }

        boosterPack.add(convertToUserCard(pickFromBucket(uncommons, libraryCards, rand)));
        boosterPack.add(convertToUserCard(pickFromBucket(rarePlus, libraryCards, rand)));

        return boosterPack;
    }

    private void cacheSetToLibrary(String setCode) {
        String url = "https://api.tcgdex.net/v2/en/cards?set=" + setCode;
        try {
            JsonNode cardsArray = fetchFromApi(url);

            List<MasterCard> batchToSave = new ArrayList<>();

            for(JsonNode node : cardsArray) {
                try {
                    String cardId = node.path("id").asText();
                    JsonNode fullCardData = fetchFromApi(API_BASE_URL + "/cards/" + cardId);

                    MasterCard masterCard = new MasterCard();
                    masterCard.setName(node.path("name").asText("Unknown"));
                    masterCard.setSetCode(setCode);
                    masterCard.setRarity(fullCardData.path("rarity").asText("Unknown"));

                    String imageBase = node.path("image").asText("");
                    masterCard.setImageUrl(imageBase + (imageBase.isEmpty() ? "" : "/high.webp"));

                    batchToSave.add(masterCard);
                } catch (Exception e) {
                    log.warn("⚠️ Failed to fetch details for card ID: {}", node.path("id").asText());
                }
                masterCardRepository.saveAll(batchToSave);
                log.info("✅ Successfully cached {} cards for set {}", batchToSave.size(), setCode);
            }
        } catch (Exception e) {
            log.error("❌ Caching failed for set {}: {}", setCode, e.getMessage());
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

    private Card convertToUserCard(MasterCard masterCard) {
        Card card = new Card();
        card.setName(masterCard.getName());
        card.setRarity(masterCard.getRarity());
        card.setSetCode(masterCard.getSetCode());
        card.setImageUrl(masterCard.getImageUrl());
        return card;
    }

    private MasterCard pickFromBucket(List<MasterCard> bucket, List<MasterCard> fallback, Random rand) {
        if (bucket.isEmpty()) {
            return fallback.get(rand.nextInt(fallback.size()));
        }
        return bucket.get(rand.nextInt(bucket.size()));
    }
}
