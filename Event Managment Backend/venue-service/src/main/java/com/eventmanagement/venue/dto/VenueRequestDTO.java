package com.eventmanagement.venue.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VenueRequestDTO {

    @NotBlank(message = "Venue name cannot be blank")
    private String name;

    @NotBlank(message = "Address cannot be blank")
    private String address;

    @NotBlank(message = "City cannot be blank")
    private String city;

    @NotBlank(message = "State cannot be blank")
    private String state;

    @NotBlank(message = "Country cannot be blank")
    private String country;

    @NotBlank(message = "Postal code cannot be blank")
    private String postalCode;

    @NotNull(message = "Capacity cannot be null")
    @Min(value = 1, message = "Capacity must be greater than 0")
    private Integer capacity;

    @NotBlank(message = "Venue type cannot be blank")
    private String venueType;

    private String facilities;

    @NotBlank(message = "Contact email cannot be blank")
    @Email(message = "Contact email must be valid")
    private String contactEmail;

    @NotBlank(message = "Contact phone cannot be blank")
    private String contactPhone;
}
