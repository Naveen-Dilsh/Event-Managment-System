package com.eventmanagment.announcer.dto;

import lombok.Data;

import java.time.LocalDateTime;

//Minimal Event projection for Feign response
@Data
public class EventDTO {

    private Long id;
    private String name;
    private String status;
    private LocalDateTime eventDate;
}