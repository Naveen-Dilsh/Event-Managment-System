package com.eventmanagment.event.helper;

import com.eventmanagment.event.client.VenueServiceClient;
import com.eventmanagment.event.dto.VenueDTO;
import com.eventmanagment.event.exception.InvalidEventDateException;
import com.eventmanagment.event.exception.VenueNotAvailableException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class Validator {

    private final VenueServiceClient venueServiceClient;

    // For validate EventDate
    public void validateEventDate(LocalDateTime eventDate) {
        if (eventDate.isBefore(LocalDateTime.now())) {
            throw new InvalidEventDateException("Event date must be in the future");
        }
    }

    // for Validate Venue
    public void validateVenue(Long venueId, Integer requiredCapacity) {
        try {
            log.info("Validating venue with ID: {}", venueId);

            // Call Venue Service using OpenFeign
            VenueDTO venue = venueServiceClient.getVenueById(venueId);

            // Check if venue capacity is sufficient
            if (venue.getCapacity() < requiredCapacity) {
                throw new VenueNotAvailableException(
                        "Venue capacity insufficient. Required: " + requiredCapacity +
                                ", Available: " + venue.getCapacity());
            }
            log.info("Venue validation successful for venue: {}", venue.getName());

        } catch (VenueNotAvailableException e) {
            throw e; // Re-throw our custom exception
        } catch (Exception e) {
            log.error("Error validating venue with ID: {}", venueId, e);
            throw new VenueNotAvailableException("Venue not found or unavailable with ID: " + venueId);
        }
    }
}
