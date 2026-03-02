package com.eventmanagement.analytics.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponseDTO {

    private Long reportId;
    private String reportType;
    private LocalDate reportDate;
    private String data;
}
