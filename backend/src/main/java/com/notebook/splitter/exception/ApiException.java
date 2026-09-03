package com.notebook.splitter.exception;

import org.springframework.http.HttpStatus;

/** A simple exception carrying an HTTP status, thrown anywhere in the service layer. */
public class ApiException extends RuntimeException {
    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
