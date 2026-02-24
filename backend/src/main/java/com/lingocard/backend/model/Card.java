package com.lingocard.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

/**
 * Simplified Card entity used to represent a user's owned card.
 *
 * Note: This entity is intentionally minimal — additional fields (owner, acquiredAt, etc.)
 * can be added later as requirements grow.
 */
@Entity
@Data
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primary key (auto-generated)

    // Card name
    private String name;

    // Rarity of the card (according to the Master data)
    private String rarity;

    // Set code this card belongs to
    private String setCode;

    // URL to an image asset for the card. Be careful validating external URLs in production.
    private String imageUrl;
}
