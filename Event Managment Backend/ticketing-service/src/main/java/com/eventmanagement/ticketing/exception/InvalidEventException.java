package com.eventmanagement.ticketing.exception;

public class InvalidEventException extends RuntimeException {
    public InvalidEventException() {
        super();
    }

    public InvalidEventException(String message) {
        super(message);
    }
}
