package com.eventmanagement.venue.service.impl;

import com.eventmanagement.venue.dto.VenueRequestDTO;
import com.eventmanagement.venue.dto.VenueResponseDTO;
import com.eventmanagement.venue.entity.Venue;
import com.eventmanagement.venue.exception.ResourceNotFoundException;
import com.eventmanagement.venue.repository.VenueRepository;
import com.eventmanagement.venue.service.VenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VenueServiceImpl implements VenueService {

    private final VenueRepository venueRepository;

    @Override
    public VenueResponseDTO createVenue(VenueRequestDTO dto) {
        Venue venue = mapToEntity(dto);
        Venue savedVenue = venueRepository.save(venue);
        return mapToDTO(savedVenue);
    }

    @Override
    public VenueResponseDTO getVenueById(Long id) {
        Venue venue = getVenueEntity(id);
        return mapToDTO(venue);
    }

    @Override
    public List<VenueResponseDTO> getAllVenues() {
        return venueRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public VenueResponseDTO updateVenue(Long id, VenueRequestDTO dto) {
        Venue existingVenue = getVenueEntity(id);

        existingVenue.setName(dto.getName());
        existingVenue.setAddress(dto.getAddress());
        existingVenue.setCity(dto.getCity());
        existingVenue.setState(dto.getState());
        existingVenue.setCountry(dto.getCountry());
        existingVenue.setPostalCode(dto.getPostalCode());
        existingVenue.setCapacity(dto.getCapacity());
        existingVenue.setVenueType(dto.getVenueType());
        existingVenue.setFacilities(dto.getFacilities());
        existingVenue.setContactEmail(dto.getContactEmail());
        existingVenue.setContactPhone(dto.getContactPhone());

        Venue updatedVenue = venueRepository.save(existingVenue);
        return mapToDTO(updatedVenue);
    }

    @Override
    public void deleteVenue(Long id) {
        Venue venue = getVenueEntity(id);
        venueRepository.delete(venue);
    }

    private Venue getVenueEntity(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + id));
    }

    private Venue mapToEntity(VenueRequestDTO dto) {
        return Venue.builder()
                .name(dto.getName())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .postalCode(dto.getPostalCode())
                .capacity(dto.getCapacity())
                .venueType(dto.getVenueType())
                .facilities(dto.getFacilities())
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .build();
    }

    private VenueResponseDTO mapToDTO(Venue venue) {
        return VenueResponseDTO.builder()
                .id(venue.getId())
                .name(venue.getName())
                .address(venue.getAddress())
                .city(venue.getCity())
                .state(venue.getState())
                .country(venue.getCountry())
                .postalCode(venue.getPostalCode())
                .capacity(venue.getCapacity())
                .venueType(venue.getVenueType())
                .facilities(venue.getFacilities())
                .contactEmail(venue.getContactEmail())
                .contactPhone(venue.getContactPhone())
                .createdAt(venue.getCreatedAt())
                .updatedAt(venue.getUpdatedAt())
                .build();
    }
}
