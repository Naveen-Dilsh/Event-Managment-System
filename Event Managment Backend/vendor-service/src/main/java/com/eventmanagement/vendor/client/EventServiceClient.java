package com.eventmanagement.vendor.client;

import com.eventmanagement.vendor.dto.EventDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "event-service", url = "${event.service.url}")
public interface EventServiceClient {

    /**
     * Get event by ID to validate event exists
     */
    @GetMapping("/api/events/{id}")
    EventDTO getEventById(@PathVariable("id") Long eventId);
}
