package com.eventmanagement.payment_service.dto;

import com.eventmanagement.payment_service.enums.PaymentGateway;
import com.eventmanagement.payment_service.enums.PaymentMethod;
import com.eventmanagement.payment_service.enums.PaymentStatus;
import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {
    private Long id;

    private Long bookingId;

    private Double amount;

    private PaymentMethod paymentMethod;

    private PaymentStatus paymentStatus;

    private String transactionId;

    private LocalDateTime paymentDate;

    private PaymentGateway paymentGateway;

    private String cardLastFour;

    private Double refundAmount;

    private LocalDateTime refundDate;

    private String failureReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
