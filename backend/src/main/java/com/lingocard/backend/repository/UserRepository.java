package com.lingocard.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.lingocard.backend.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>{
    // Find user using its username using SQL (thanks String Data JPA)
    Optional<User> findByUsername(String username);
}
