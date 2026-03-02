package com.eventmanagement.venue.service;

import com.eventmanagement.venue.dto.VenueRequestDTO;
import com.eventmanagement.venue.dto.VenueResponseDTO;

import java.util.List;

public interface VenueService {
    VenueResponseDTO createVenue(VenueRequestDTO dto);

    VenueResponseDTO getVenueById(Long id);

    List<VenueResponseDTO> getAllVenues();

    VenueResponseDTO updateVenue(Long id, VenueRequestDTO dto);

    void deleteVenue(Long id);
}
