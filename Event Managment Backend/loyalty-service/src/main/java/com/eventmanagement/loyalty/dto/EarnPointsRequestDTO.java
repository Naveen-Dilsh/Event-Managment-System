package com.eventmanagement.loyalty.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EarnPointsRequestDTO {

    @NotNull(message = "Attendee ID is required")
    private Long attendeeId;

    @NotNull(message = "Points to earn is required")
    @Positive(message = "Points to earn must be positive")
    private Double pointsToEarn;
}
