package com.eventmanagment.event.service;

import com.eventmanagment.event.dto.EventRequestDTO;
import com.eventmanagment.event.dto.EventResponseDTO;

import java.util.List;

public interface EventService {

    // To Create Event.
    EventResponseDTO createEvent(EventRequestDTO dto);

    // Get All Events
    List<EventResponseDTO> getAllEvents();

    // Get Event By ID
    EventResponseDTO getEventById(Long id);

}
