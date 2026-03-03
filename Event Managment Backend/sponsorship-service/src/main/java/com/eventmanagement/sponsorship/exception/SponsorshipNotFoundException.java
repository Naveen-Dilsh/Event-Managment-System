package com.eventmanagement.sponsorship.exception;

public class SponsorshipNotFoundException extends RuntimeException {
    public SponsorshipNotFoundException(String message) {
        super(message);
    }
}