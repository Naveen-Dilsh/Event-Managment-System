package com.eventmanagment.event.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRequestDTO {

    @NotBlank(message = "Event name is required")
    @Size(max = 200, message = "Event name must not exceed 200 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Event date is required")
    @Future(message = "Event date must be in the future")
    private LocalDateTime eventDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")

    @NotNull(message = "Venue ID is required")
    private Long venueId;

    private LocalTime endTime;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Organizer name is required")
    private String organizerName;

    @NotBlank(message = "Organizer contact is required")
    private String organizerContact;

    private String imageUrl;

    // Enum for Event Status
    private enum EventStatus {
        DRAFT,
        PUBLISHED,
        ONGOING,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }
}
