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

    @NotNull(message = "totalPrice is required")
    @Positive(message = "totalPrice must be positive")
    private Double totalPrice;

    @NotBlank(message = "customerName is required")
    private String customerName;

    @NotBlank(message = "customerEmail is required")
    @Email(message = "customerEmail must be valid")
    private String customerEmail;

    @NotBlank(message = "customerPhone is required")
    private String customerPhone;

    private String specialRequests;
}
