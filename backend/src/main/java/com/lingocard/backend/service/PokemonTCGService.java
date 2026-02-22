package com.lingocard.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

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

/**
 * Service responsible for interacting with a Pokemon TCG source and producing
 * booster packs for the application. Note: network calls are made synchronously
 * via RestTemplate — consider async or WebClient for higher throughput.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PokemonTCGService {

    private final MasterCardRepository masterCardRepository;

    private final CardRepository cardRepository;

    // Base URL for the Pokemon TCG API (external dependency)
    private final String API_BASE_URL = "https://api.tcgdex.net/v2/en";
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Random random = new Random();

    /**
     * Generate a booster pack from the local master library. If the requested
     * set is not available locally, an attempt will be made to cache it from
     * the external API.
     *
     * @param setCode the set identifier (e.g., "me01")
     * @return list of `Card` DTOs representing the opened pack
     */
    public List<Card> generateBoosterPack(String setCode) {
        List<MasterCard> libraryCards = masterCardRepository.findBySetCode(setCode);

        if(libraryCards.isEmpty()) {
            log.info("Set not found locally; attempting to cache set {}", setCode);
            cacheSetToLibrary(setCode);
            libraryCards = masterCardRepository.findBySetCode(setCode);
        }

        // Partition cards into buckets used for pack generation
        List<MasterCard> commons = libraryCards.stream().filter(c -> c.getRarity().equalsIgnoreCase("Common")).toList();
        List<MasterCard> uncommons = libraryCards.stream().filter(c -> c.getRarity().equalsIgnoreCase("Uncommon")).toList();
        List<MasterCard> rarePlus = libraryCards.stream().filter(c -> !c.getRarity().equalsIgnoreCase("Common") && !c.getRarity().equalsIgnoreCase("Uncommon")).toList();

        List<Card> boosterPack = new ArrayList<>();

        // Use a single Random instance for selection
        Random rand = new Random();

        // Pick 3 commons (if available)
        for(int i = 0; i < 3 && !commons.isEmpty(); i++) {
            MasterCard selected = commons.get(rand.nextInt(commons.size()));
            boosterPack.add(convertToUserCard(selected));
        }

        // Pick one from uncommons and one from rare+ (fallback to full library if bucket empty)
        boosterPack.add(convertToUserCard(pickFromBucket(uncommons, libraryCards, rand)));
        boosterPack.add(convertToUserCard(pickFromBucket(rarePlus, libraryCards, rand)));

        return boosterPack;
    }

    /**
     * Fetches a set from the remote API and caches the master cards in the DB.
     * This method currently does synchronous calls and saves in batches —
     * could be optimized to stream and save in larger batches.
     */
    private void cacheSetToLibrary(String setCode) {
        String url = API_BASE_URL + "/cards?set=" + setCode;
        try {
            JsonNode cardsArray = fetchFromApi(url);

            List<MasterCard> batchToSave = new ArrayList<>();

            for(JsonNode node : cardsArray) {
                try {
                    String cardId = node.path("id").asText();

                    // Fetch full details for the card (separate API call)
                    JsonNode fullCardData = fetchFromApi(API_BASE_URL + "/cards/" + cardId);

                    MasterCard masterCard = new MasterCard();
                    masterCard.setName(node.path("name").asText("Unknown"));
                    masterCard.setSetCode(setCode);
                    masterCard.setRarity(fullCardData.path("rarity").asText("Unknown"));

                    // The API sometimes returns an image base — append format when present
                    String imageBase = node.path("image").asText("");
                    masterCard.setImageUrl(imageBase + (imageBase.isEmpty() ? "" : "/high.webp"));

                    batchToSave.add(masterCard);
                } catch (Exception e) {
                    // Log and continue — one failed card shouldn't block caching of the set
                    log.warn("Failed to fetch details for card ID {}: {}", node.path("id").asText(), e.getMessage());
                }

                // Persist batch so far. Note: currently this call happens inside the loop.
                // Consider moving `saveAll` outside of the loop to persist once per set for performance.
                masterCardRepository.saveAll(batchToSave);
                log.info("Cached {} cards for set {}", batchToSave.size(), setCode);
            }
        } catch (Exception e) {
            log.error("Caching failed for set {}: {}", setCode, e.getMessage());
        }
    }

    /**
     * Simple helper to fetch JSON from the external API and parse to a JsonNode.
     * In production code we should check HTTP status codes and handle rate-limiting.
     */
    private JsonNode fetchFromApi(String url) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "lingocard-backend/1.0 (+https://example.com)");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
        return objectMapper.readTree(response.getBody());
    } 

    /**
     * Convert a master library card into a user-facing `Card` entity instance.
     */
    private Card convertToUserCard(MasterCard masterCard) {
        Card card = new Card();
        card.setName(masterCard.getName());
        card.setRarity(masterCard.getRarity());
        card.setSetCode(masterCard.getSetCode());
        card.setImageUrl(masterCard.getImageUrl());
        return card;
    }

    /**
     * Pick a card from a bucket with a fallback to the full library if the bucket is empty.
     */
    private MasterCard pickFromBucket(List<MasterCard> bucket, List<MasterCard> fallback, Random rand) {
        if (bucket == null || bucket.isEmpty()) {
            // Defensive: ensure fallback is non-empty before calling get
            return fallback.get(rand.nextInt(fallback.size()));
        }
        return bucket.get(rand.nextInt(bucket.size()));
    }
}
