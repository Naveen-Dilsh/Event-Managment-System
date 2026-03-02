package com.eventmanagement.analytics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopRatedEventDTO {

    private Long eventId;
    private String eventName;
    private Double averageRating;
}
