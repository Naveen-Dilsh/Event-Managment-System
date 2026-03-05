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
        Sponsorship s = sponsorshipRepository.findById(id)
                .orElseThrow(() -> new SponsorshipNotFoundException("Sponsorship not found with ID: " + id));
        String eventName = "Event " + s.getEventId();
        try {
            eventName = eventServiceClient.getEventById(s.getEventId()).getName();
        } catch (Exception e) {
        }
        return mapToResponseDTO(s, eventName);
    }

    @Override
    public List<SponsorshipResponseDTO> getAllSponsorships() {
        return sponsorshipRepository.findAll().stream()
                .map(s -> {
                    String eventName = "Event " + s.getEventId();
                    try {
                        eventName = eventServiceClient.getEventById(s.getEventId()).getName();
                    } catch (Exception e) {
                    }
                    return mapToResponseDTO(s, eventName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<SponsorshipResponseDTO> getSponsorshipsByEventId(Long eventId) {
        return sponsorshipRepository.findByEventId(eventId).stream()
                .map(s -> {
                    String eventName = "Event " + eventId;
                    try {
                        eventName = eventServiceClient.getEventById(eventId).getName();
                    } catch (Exception e) {
                    }
                    return mapToResponseDTO(s, eventName);
                })
                .collect(Collectors.toList());
    }

    @Override
    public SponsorshipResponseDTO updateSponsorship(Long id, SponsorshipRequestDTO dto) {
        Sponsorship s = sponsorshipRepository.findById(id)
                .orElseThrow(() -> new SponsorshipNotFoundException("Sponsorship not found with ID: " + id));

        validateTier(dto.getSponsorshipTier());

        s.setSponsorName(dto.getSponsorName());
        s.setSponsorEmail(dto.getSponsorEmail());
        s.setSponsorPhone(dto.getSponsorPhone());
        s.setCompanyName(dto.getCompanyName());
        s.setSponsorshipTier(dto.getSponsorshipTier().toUpperCase());
        s.setSponsorshipAmount(dto.getSponsorshipAmount());
        s.setCurrency(dto.getCurrency() != null ? dto.getCurrency() : "LKR");
        s.setBenefits(dto.getBenefits());
        s.setLogoUrl(dto.getLogoUrl());
        s.setWebsiteUrl(dto.getWebsiteUrl());
        s.setAgreementDate(dto.getAgreementDate());
        s.setStartDate(dto.getStartDate());
        s.setEndDate(dto.getEndDate());
        s.setNotes(dto.getNotes());

        Sponsorship updated = sponsorshipRepository.save(s);
        String eventName = "Event " + s.getEventId();
        try {
            eventName = eventServiceClient.getEventById(s.getEventId()).getName();
        } catch (Exception e) {
        }
        return mapToResponseDTO(updated, eventName);
    }

    @Override
    public SponsorshipResponseDTO updateSponsorshipStatus(Long id, String status) {
        Sponsorship s = sponsorshipRepository.findById(id)
                .orElseThrow(() -> new SponsorshipNotFoundException("Sponsorship not found with ID: " + id));
        s.setStatus(status);
        Sponsorship updated = sponsorshipRepository.save(s);
        String eventName = "Event " + s.getEventId();
        try {
            eventName = eventServiceClient.getEventById(s.getEventId()).getName();
        } catch (Exception e) {
        }
        return mapToResponseDTO(updated, eventName);
    }

    @Override
    public SponsorshipResponseDTO updatePaymentStatus(Long id, String paymentStatus) {
        Sponsorship s = sponsorshipRepository.findById(id)
                .orElseThrow(() -> new SponsorshipNotFoundException("Sponsorship not found with ID: " + id));
        s.setPaymentStatus(paymentStatus);
        Sponsorship updated = sponsorshipRepository.save(s);
        String eventName = "Event " + s.getEventId();
        try {
            eventName = eventServiceClient.getEventById(s.getEventId()).getName();
        } catch (Exception e) {
        }
        return mapToResponseDTO(updated, eventName);
    }

    @Override
    public void deleteSponsorship(Long id) {
        Sponsorship s = sponsorshipRepository.findById(id)
                .orElseThrow(() -> new SponsorshipNotFoundException("Sponsorship not found with ID: " + id));
        sponsorshipRepository.delete(s);
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