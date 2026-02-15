package com.eventmanagement.payment_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequestDTO {

    @NotNull(message = "Refund amount is required")
    @Positive(message = "Refund amount must be greater than 0")
    private Double refundAmount;
}
