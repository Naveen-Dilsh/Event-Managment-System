package com.eventmanagment.event.exception;

public class EventNotFoundException extends RuntimeException{

    public EventNotFoundException(String message) {
        super(message);
    }

    public EventNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
