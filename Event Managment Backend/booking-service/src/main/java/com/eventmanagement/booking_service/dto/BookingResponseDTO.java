package com.eventmanagement.booking_service.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponseDTO {

    private Long id;
    private Long eventId;
    private Long ticketId;
    private Long attendeeId;
    private Integer quantity;
    private Double totalPrice;

    private LocalDateTime bookingDate;
    private String bookingReference;

    private String status;
    private String paymentStatus;
    private Long paymentId;

    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String specialRequests;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
