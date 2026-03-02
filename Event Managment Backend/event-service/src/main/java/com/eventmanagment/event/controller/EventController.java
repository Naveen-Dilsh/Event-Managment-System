package com.eventmanagment.event.controller;

import com.eventmanagment.event.dto.EventRequestDTO;
import com.eventmanagment.event.dto.EventResponseDTO;
import com.eventmanagment.event.service.EventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@Slf4j
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    // Create Event
    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventRequestDTO dto) {
        log.info("REST request to create event: {}", dto.getName());
        EventResponseDTO response = eventService.createEvent(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get All Events
    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<EventResponseDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    // Get Event By ID
    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        EventResponseDTO event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    // Update Event
    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequestDTO dto) {
        EventResponseDTO updateEvent = eventService.updateEvent(id, dto);
        return ResponseEntity.ok(updateEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<EventResponseDTO> deleteEvent(@PathVariable Long id) {
        EventResponseDTO deletedEvent = eventService.deleteEvent(id);
        return ResponseEntity.ok(deletedEvent);
    }

    @PatchMapping("/{id}/reduce-seats")
    public ResponseEntity<String> reduceAvailableSeats(@PathVariable Long id, @RequestBody Map<String, Integer> request) {
        log.info("REST request to reduce seats for event ID: {}", id);
        Integer quantity = request.get("quantity");
        eventService.reduceAvailableSeats(id, quantity);
        return ResponseEntity.ok("Seats reduced successfully");
    }
}
