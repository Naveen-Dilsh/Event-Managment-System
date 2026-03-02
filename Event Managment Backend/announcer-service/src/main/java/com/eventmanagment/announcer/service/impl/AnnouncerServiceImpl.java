package com.eventmanagment.announcer.service.impl;

import com.eventmanagment.announcer.dto.*;
import com.eventmanagment.announcer.entity.Announcer;
import com.eventmanagment.announcer.exception.AnnouncerNotFoundException;
import com.eventmanagment.announcer.repository.AnnouncerRepository;
import com.eventmanagment.announcer.service.AnnouncerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

//Implements Announcer CRUD
@Service
@RequiredArgsConstructor
public class AnnouncerServiceImpl implements AnnouncerService {

    private final AnnouncerRepository announcerRepository;

    //// CREATE (POST)
    @Override
    public AnnouncerResponseDTO createAnnouncer(AnnouncerRequestDTO dto) {

        Announcer announcer = new Announcer();
        announcer.setFullName(dto.getFullName());
        announcer.setEmail(dto.getEmail());
        announcer.setPhone(dto.getPhone());
        announcer.setSpecialization(dto.getSpecialization());
        announcer.setBio(dto.getBio());
        announcer.setExperienceYears(dto.getExperienceYears());
        announcer.setStatus(dto.getStatus());

        // Save announcer into DB
        Announcer saved = announcerRepository.save(announcer);

        return mapToDTO(saved);
    }

    // READ (GET by ID)
    @Override
    public AnnouncerResponseDTO getAnnouncerById(Long id) {
        Announcer announcer = announcerRepository.findById(id)
                .orElseThrow(() -> new AnnouncerNotFoundException("Announcer not found: " + id));

        return mapToDTO(announcer);
    }

    // READ ALL (GET all announcers)
    @Override
    public List<AnnouncerResponseDTO> getAllAnnouncers() {
        return announcerRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // UPDATE (PUT)
    @Override
    public AnnouncerResponseDTO updateAnnouncer(Long id, AnnouncerRequestDTO dto) {

        // Ensure announcer exists before updating
        Announcer announcer = announcerRepository.findById(id)
                .orElseThrow(() -> new AnnouncerNotFoundException("Announcer not found: " + id));

        // Update fields
        announcer.setFullName(dto.getFullName());
        announcer.setEmail(dto.getEmail());
        announcer.setPhone(dto.getPhone());
        announcer.setSpecialization(dto.getSpecialization());
        announcer.setBio(dto.getBio());
        announcer.setExperienceYears(dto.getExperienceYears());
        announcer.setStatus(dto.getStatus());

        Announcer updated = announcerRepository.save(announcer);

        return mapToDTO(updated);
    }

    // DELETE (DELETE)
    @Override
    public void deleteAnnouncer(Long id) {
        // Check existence before deleting
        if (!announcerRepository.existsById(id)) {
            throw new AnnouncerNotFoundException("Announcer not found: " + id);
        }
        announcerRepository.deleteById(id);
    }

    // Mapper
    private AnnouncerResponseDTO mapToDTO(Announcer announcer) {
        AnnouncerResponseDTO dto = new AnnouncerResponseDTO();

        dto.setId(announcer.getId());
        dto.setFullName(announcer.getFullName());
        dto.setEmail(announcer.getEmail());
        dto.setPhone(announcer.getPhone());
        dto.setSpecialization(announcer.getSpecialization());
        dto.setBio(announcer.getBio());
        dto.setExperienceYears(announcer.getExperienceYears());
        dto.setStatus(announcer.getStatus());
        dto.setCreatedAt(announcer.getCreatedAt());
        dto.setUpdatedAt(announcer.getUpdatedAt());

        return dto;
    }
}