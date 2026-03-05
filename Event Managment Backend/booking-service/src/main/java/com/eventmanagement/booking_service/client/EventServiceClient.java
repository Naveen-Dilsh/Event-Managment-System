package com.eventmanagement.booking_service.client;

import com.eventmanagement.booking_service.dto.EventDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "event-service", url = "${event.service.url}")
public interface EventServiceClient {

    @GetMapping("/api/events/{id}")
    EventDTO getEventById(@PathVariable("id") Long eventId);
}
