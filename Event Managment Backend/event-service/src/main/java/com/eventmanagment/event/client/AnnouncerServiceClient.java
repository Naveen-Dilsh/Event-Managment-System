package com.eventmanagment.event.client;

import com.eventmanagment.event.dto.AnnouncerDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

// Feign client for communicating with Announcer Service
@FeignClient(name = "announcer-service", url = "${announcer.service.url}")
public interface AnnouncerServiceClient {

    // Get announcer by ID from Announcer Service
    @GetMapping("/api/announcers/{id}")
    AnnouncerDTO getAnnouncerById(@PathVariable("id") Long announcerId);
}
