package com.eventmanagement.sponsorship.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventDTO {
    private Long id;
    private String name;
    private String category;
    private String status;
    private Integer capacity;
    private LocalDateTime eventDate;
}