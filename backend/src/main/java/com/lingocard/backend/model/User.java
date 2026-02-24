package com.lingocard.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;    // Auto-generated User ID

    // Username; required
    @Column(unique = true, nullable = false)
    private String username;

    // Password; required
    @Column(nullable = false)
    private String password;

    // Starting coin count of the user
    private int coins = 0;
}
