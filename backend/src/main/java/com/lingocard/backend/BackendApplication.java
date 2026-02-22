package com.lingocard.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Spring Boot backend application.
 *
 * Keeps main method minimal — Spring Boot will bootstrap the application context.
 */
@SpringBootApplication
public class BackendApplication {

	/**
	 * Main method used to start the Spring Boot application.
	 * @param args standard command-line args passed to the JVM
	 */
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
