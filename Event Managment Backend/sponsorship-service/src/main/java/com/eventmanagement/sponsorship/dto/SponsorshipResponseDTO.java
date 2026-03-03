package com.eventmanagement.sponsorship.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class SponsorshipResponseDTO {
    private Long id;
    private Long eventId;
    private String eventName;
    private String sponsorName;
    private String sponsorEmail;
    private String sponsorPhone;
    private String companyName;
    private String sponsorshipTier;
    private BigDecimal sponsorshipAmount;
    private String currency;
    private String benefits;
    private String logoUrl;
    private String websiteUrl;
    private String status;
    private String paymentStatus;
    private LocalDate agreementDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}