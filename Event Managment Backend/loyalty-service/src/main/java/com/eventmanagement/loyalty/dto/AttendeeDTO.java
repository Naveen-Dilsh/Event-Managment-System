package com.eventmanagement.loyalty.dto;

import lombok.Data;

@Data
public class AttendeeDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
}