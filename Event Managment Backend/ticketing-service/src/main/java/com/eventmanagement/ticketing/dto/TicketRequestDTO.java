package com.eventmanagement.ticketing.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequestDTO {

    @NotNull
    private Long eventId;

    @NotBlank
    private String ticketType;

    @NotNull
    @PositiveOrZero
    private Double price;

    @NotNull
    @Positive
    private Integer quantity;

    private String description;

    private LocalDateTime validFrom;

    private LocalDateTime validUntil;

    @Positive
    private Integer maxPerBooking;

    private String status; // Optional - ACTIVE, INACTIVE, etc.
}
