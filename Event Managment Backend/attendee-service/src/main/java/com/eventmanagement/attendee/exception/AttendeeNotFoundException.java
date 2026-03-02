package com.eventmanagement.attendee.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class AttendeeNotFoundException extends RuntimeException {
    public AttendeeNotFoundException(String message) {
        super(message);
    }
}
