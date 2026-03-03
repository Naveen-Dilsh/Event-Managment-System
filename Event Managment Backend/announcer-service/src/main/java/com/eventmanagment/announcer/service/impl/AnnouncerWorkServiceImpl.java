package com.eventmanagment.announcer.service.impl;

import com.eventmanagment.announcer.client.EventServiceClient;
import com.eventmanagment.announcer.dto.*;
import com.eventmanagment.announcer.entity.Announcer;
import com.eventmanagment.announcer.entity.AnnouncerWork;
import com.eventmanagment.announcer.exception.AnnouncerNotFoundException;
import com.eventmanagment.announcer.repository.AnnouncerRepository;
import com.eventmanagment.announcer.repository.AnnouncerWorkRepository;
import com.eventmanagment.announcer.service.AnnouncerWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncerWorkServiceImpl implements AnnouncerWorkService {

    private final AnnouncerWorkRepository workRepository;
    private final AnnouncerRepository announcerRepository;
    private final EventServiceClient eventServiceClient;

    // CREATE (POST): Add a past work for an announcer
    @Override
    public AnnouncerWorkResponseDTO addWork(AnnouncerWorkRequestDTO dto) {

        //Validate Announcer exists
        Announcer announcer = announcerRepository.findById(dto.getAnnouncerId())
                .orElseThrow(() ->
                        new AnnouncerNotFoundException("Announcer not found: " + dto.getAnnouncerId())
                );

        //Validate Event exists (Feign Call)
        EventDTO event;
        try {
            event = eventServiceClient.getEventById(dto.getEventId());
        } catch (Exception e) {
            throw new RuntimeException("Event not found with ID: " + dto.getEventId());
        }

        //  Create Work
        AnnouncerWork work = new AnnouncerWork();
        work.setAnnouncerId(dto.getAnnouncerId());
        work.setEventId(dto.getEventId());
        work.setEventName(event.getName()); // store locally
        work.setRole(dto.getRole());
        work.setEventDate(dto.getEventDate());
        work.setNotes(dto.getNotes());

        AnnouncerWork saved = workRepository.save(work);

        return mapToDTO(saved, announcer.getFullName());
    }

    // READ (GET by ID): Fetch a single past work by its ID
    @Override
    public AnnouncerWorkResponseDTO getWorkById(Long id) {

        AnnouncerWork work = workRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work not found: " + id));

        String announcerName = announcerRepository.findById(work.getAnnouncerId())
                .map(Announcer::getFullName)
                .orElse("Unknown");

        return mapToDTO(work, announcerName);
    }

    // READ (GET by announcer): Fetch all past works for an announcer
    @Override
    public List<AnnouncerWorkResponseDTO> getWorksByAnnouncer(Long announcerId) {

        Announcer announcer = announcerRepository.findById(announcerId)
                .orElseThrow(() ->
                        new AnnouncerNotFoundException("Announcer not found: " + announcerId)
                );

        return workRepository.findByAnnouncerId(announcerId)
                .stream()
                .sorted((w1, w2) -> w2.getEventDate().compareTo(w1.getEventDate()))
                .map(work -> mapToDTO(work, announcer.getFullName()))
                .collect(Collectors.toList());
    }

    // READ (GET all): Fetch all past works in the system
    @Override
    public List<AnnouncerWorkResponseDTO> getAllWorks() {

        return workRepository.findAll()
                .stream()
                .map(work -> {
                    String name = announcerRepository.findById(work.getAnnouncerId())
                            .map(Announcer::getFullName)
                            .orElse("Unknown");

                    return mapToDTO(work, name);
                })
                .collect(Collectors.toList());
    }

    // UPDATE (PUT): Update role/date/notes of a past work
    @Override
    public AnnouncerWorkResponseDTO updateWork(Long id, AnnouncerWorkRequestDTO dto) {

        AnnouncerWork work = workRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work not found: " + id));

        work.setRole(dto.getRole());
        work.setEventDate(dto.getEventDate());
        work.setNotes(dto.getNotes());

        AnnouncerWork updated = workRepository.save(work);

        String name = announcerRepository.findById(updated.getAnnouncerId())
                .map(Announcer::getFullName)
                .orElse("Unknown");

        return mapToDTO(updated, name);
    }

    // DELETE (DELETE): Remove a past work by ID
    @Override
    public void deleteWork(Long id) {
        if (!workRepository.existsById(id)) {
            throw new RuntimeException("Work not found: " + id);
        }
        workRepository.deleteById(id);
    }

    // Mapper
    private AnnouncerWorkResponseDTO mapToDTO(AnnouncerWork work, String announcerName) {

        AnnouncerWorkResponseDTO dto = new AnnouncerWorkResponseDTO();

        dto.setId(work.getId());
        dto.setAnnouncerId(work.getAnnouncerId());
        dto.setAnnouncerName(announcerName);
        dto.setEventId(work.getEventId());
        dto.setEventName(work.getEventName());
        dto.setRole(work.getRole());
        dto.setEventDate(work.getEventDate());
        dto.setNotes(work.getNotes());
        dto.setCreatedAt(work.getCreatedAt());

        return dto;
    }
}