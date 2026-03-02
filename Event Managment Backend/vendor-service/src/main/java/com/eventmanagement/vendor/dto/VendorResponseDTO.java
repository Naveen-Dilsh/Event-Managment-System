package com.eventmanagement.vendor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorResponseDTO {

    private Long id;
    private Long eventId;
    private String vendorName;
    private String vendorType;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private String serviceDescription;
    private Double cost;
    private String contractStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
