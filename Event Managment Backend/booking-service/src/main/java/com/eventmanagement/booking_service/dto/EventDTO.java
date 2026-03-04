package com.eventmanagement.booking_service.dto;

import lombok.Data;

@Data
public class EventDTO {
    private Long id;
    private String name;
    private String status;
    private Integer availableSeats;
}
