package com.eventmanagement.booking_service.dto;

import lombok.Data;

@Data
public class PaymentResponseDTO {
    private Long id;
    private String transactionId;
    private String paymentStatus;
}
