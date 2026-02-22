package com.lingocard.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Simple health/test controller used during development to verify backend connectivity.
 * CORS is enabled for the local Vite dev server origin to allow quick testing from React.
 */
@RestController
@CrossOrigin(origins = "http://localhost:5173") // Allow requests from local frontend during development
public class TestController {

    /**
     * Basic test endpoint returning a plain text greeting.
     * Useful to confirm that the backend is reachable from the frontend.
     */
    @GetMapping("/api/hello")
    public String hello(){
        return "Hello World";
    }
}
