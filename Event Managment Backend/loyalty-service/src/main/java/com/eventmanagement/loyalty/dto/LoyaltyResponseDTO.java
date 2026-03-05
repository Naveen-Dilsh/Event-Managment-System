package com.eventmanagement.loyalty.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LoyaltyResponseDTO {
    private Long id;
    private Long attendeeId;
    private String attendeeName; // from Feign
    private Double pointsBalance;
    private Double totalPointsEarned;
    private String membershipTier;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
