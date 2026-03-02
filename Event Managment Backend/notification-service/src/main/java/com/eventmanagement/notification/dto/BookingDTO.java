package com.eventmanagement.notification.dto;

import lombok.Data;

@Data
public class BookingDTO {
    private Long id;
    private String bookingReference;
    private String customerEmail;
}
