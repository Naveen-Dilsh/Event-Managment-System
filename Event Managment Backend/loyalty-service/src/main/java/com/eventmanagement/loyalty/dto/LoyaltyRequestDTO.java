package com.eventmanagement.loyalty.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LoyaltyRequestDTO {
    @NotNull(message = "Attendee ID is required")
    private Long attendeeId;
    private Integer pointsBalance = 0;
    private Integer totalPointsEarned = 0;
    private String membershipTier = "BRONZE";
    private String status = "ACTIVE";
}
