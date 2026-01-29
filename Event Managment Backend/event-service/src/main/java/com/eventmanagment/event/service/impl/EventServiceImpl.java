package com.eventmanagment.event.service.impl;

import com.eventmanagment.event.dto.EventRequestDTO;
import com.eventmanagment.event.dto.EventResponseDTO;
import com.eventmanagment.event.entity.Event;
import com.eventmanagment.event.exception.EventNotFoundException;
import com.eventmanagment.event.helper.EventMapper;
import com.eventmanagment.event.repository.EventRepository;
import com.eventmanagment.event.service.EventService;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;



@Slf4j
@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;

    @Override
    public EventResponseDTO createEvent(EventRequestDTO dto) {
        log.info("Creating event: {}", dto.getName());

        // Validate Event Data in Future

        // Validate Venue Exist and has Sufficient Capacity ?-------> OpenFeign

        // Create event entity
        Event event = eventMapper.mapToEntity(dto);
        event.setAvailableSeats(dto.getCapacity()); // Initially all seats available
        event.setStatus(Event.EventStatus.DRAFT); // Default status

        // Save Event
        Event savedEvent = eventRepository.save(event);
        log.info("Event created successfully with ID: {}", savedEvent.getId());

        return eventMapper.mapToResponseDTO(savedEvent);

    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDTO> getAllEvents(){
        log.info("Fetching All Events");

        List<Event> events = eventRepository.findAll();
        return events.stream()
                .map(eventMapper::mapToResponseDTO)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public EventResponseDTO getEventById(Long id){
        log.info("Fetching Event With Id : {}", id);
        Event event = eventRepository.findById(id)
                .orElseThrow();
        return eventMapper.mapToResponseDTO(event);
    }
}
