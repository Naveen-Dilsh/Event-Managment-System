package com.eventmanagment.announcer.dto;

import lombok.Data;

import java.time.LocalDateTime;

//Outgoing payload for Announcer responses
@Data
public class AnnouncerResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String specialization;
    private String bio;
    private Integer experienceYears;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}