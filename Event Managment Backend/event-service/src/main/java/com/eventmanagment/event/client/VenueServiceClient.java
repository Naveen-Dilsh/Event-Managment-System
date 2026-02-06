package com.eventmanagment.event.client;

import com.eventmanagment.event.dto.VenueDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

//Feign client for communicating with Venue Service
@FeignClient(name = "venue-service", url = "${venue.service.url}")
public interface VenueServiceClient {

//  Get venue by ID from Venue Service
    @GetMapping("/api/venues/{id}")
    VenueDTO getVenueById(@PathVariable("id") Long venueId);
}
