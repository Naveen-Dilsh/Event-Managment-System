package com.eventmanagement.sponsorship.service.impl;

import com.eventmanagement.sponsorship.client.EventServiceClient;
import com.eventmanagement.sponsorship.dto.*;
import com.eventmanagement.sponsorship.entity.Sponsorship;
import com.eventmanagement.sponsorship.exception.*;
import com.eventmanagement.sponsorship.repository.SponsorshipRepository;
import com.eventmanagement.sponsorship.service.SponsorshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SponsorshipServiceImpl implements SponsorshipService {

    private final SponsorshipRepository sponsorshipRepository;
    private final EventServiceClient eventServiceClient;

    @Override
    public SponsorshipResponseDTO createSponsorship(SponsorshipRequestDTO dto) {
        EventDTO event;
        try {
            event = eventServiceClient.getEventById(dto.getEventId());
        } catch (Exception e) {
            throw new EventNotFoundException("Event not found with ID: " + dto.getEventId());
        }

        validateTier(dto.getSponsorshipTier());

        Sponsorship sponsorship = new Sponsorship();
        sponsorship.setEventId(dto.getEventId());
        sponsorship.setSponsorName(dto.getSponsorName());
        sponsorship.setSponsorEmail(dto.getSponsorEmail());
        sponsorship.setSponsorPhone(dto.getSponsorPhone());
        sponsorship.setCompanyName(dto.getCompanyName());
        sponsorship.setSponsorshipTier(dto.getSponsorshipTier().toUpperCase());
        sponsorship.setSponsorshipAmount(dto.getSponsorshipAmount());
        sponsorship.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "LKR");
        sponsorship.setBenefits(dto.getBenefits());
        sponsorship.setLogoUrl(dto.getLogoUrl());
        sponsorship.setWebsiteUrl(dto.getWebsiteUrl());
        sponsorship.setAgreementDate(dto.getAgreementDate());
        sponsorship.setStartDate(dto.getStartDate());
        sponsorship.setEndDate(dto.getEndDate());
        sponsorship.setNotes(dto.getNotes());

        Sponsorship saved = sponsorshipRepository.save(sponsorship);
        return mapToResponseDTO(saved, event.getName());
    }

    @Override
    public SponsorshipResponseDTO getSponsorshipById(Long id) {
        return null;
    }

    @Override
    public List<SponsorshipResponseDTO> getAllSponsorships() {
        return List.of();
    }

    @Override
    public List<SponsorshipResponseDTO> getSponsorshipsByEventId(Long eventId) {
        return List.of();
    }

    @Override
    public SponsorshipResponseDTO updateSponsorship(Long id, SponsorshipRequestDTO dto) {
        return null;
    }

    @Override
    public SponsorshipResponseDTO updateSponsorshipStatus(Long id, String status) {
        return null;
    }

    @Override
    public SponsorshipResponseDTO updatePaymentStatus(Long id, String paymentStatus) {
        return null;
    }

    @Override
    public void deleteSponsorship(Long id) {

    }

    // Other methods (getById, update, delete) follow the same structure
    // Helper methods for validation and mapping

    private void validateTier(String tier) {
        List<String> valid = List.of("PLATINUM", "GOLD", "SILVER", "BRONZE");
        if (!valid.contains(tier.toUpperCase()))
            throw new InvalidSponsorshipException("Invalid tier. Valid values: PLATINUM, GOLD, SILVER, BRONZE");
    }

    private SponsorshipResponseDTO mapToResponseDTO(Sponsorship s, String eventName) {
        SponsorshipResponseDTO dto = new SponsorshipResponseDTO();
        dto.setId(s.getId());
        dto.setEventId(s.getEventId());
        dto.setEventName(eventName);
        dto.setSponsorName(s.getSponsorName());
        dto.setSponsorEmail(s.getSponsorEmail());
        dto.setSponsorPhone(s.getSponsorPhone());
        dto.setCompanyName(s.getCompanyName());
        dto.setSponsorshipTier(s.getSponsorshipTier());
        dto.setSponsorshipAmount(s.getSponsorshipAmount());
        dto.setCurrency(s.getCurrency());
        dto.setBenefits(s.getBenefits());
        dto.setLogoUrl(s.getLogoUrl());
        dto.setWebsiteUrl(s.getWebsiteUrl());
        dto.setStatus(s.getStatus());
        dto.setPaymentStatus(s.getPaymentStatus());
        dto.setAgreementDate(s.getAgreementDate());
        dto.setStartDate(s.getStartDate());
        dto.setEndDate(s.getEndDate());
        dto.setNotes(s.getNotes());
        dto.setCreatedAt(s.getCreatedAt());
        dto.setUpdatedAt(s.getUpdatedAt());
        return dto;
    }
}