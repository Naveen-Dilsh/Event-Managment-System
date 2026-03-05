package com.eventmanagement.booking_service.client;

import com.eventmanagement.booking_service.dto.TicketDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "ticketing-service", url = "${ticketing.service.url}")
public interface TicketingServiceClient {

    @GetMapping("/api/tickets/{id}")
    TicketDTO getTicketById(@PathVariable("id") Long ticketId);

    // Reduces available ticket quantity after booking
    @PatchMapping("/api/tickets/{id}/reduce")
    void reduceTicketQuantity(@PathVariable("id") Long ticketId,
                              @RequestBody Map<String, Integer> request);

    // Restores available ticket quantity on cancellation
    @PatchMapping("/api/tickets/{id}/restore")
    void restoreTicketQuantity(@PathVariable("id") Long ticketId,
                               @RequestBody Map<String, Integer> request);
}
