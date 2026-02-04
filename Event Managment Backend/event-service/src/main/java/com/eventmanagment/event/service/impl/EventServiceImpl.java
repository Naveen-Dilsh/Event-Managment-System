package com.eventmanagment.event.service.impl;

import com.eventmanagment.event.dto.EventRequestDTO;
import com.eventmanagment.event.dto.EventResponseDTO;
import com.eventmanagment.event.entity.Event;
import com.eventmanagment.event.exception.EventNotFoundException;
import com.eventmanagment.event.helper.EventMapper;
import com.eventmanagment.event.helper.Validator;
import com.eventmanagment.event.repository.EventRepository;
import com.eventmanagment.event.service.EventService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final Validator validator;

    @Override
    public EventResponseDTO createEvent(EventRequestDTO dto) {
        log.info("Creating event: {}", dto.getName());

        // ToDo : Validate Event Data in Future
        validator.validateEventDate(dto.getEventDate());

        // ToDo : Validate Venue Exist and has Sufficient Capacity ?-------> OpenFeign

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
    public List<EventResponseDTO> getAllEvents() {
        log.info("Fetching All Events");

        List<Event> events = eventRepository.findAll();
        return events.stream()
                .map(eventMapper::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponseDTO getEventById(Long id) {
        log.info("Fetching Event With Id : {}", id);
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + id));
        return eventMapper.mapToResponseDTO(event);
    }

    @Override
    public EventResponseDTO updateEvent(Long id, EventRequestDTO dto) {

        // Check an event Exists
        Event existEvent = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + id));

        // ToDo : Validate Date is Future
        validator.validateEventDate(dto.getEventDate());

        // ToDo : If Venue is Changed Validate New venue Exist

        // Update event fields
        existEvent.setName(dto.getName());
        existEvent.setDescription(dto.getDescription());
        existEvent.setEventDate(dto.getEventDate());
        existEvent.setStartTime(dto.getStartTime());
        existEvent.setEndTime(dto.getEndTime());
        existEvent.setVenueId(dto.getVenueId());
        existEvent.setCategory(dto.getCategory());
        existEvent.setCapacity(dto.getCapacity());
        existEvent.setOrganizerName(dto.getOrganizerName());
        existEvent.setOrganizerContact(dto.getOrganizerContact());
        existEvent.setImageUrl(dto.getImageUrl());
        existEvent.setUpdatedAt(LocalDateTime.now());

        // Save to Database
        Event updatedEvent = eventRepository.save(existEvent);

        return eventMapper.mapToResponseDTO(updatedEvent);
    }

    @Override
    public EventResponseDTO deleteEvent(Long id) {

        // Check if event Exists
        Event existEvent = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + id));

        EventResponseDTO deleteEvent = eventMapper.mapToResponseDTO(existEvent);
        eventRepository.delete(existEvent);
        return deleteEvent;
    }

    @Override
    public void reduceAvailableSeats(Long eventId, Integer quantity) {

        // Get event
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException("Event not found with ID: " + eventId));

        // Validate sufficient seats available
        if (event.getAvailableSeats() < quantity) {
            throw new IllegalArgumentException(
                    "Insufficient seats available. Requested: " + quantity +
                            ", Available: " + event.getAvailableSeats()
            );
        }

        // Reduce available seats
        event.setAvailableSeats(event.getAvailableSeats() - quantity);
        event.setUpdatedAt(LocalDateTime.now());

        eventRepository.save(event);
        log.info("Available seats reduced successfully. Remaining seats: {}", event.getAvailableSeats());
    }
}
