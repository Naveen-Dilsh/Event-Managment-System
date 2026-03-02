package com.eventmanagement.vendor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorRequestDTO {

    private Long eventId;

    @NotBlank(message = "Vendor name is required")
    private String vendorName;

    @NotBlank(message = "Vendor type is required")
    private String vendorType;

    private String contactPerson;

    @Email(message = "Invalid email format")
    private String contactEmail;

    private String contactPhone;

    private String serviceDescription;

    @Positive(message = "Cost must be positive")
    private Double cost;

    private String contractStatus;
}
