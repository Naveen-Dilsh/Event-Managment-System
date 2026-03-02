package com.eventmanagment.announcer.client;

import com.eventmanagment.announcer.dto.EventDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

//Feign client to call Event Service
@FeignClient(name = "event-service", url = "${event.service.url}")
public interface EventServiceClient {

    @GetMapping("/api/events/{id}")
    EventDTO getEventById(@PathVariable("id") Long eventId);
}