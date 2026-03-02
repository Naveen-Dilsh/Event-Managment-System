package com.eventmanagement.analytics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_type", nullable = false)
    private String reportType;
    // Example: EVENT_SUMMARY, REVENUE_REPORT, DASHBOARD

    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "report_date", nullable = false)
    private LocalDate reportDate;

    @Column(name = "total_bookings")
    private Integer totalBookings;

    @Column(name = "total_revenue")
    private Double totalRevenue;

    @Column(name = "total_attendees")
    private Integer totalAttendees;

    @Column(name = "average_rating")
    private Double averageRating;

    @Column(name = "data_json", columnDefinition = "TEXT")
    private String dataJson;

    @Column(name = "generated_by")
    private String generatedBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
