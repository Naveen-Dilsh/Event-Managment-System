package com.eventmanagement.loyalty.client;

import com.eventmanagement.loyalty.dto.AttendeeDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "attendee-service", url = "${attendee.service.url}")
public interface AttendeeServiceClient {
    @GetMapping("/api/attendees/{id}")
    AttendeeDTO getAttendeeById(@PathVariable("id") Long attendeeId);
}