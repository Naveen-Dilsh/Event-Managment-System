package com.eventmanagement.notification.client;

import com.eventmanagement.notification.dto.BookingDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "booking-service", url = "${booking.service.url}")
public interface BookingServiceClient {

    //get booking by id to get booking details
    @GetMapping("/api/bookings/{id}")
    BookingDTO getBookingById(@PathVariable Long id);
}
