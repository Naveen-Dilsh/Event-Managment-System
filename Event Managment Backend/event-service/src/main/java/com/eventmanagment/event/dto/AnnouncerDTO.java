package com.eventmanagment.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// DTO for receiving Announcer data from Announcer Service via Feign
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncerDTO {
    private Long id;
    private String fullName;
    private String status;
}
