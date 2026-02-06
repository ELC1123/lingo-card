package com.lingocard.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity     // JPA annotation to mark this class as a database entity
@Data       // Lombok annotation to generate getters, setters, toString, equals, and hashCode methods
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Auto-incrementing ID

    private String name;        // name of card
    private String rarity;      // rarity of card (e.g., C, U, R, RR, UR, IR, SIR, HR, PROMO)
    private String setCode;     // code of the set this card belongs to
    private String imageUrl;    // URL to the card's image
}
