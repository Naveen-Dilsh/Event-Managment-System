package com.eventmanagement.analytics.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsRequestDTO {

    private String reportType;
    private Long eventId;
    private LocalDate startDate;
    private LocalDate endDate;
}
