package com.eventmanagement.venue.controller;

import com.eventmanagement.venue.dto.VenueRequestDTO;
import com.eventmanagement.venue.dto.VenueResponseDTO;
import com.eventmanagement.venue.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @PostMapping
    public ResponseEntity<VenueResponseDTO> createVenue(@Valid @RequestBody VenueRequestDTO dto) {
        VenueResponseDTO createdVenue = venueService.createVenue(dto);
        return new ResponseEntity<>(createdVenue, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VenueResponseDTO>> getAllVenues() {
        List<VenueResponseDTO> venues = venueService.getAllVenues();
        return ResponseEntity.ok(venues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueResponseDTO> getVenueById(@PathVariable Long id) {
        VenueResponseDTO venue = venueService.getVenueById(id);
        return ResponseEntity.ok(venue);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueResponseDTO> updateVenue(
            @PathVariable Long id,
            @Valid @RequestBody VenueRequestDTO dto) {
        VenueResponseDTO updatedVenue = venueService.updateVenue(id, dto);
        return ResponseEntity.ok(updatedVenue);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }
}
