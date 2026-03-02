package com.eventmanagement.notification.client;

import com.eventmanagement.notification.dto.EventDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "event-service", url = "${event.service.url}")
public interface EventServiceClient {

    //get event by id to get event details
    @GetMapping("/api/events/{id}")
    EventDTO getEventById(@PathVariable Long id);
}
