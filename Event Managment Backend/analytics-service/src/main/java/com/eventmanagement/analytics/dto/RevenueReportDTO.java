package com.eventmanagement.analytics.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportDTO {

    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalRevenue;
}
