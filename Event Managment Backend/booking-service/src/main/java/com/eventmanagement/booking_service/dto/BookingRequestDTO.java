package com.eventmanagement.booking_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BookingRequestDTO {

    @NotNull(message = "eventId is required")
    private Long eventId;

    @NotNull(message = "ticketId is required")
    private Long ticketId;

    @NotNull(message = "attendeeId is required")
    private Long attendeeId;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "customerName is required")
    private String customerName;

    @NotBlank(message = "customerEmail is required")
    @Email(message = "customerEmail must be a valid email address")
    private String customerEmail;

    @NotBlank(message = "customerPhone is required")
    private String customerPhone;

    private String specialRequests;
}
