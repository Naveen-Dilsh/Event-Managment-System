package com.eventmanagement.ticketing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private Long id;
    private Long eventId;
    private String ticketType;
    private Double price;
    private Integer quantity;
    private Integer availableQuantity;
    private Integer soldQuantity;
    private String description;

    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    private Integer maxPerBooking;
    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
