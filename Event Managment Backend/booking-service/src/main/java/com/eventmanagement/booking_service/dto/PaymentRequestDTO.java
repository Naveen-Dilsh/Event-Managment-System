package com.eventmanagement.booking_service.dto;

import lombok.Data;

@Data
public class PaymentRequestDTO {
    private Long bookingId;
    private Double amount;
    private String paymentMethod;
}
