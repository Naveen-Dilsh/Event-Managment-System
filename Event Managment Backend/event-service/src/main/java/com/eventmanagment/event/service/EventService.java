package com.eventmanagment.event.service;

import com.eventmanagment.event.dto.EventRequestDTO;
import com.eventmanagment.event.dto.EventResponseDTO;

public interface EventService {

    // To Create Event.
    EventResponseDTO createEvent(EventRequestDTO dto);

}
