package com.eventmanagement.booking_service.dto;

import lombok.Data;

@Data
public class TicketDTO {
    private Long id;
    private Long eventId;
    private String ticketType;
    private Double price;
    private Integer availableQuantity;
    private String status;
}
