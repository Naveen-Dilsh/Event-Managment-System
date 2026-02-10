package com.eventmanagement.vendor.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidCostException extends RuntimeException {

    public InvalidCostException(String message) {
        super(message);
    }

    public InvalidCostException(String message, Throwable cause) {
        super(message, cause);
    }
}
