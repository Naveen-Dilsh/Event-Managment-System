package com.eventmanagement.ticketing.exception;

public class InsufficientTicketsException extends RuntimeException {
    public InsufficientTicketsException() {
        super();
    }

    public InsufficientTicketsException(String message) {
        super(message);
    }
}
