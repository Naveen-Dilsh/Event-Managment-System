package com.eventmanagement.sponsorship.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sponsorships")
@Data
public class Sponsorship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long eventId;

    @Column(nullable = false, length = 200)
    private String sponsorName;

    @Column(nullable = false)
    private String sponsorEmail;

    private String sponsorPhone;
    private String companyName;

    @Column(nullable = false)
    private String sponsorshipTier;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal sponsorshipAmount;

    @Column(length = 3)
    private String currency = "LKR";

    @Column(length = 1000)
    private String benefits;

    private String logoUrl;
    private String websiteUrl;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(nullable = false)
    private String paymentStatus = "UNPAID";

    private LocalDate agreementDate;
    private LocalDate startDate;
    private LocalDate endDate;

    @Column(length = 500)
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}