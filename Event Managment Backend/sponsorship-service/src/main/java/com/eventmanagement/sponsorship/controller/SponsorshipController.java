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
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SponsorshipController {

    private final SponsorshipService sponsorshipService;

    // POST /api/sponsorships
    @PostMapping
    public ResponseEntity<SponsorshipResponseDTO> createSponsorship(
            @Valid @RequestBody SponsorshipRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sponsorshipService.createSponsorship(dto));
    }

    // GET /api/sponsorships
    @GetMapping
    public ResponseEntity<List<SponsorshipResponseDTO>> getAllSponsorships() {
        return ResponseEntity.ok(sponsorshipService.getAllSponsorships());
    }

    // GET /api/sponsorships/{id}
    @GetMapping("/{id}")
    public ResponseEntity<SponsorshipResponseDTO> getSponsorshipById(@PathVariable Long id) {
        return ResponseEntity.ok(sponsorshipService.getSponsorshipById(id));
    }

    // GET /api/sponsorships/event/{eventId}
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<SponsorshipResponseDTO>> getSponsorshipsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(sponsorshipService.getSponsorshipsByEventId(eventId));
    }

    // PUT /api/sponsorships/{id} - update all fields
    @PutMapping("/{id}")
    public ResponseEntity<SponsorshipResponseDTO> updateSponsorship(
            @PathVariable Long id,
            @Valid @RequestBody SponsorshipRequestDTO dto) {
        return ResponseEntity.ok(sponsorshipService.updateSponsorship(id, dto));
    }

    // PATCH /api/sponsorships/{id}/status - partial update for status
    @PatchMapping("/{id}/status")
    public ResponseEntity<SponsorshipResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                sponsorshipService.updateSponsorshipStatus(id, body.get("status")));
    }

    // PATCH /api/sponsorships/{id}/payment-status - partial update for payment
    // status
    @PatchMapping("/{id}/payment-status")
    public ResponseEntity<SponsorshipResponseDTO> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(
                sponsorshipService.updatePaymentStatus(id, body.get("paymentStatus")));
    }

    // DELETE /api/sponsorships/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSponsorship(@PathVariable Long id) {
        sponsorshipService.deleteSponsorship(id);
        return ResponseEntity.noContent().build();
    }
}