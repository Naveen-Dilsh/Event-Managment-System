package com.eventmanagement.analytics.service;

import com.eventmanagement.analytics.dto.*;

import java.time.LocalDate;
import java.util.List;

public interface AnalyticsService {

    // Dashboard metrics
    DashboardMetricsDTO getDashboardMetrics();

    // Event summary
    EventSummaryDTO getEventSummary(Long eventId);

    // Revenue report
    RevenueReportDTO getRevenueReport(LocalDate start, LocalDate end);

    // Top-rated events
    List<TopRatedEventDTO> getTopRatedEvents(Integer limit);

    // Generate custom report
    AnalyticsResponseDTO generateReport(AnalyticsRequestDTO dto);

    // Get all saved reports
    List<AnalyticsResponseDTO> getAllReports();

    // Delete report
    void deleteReport(Long id);
}
