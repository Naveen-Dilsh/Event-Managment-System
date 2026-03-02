package com.eventmanagement.loyalty.exception;

public class LoyaltyAccountNotFoundException extends RuntimeException {

    // Add this constructor that accepts a String parameter
    public LoyaltyAccountNotFoundException(String message) {
        super(message);
    }

    // Keep the default constructor if it exists
    public LoyaltyAccountNotFoundException() {
        super();
    }
}