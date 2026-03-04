package com.eventmanagement.attendee.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Data Transfer Object (DTO) used to send attendee data
   from the server to the client as a response.
 */

@Data
public class AttendeeResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String city;
    private String country;
    private String preferences;
    private LocalDateTime createdAt;


}
