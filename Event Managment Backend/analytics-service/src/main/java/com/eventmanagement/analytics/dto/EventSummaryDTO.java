package com.eventmanagement.analytics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventSummaryDTO {

    private Long eventId;
    private Integer totalBookings;
    private Integer totalAttendees;
    private Double totalRevenue;
    private Double averageRating;
}
