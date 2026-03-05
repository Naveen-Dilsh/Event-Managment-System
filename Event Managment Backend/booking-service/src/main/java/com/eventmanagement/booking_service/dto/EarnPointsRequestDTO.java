package com.eventmanagement.booking_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EarnPointsRequestDTO {
    private Long attendeeId;
    private Double pointsToEarn;
}
