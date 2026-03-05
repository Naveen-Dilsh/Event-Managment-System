package com.eventmanagement.loyalty.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoyaltyRequestDTO {
    @NotNull(message = "Attendee ID is required")
    private Long attendeeId;
    @NotNull(message = "Points balance is required")
    private Double pointsBalance;
    @NotNull(message = "Total points earned is required")
    private Double totalPointsEarned;
    private String membershipTier = "BRONZE";
    private String status = "ACTIVE";
}
