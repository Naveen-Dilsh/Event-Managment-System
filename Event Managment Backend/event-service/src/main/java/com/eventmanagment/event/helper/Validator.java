package com.eventmanagment.event.helper;

import com.eventmanagment.event.exception.InvalidEventDateException;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class Validator {
    public void validateEventDate(LocalDateTime eventDate) {
        if (eventDate.isBefore(LocalDateTime.now())) {
            throw new InvalidEventDateException("Event date must be in the future");
        }
    }
}
