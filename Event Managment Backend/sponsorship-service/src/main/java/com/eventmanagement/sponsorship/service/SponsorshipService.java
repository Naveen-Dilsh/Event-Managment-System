package com.eventmanagement.sponsorship.service;

import com.eventmanagement.sponsorship.dto.SponsorshipRequestDTO;
import com.eventmanagement.sponsorship.dto.SponsorshipResponseDTO;

import java.util.List;

public interface SponsorshipService {
    SponsorshipResponseDTO createSponsorship(SponsorshipRequestDTO dto);
    SponsorshipResponseDTO getSponsorshipById(Long id);
    List<SponsorshipResponseDTO> getAllSponsorships();
    List<SponsorshipResponseDTO> getSponsorshipsByEventId(Long eventId);
    SponsorshipResponseDTO updateSponsorship(Long id, SponsorshipRequestDTO dto);
    SponsorshipResponseDTO updateSponsorshipStatus(Long id, String status);
    SponsorshipResponseDTO updatePaymentStatus(Long id, String paymentStatus);
    void deleteSponsorship(Long id);
}