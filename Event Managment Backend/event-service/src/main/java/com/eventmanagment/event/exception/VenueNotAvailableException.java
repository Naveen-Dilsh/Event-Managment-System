package com.eventmanagment.event.exception;

public class VenueNotAvailableException extends RuntimeException{
    public VenueNotAvailableException(String message) {
        super(message);
    }

    public VenueNotAvailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
