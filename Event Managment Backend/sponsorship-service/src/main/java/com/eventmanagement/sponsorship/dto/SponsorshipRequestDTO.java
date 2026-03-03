package com.eventmanagement.sponsorship.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SponsorshipRequestDTO {

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotBlank(message = "Sponsor name is required")
    @Size(max = 200)
    private String sponsorName;

    @NotBlank(message = "Sponsor email is required")
    @Email(message = "Invalid email format")
    private String sponsorEmail;

    private String sponsorPhone;
    private String companyName;

    @NotBlank(message = "Sponsorship tier is required")
    private String sponsorshipTier;

    @NotNull(message = "Sponsorship amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Amount must be positive")
    private BigDecimal sponsorshipAmount;

    private String currency = "LKR";

    @Size(max = 1000)
    private String benefits;

    private String logoUrl;
    private String websiteUrl;
    private LocalDate agreementDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
}