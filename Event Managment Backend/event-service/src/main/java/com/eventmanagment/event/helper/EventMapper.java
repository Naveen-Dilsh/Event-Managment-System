package com.eventmanagment.event.helper;

import com.eventmanagment.event.dto.EventRequestDTO;
import com.eventmanagment.event.dto.EventResponseDTO;
import com.eventmanagment.event.entity.Event;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event mapToEntity(EventRequestDTO dto) {
        Event event = new Event();
        event.setName(dto.getName());
        event.setDescription(dto.getDescription());
        event.setEventDate(dto.getEventDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setVenueId(dto.getVenueId());
        event.setCategory(dto.getCategory());
        event.setCapacity(dto.getCapacity());
        event.setOrganizerName(dto.getOrganizerName());
        event.setOrganizerContact(dto.getOrganizerContact());
        event.setImageUrl(dto.getImageUrl());
        return event;
    }

    public EventResponseDTO mapToResponseDTO(Event event) {
        EventResponseDTO dto = new EventResponseDTO();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setDescription(event.getDescription());
        dto.setEventDate(event.getEventDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setVenueId(event.getVenueId());
        dto.setCategory(event.getCategory());
        dto.setCapacity(event.getCapacity());
        dto.setAvailableSeats(event.getAvailableSeats());
        dto.setStatus(event.getStatus());
        dto.setOrganizerName(event.getOrganizerName());
        dto.setOrganizerContact(event.getOrganizerContact());
        dto.setImageUrl(event.getImageUrl());
        dto.setCreatedAt(event.getCreatedAt());
        dto.setUpdatedAt(event.getUpdatedAt());
        return dto;

    }
}
