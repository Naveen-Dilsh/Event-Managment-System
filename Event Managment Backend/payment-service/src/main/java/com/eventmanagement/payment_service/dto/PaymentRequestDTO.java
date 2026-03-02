package com.eventmanagement.payment_service.dto;

import com.eventmanagement.payment_service.enums.PaymentGateway;
import com.eventmanagement.payment_service.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDTO {
    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    private Double amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    // This can be optional, but your spec includes it
    @NotNull(message = "Payment gateway is required")
    private PaymentGateway paymentGateway;

    // Optional: only for card payments
    @Size(min = 4, max = 4, message = "Card last four must be exactly 4 digits")
    private String cardLastFour;
}
