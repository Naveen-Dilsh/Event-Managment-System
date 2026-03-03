package com.eventmanagment.announcer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

//incoming payload for creating/updating Announcer
@Data
public class AnnouncerRequestDTO {

    @NotBlank
    private String fullName;

    private String email;
    private String phone;
    private String specialization;
    private String bio;
    private Integer experienceYears;

    //Default "AVAILABLE" if not provided
    private String status = "AVAILABLE";
}