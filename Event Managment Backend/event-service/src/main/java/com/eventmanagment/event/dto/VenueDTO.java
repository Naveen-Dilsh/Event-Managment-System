package com.eventmanagment.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VenueDTO {
    private Long id;
    private String name;
    private String city;
    private Integer capacity;
    private String venueType;
}
