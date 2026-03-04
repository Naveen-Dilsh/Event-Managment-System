package com.eventmanagement.loyalty.exception;

public class LoyaltyAccountNotFoundException extends RuntimeException {
    public LoyaltyAccountNotFoundException(String message) {
        super(message);
    }
}