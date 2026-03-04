package com.eventmanagement.sponsorship.controller;

import com.eventmanagement.sponsorship.dto.SponsorshipRequestDTO;
import com.eventmanagement.sponsorship.dto.SponsorshipResponseDTO;
import com.eventmanagement.sponsorship.service.SponsorshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sponsorships")
@RequiredArgsConstructor
public class SponsorshipController {

    private final SponsorshipService sponsorshipService;

    @PostMapping
    public ResponseEntity<SponsorshipResponseDTO> createSponsorship(
            @Valid @RequestBody SponsorshipRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sponsorshipService.createSponsorship(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SponsorshipResponseDTO> getSponsorshipById(@PathVariable Long id) {
        return ResponseEntity.ok(sponsorshipService.getSponsorshipById(id));
    }

    @GetMapping
    public ResponseEntity<List<SponsorshipResponseDTO>> getAllSponsorships() {
        return ResponseEntity.ok(sponsorshipService.getAllSponsorships());
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SponsorshipResponseDTO>> getSponsorshipsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(sponsorshipService.getSponsorshipsByEventId(eventId));
    }
}