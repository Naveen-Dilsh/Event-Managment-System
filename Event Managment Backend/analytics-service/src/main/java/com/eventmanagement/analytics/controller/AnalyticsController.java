package com.eventmanagement.analytics.controller;

import com.eventmanagement.analytics.dto.*;
import com.eventmanagement.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;


    // DASHBOARD METRICS

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsDTO> getDashboardMetrics() {
        return ResponseEntity.ok(analyticsService.getDashboardMetrics());
    }


    // EVENT SUMMARY

    @GetMapping("/event/{eventId}/summary")
    public ResponseEntity<EventSummaryDTO> getEventSummary(
            @PathVariable Long eventId
    ) {
        return ResponseEntity.ok(analyticsService.getEventSummary(eventId));
    }


    // REVENUE REPORT

    @GetMapping("/revenue")
    public ResponseEntity<RevenueReportDTO> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return ResponseEntity.ok(
                analyticsService.getRevenueReport(start, end)
        );
    }


    // TOP RATED EVENTS

    @GetMapping("/events/top-rated")
    public ResponseEntity<List<TopRatedEventDTO>> getTopRatedEvents(
            @RequestParam(defaultValue = "5") Integer limit
    ) {
        return ResponseEntity.ok(
                analyticsService.getTopRatedEvents(limit)
        );
    }


    // GENERATE REPORT

    @PostMapping("/reports")
    public ResponseEntity<AnalyticsResponseDTO> generateReport(
            @RequestBody AnalyticsRequestDTO requestDTO
    ) {
        return new ResponseEntity<>(
                analyticsService.generateReport(requestDTO),
                HttpStatus.CREATED
        );
    }


    // GET ALL REPORTS

    @GetMapping("/reports")
    public ResponseEntity<List<AnalyticsResponseDTO>> getAllReports() {
        return ResponseEntity.ok(
                analyticsService.getAllReports()
        );
    }


    // DELETE REPORT

    @DeleteMapping("/reports/{id}")
    public ResponseEntity<Void> deleteReport(
            @PathVariable Long id
    ) {
        analyticsService.deleteReport(id);
        return ResponseEntity.noContent().build();
    }
}
