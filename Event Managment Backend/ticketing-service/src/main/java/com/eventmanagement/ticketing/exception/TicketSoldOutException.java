package com.eventmanagement.ticketing.exception;

public class TicketSoldOutException extends RuntimeException {
    public TicketSoldOutException() {
        super();
    }

    public TicketSoldOutException(String message) {
        super(message);
    }
}
