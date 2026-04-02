package com.lingocard.backend.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lingocard.backend.model.Flashcard;
import com.lingocard.backend.repository.FlashcardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final FlashcardRepository flashcardRepository;
    
    // Instantiate tools needed for HTTP requests and JSON parsing
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public void run(String... args) throws Exception {
        // Only run if the database is completely empty
        if (flashcardRepository.count() == 0) {
            log.info("Flashcard database is empty! Initiating automated ETL pipeline...");
            
            // 1. EXTRACT: The URL to the raw JSON file on GitHub
            String[] urls = {
                "https://raw.githubusercontent.com/drkameleon/complete-hsk-vocabulary/refs/heads/main/wordlists/exclusive/newest/1.json"
                // You can add HSK 2, 3, 4, etc. URLs here later!
            };

            List<Flashcard> batchToSave = new ArrayList<>();

            try {
                for (String url : urls) {
                    log.info("Fetching data from: {}", url);
                    
                    // Download the JSON from the internet
                    ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
                    JsonNode jsonArray = objectMapper.readTree(response.getBody());

                    // 2. TRANSFORM: Loop through the external data and map it
                    for (JsonNode node : jsonArray) {
                        Flashcard card = new Flashcard();
                        
                        card.setHskLevel(1); 
                        
                        // Hanzi is at the root level under "simplified"
                        card.setHanzi(node.path("simplified").asText(""));
                        
                        // The rest is buried inside the first object of the "forms" array
                        JsonNode formsArray = node.path("forms");
                        if (formsArray.isArray() && formsArray.size() > 0) {
                            JsonNode firstForm = formsArray.get(0);
                            
                            // Dig into transcriptions for pinyin
                            card.setPinyin(firstForm.path("transcriptions").path("pinyin").asText(""));
                            
                            // Dig into meanings array and join them together
                            JsonNode meaningsArray = firstForm.path("meanings");
                            if (meaningsArray.isArray()) {
                                List<String> meaningsList = new ArrayList<>();
                                meaningsArray.forEach(m -> meaningsList.add(m.asText()));
                                card.setMeaning(String.join(" / ", meaningsList));
                            }
                        }

                        // We don't have sentences from this dataset, so we default to empty strings
                        card.setSentence("");
                        card.setSentenceMeaning("");

                        batchToSave.add(card);
                    }
                }

                // 3. LOAD: Save all the fully formatted cards to PostgreSQL
                flashcardRepository.saveAll(batchToSave);
                log.info("ETL Pipeline complete! Successfully seeded {} flashcards.", batchToSave.size());

            } catch (Exception e) {
                log.error("ETL Pipeline failed: {}", e.getMessage());
            }
        } else {
            log.info("Flashcard database is already populated. Skipping automated ETL.");
        }
    }
}