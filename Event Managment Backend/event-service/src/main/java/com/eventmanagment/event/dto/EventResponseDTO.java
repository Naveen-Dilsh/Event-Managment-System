package com.eventmanagment.event.dto;

import com.eventmanagment.event.entity.Event;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventResponseDTO {

    private Long id;
    private String name;
    private String description;
    private LocalDateTime eventDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long venueId;
    private String category;
    private Integer capacity;
    private Integer availableSeats;
    private Event.EventStatus status;
    private String organizerName;
    private String organizerContact;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
