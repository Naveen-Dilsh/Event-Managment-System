package com.eventmanagement.analytics.service.impl;

import com.eventmanagement.analytics.dto.*;
import com.eventmanagement.analytics.entity.Analytics;
import com.eventmanagement.analytics.repository.AnalyticsRepository;
import com.eventmanagement.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AnalyticsRepository analyticsRepository;

    @Override
    public DashboardMetricsDTO getDashboardMetrics() {

        List<Analytics> records = analyticsRepository.findByReportType("DASHBOARD");

        double totalRevenue = records.stream()
                .mapToDouble(a -> a.getTotalRevenue() != null ? a.getTotalRevenue() : 0)
                .sum();

        int totalBookings = records.stream()
                .mapToInt(a -> a.getTotalBookings() != null ? a.getTotalBookings() : 0)
                .sum();

        int totalAttendees = records.stream()
                .mapToInt(a -> a.getTotalAttendees() != null ? a.getTotalAttendees() : 0)
                .sum();

        double avgRating = records.stream()
                .mapToDouble(a -> a.getAverageRating() != null ? a.getAverageRating() : 0)
                .average()
                .orElse(0);

        return DashboardMetricsDTO.builder()
                .totalBookings(totalBookings)
                .totalAttendees(totalAttendees)
                .totalRevenue(totalRevenue)
                .averageRating(avgRating)
                .build();
    }

    @Override
    public EventSummaryDTO getEventSummary(Long eventId) {

        List<Analytics> records = analyticsRepository.findByEventId(eventId);

        return EventSummaryDTO.builder()
                .eventId(eventId)
                .totalBookings(
                        records.stream().mapToInt(a -> a.getTotalBookings() != null ? a.getTotalBookings() : 0).sum()
                )
                .totalAttendees(
                        records.stream().mapToInt(a -> a.getTotalAttendees() != null ? a.getTotalAttendees() : 0).sum()
                )
                .totalRevenue(
                        records.stream().mapToDouble(a -> a.getTotalRevenue() != null ? a.getTotalRevenue() : 0).sum()
                )
                .averageRating(
                        records.stream().mapToDouble(a -> a.getAverageRating() != null ? a.getAverageRating() : 0).average().orElse(0)
                )
                .build();
    }

    @Override
    public RevenueReportDTO getRevenueReport(LocalDate start, LocalDate end) {

        double revenue = analyticsRepository.findAll().stream()
                .filter(a -> !a.getReportDate().isBefore(start) && !a.getReportDate().isAfter(end))
                .mapToDouble(a -> a.getTotalRevenue() != null ? a.getTotalRevenue() : 0)
                .sum();

        return RevenueReportDTO.builder()
                .startDate(start)
                .endDate(end)
                .totalRevenue(revenue)
                .build();
    }

    @Override
    public List<TopRatedEventDTO> getTopRatedEvents(Integer limit) {

        return analyticsRepository.findAll().stream()
                .filter(a -> a.getAverageRating() != null)
                .sorted((a, b) -> Double.compare(b.getAverageRating(), a.getAverageRating()))
                .limit(limit)
                .map(a -> TopRatedEventDTO.builder()
                        .eventId(a.getEventId())
                        .averageRating(a.getAverageRating())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public AnalyticsResponseDTO generateReport(AnalyticsRequestDTO dto) {

        Analytics analytics = Analytics.builder()
                .reportType(dto.getReportType())
                .eventId(dto.getEventId())
                .reportDate(LocalDate.now())
                .generatedBy("SYSTEM")
                .dataJson(dto.toString())
                .build();

        Analytics saved = analyticsRepository.save(analytics);

        return AnalyticsResponseDTO.builder()
                .reportId(saved.getId())
                .reportType(saved.getReportType())
                .reportDate(saved.getReportDate())
                .data("Report generated successfully")
                .build();
    }

    @Override
    public List<AnalyticsResponseDTO> getAllReports() {

        return analyticsRepository.findAll().stream()
                .map(a -> AnalyticsResponseDTO.builder()
                        .reportId(a.getId())
                        .reportType(a.getReportType())
                        .reportDate(a.getReportDate())
                        .data(a.getDataJson())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public void deleteReport(Long id) {
        analyticsRepository.deleteById(id);
    }
}
