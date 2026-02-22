package com.lingocard.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

/**
 * MasterCard is the canonical record for a card in the master library (not user-owned).
 *
 * It is used primarily by the service layer to build booster packs. Keep it separable
 * from the `Card` entity so the user's collection can evolve independently.
 */
@Entity
@Data
public class MasterCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Canonical name for the card
    private String name;

    // Rarity as reported by the external API (e.g., "Common", "Uncommon", "Rare")
    private String rarity;

    // Set code (e.g., "me01") used to group master cards into sets
    private String setCode;

    // Image URL (may be constructed/normalized by service). Validate before use.
    private String imageUrl;
}
