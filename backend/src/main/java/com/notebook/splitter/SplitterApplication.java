package com.notebook.splitter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point of the Bill Splitter backend.
 * Run this class (or `mvn spring-boot:run`) to start the API on http://localhost:8080
 */
@SpringBootApplication
public class SplitterApplication {
    public static void main(String[] args) {
        SpringApplication.run(SplitterApplication.class, args);
    }
}
