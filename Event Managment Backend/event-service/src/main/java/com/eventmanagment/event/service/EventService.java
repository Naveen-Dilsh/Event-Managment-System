package com.eventmanagment.event.service;

import com.eventmanagment.event.dto.EventRequestDTO;
import com.eventmanagment.event.dto.EventResponseDTO;

import java.util.List;

/**
 * Service interface for managing events.
 * Provides operations to create, retrieve, update, delete, and manage seats for
 * events.
 */
public interface EventService {

    /**
     * Creates a new event based on the provided request data.
     *
     * @param dto the event details
     * @return the created event as a response DTO
     */
    EventResponseDTO createEvent(EventRequestDTO dto);

    /**
     * Retrieves all events.
     *
     * @return a list of all events
     */
    List<EventResponseDTO> getAllEvents();

    /**
     * Retrieves a specific event by its ID.
     *
     * @param id the ID of the event to retrieve
     * @return the event details
     */
    EventResponseDTO getEventById(Long id);

    /**
     * Updates an existing event.
     *
     * @param id  the ID of the event to update
     * @param dto the updated event details
     * @return the updated event
     */
    EventResponseDTO updateEvent(Long id, EventRequestDTO dto);

    /**
     * Deletes an event by its ID.
     *
     * @param id the ID of the event to delete
     * @return the details of the deleted event
     */
    EventResponseDTO deleteEvent(Long id);

    /**
     * Reduces the available seats for a specific event.
     * This method is typically called by the Booking Service when tickets are
     * booked.
     *
     * @param eventId  the ID of the event
     * @param quantity the number of seats to reduce
     */
    void reduceAvailableSeats(Long eventId, Integer quantity);
}
