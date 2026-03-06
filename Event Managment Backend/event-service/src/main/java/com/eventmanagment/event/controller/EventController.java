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

/**
 * REST controller for managing operations related to Events.
 * Provides endpoints to perform CRUD operations on events and manage event
 * seating.
 */
@RestController
@RequestMapping("/api/events")
@Slf4j
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    /**
     * Endpoint to create a new event.
     *
     * @param dto the {@link EventRequestDTO} containing the event details
     * @return the created {@link EventResponseDTO} wrapped in a ResponseEntity with
     *         HTTP status 201 Created
     */
    @PostMapping
    public ResponseEntity<EventResponseDTO> createEvent(@Valid @RequestBody EventRequestDTO dto) {
        log.info("REST request to create event: {}", dto.getName());
        EventResponseDTO response = eventService.createEvent(dto);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Endpoint to retrieve all events.
     *
     * @return a list of {@link EventResponseDTO} objects wrapped in a
     *         ResponseEntity
     */
    @GetMapping
    public ResponseEntity<List<EventResponseDTO>> getAllEvents() {
        List<EventResponseDTO> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * Endpoint to retrieve a specific event by its ID.
     *
     * @param id the unique identifier of the event
     * @return the {@link EventResponseDTO} associated with the provided ID wrapped
     *         in a ResponseEntity
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDTO> getEventById(@PathVariable Long id) {
        EventResponseDTO event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    /**
     * Endpoint to update an existing event.
     *
     * @param id  the unique identifier of the event to update
     * @param dto the updated data in {@link EventRequestDTO} format
     * @return the updated {@link EventResponseDTO} wrapped in a ResponseEntity
     */
    @PutMapping("/{id}")
    public ResponseEntity<EventResponseDTO> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequestDTO dto) {
        EventResponseDTO updateEvent = eventService.updateEvent(id, dto);
        return ResponseEntity.ok(updateEvent);
    }

    /**
     * Endpoint to delete an event by its ID.
     *
     * @param id the unique identifier of the event to delete
     * @return the details of the deleted event as {@link EventResponseDTO} wrapped
     *         in a ResponseEntity
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<EventResponseDTO> deleteEvent(@PathVariable Long id) {
        EventResponseDTO deletedEvent = eventService.deleteEvent(id);
        return ResponseEntity.ok(deletedEvent);
    }

    /**
     * Endpoint to reduce the available seats for a specific event.
     * Typically invoked when tickets are booked.
     *
     * @param id      the unique identifier of the event
     * @param request a map containing the "quantity" of seats to reduce
     * @return a confirmation message wrapped in a ResponseEntity
     */
    @PatchMapping("/{id}/reduce-seats")
    public ResponseEntity<String> reduceAvailableSeats(@PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        log.info("REST request to reduce seats for event ID: {}", id);
        Integer quantity = request.get("quantity");
        eventService.reduceAvailableSeats(id, quantity);
        return ResponseEntity.ok("Seats reduced successfully");
    }
}
