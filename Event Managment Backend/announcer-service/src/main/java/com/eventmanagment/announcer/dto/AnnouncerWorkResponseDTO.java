package com.eventmanagment.announcer.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

//Outgoing payload for past works
@Data
public class AnnouncerWorkResponseDTO {

    private Long id;
    private Long announcerId;
    private String announcerName;
    private Long eventId;
    private String eventName;
    private String role;
    private LocalDate eventDate;
    private String notes;
    private LocalDateTime createdAt;
}