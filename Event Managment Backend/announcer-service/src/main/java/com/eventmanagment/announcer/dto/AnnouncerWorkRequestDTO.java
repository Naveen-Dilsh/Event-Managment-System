package com.eventmanagment.announcer.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

//Incoming payload for creating/updating a past work
@Data
public class AnnouncerWorkRequestDTO {

    @NotNull
    private Long announcerId;

    @NotNull
    private Long eventId;

    private String role; // Main Host, Co-Host, Speaker
    private LocalDate eventDate;
    private String notes;
}