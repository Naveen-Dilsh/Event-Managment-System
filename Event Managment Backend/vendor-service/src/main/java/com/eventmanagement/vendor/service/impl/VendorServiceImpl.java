package com.eventmanagement.vendor.service.impl;

import com.eventmanagement.vendor.client.EventServiceClient;
import com.eventmanagement.vendor.dto.EventDTO;
import com.eventmanagement.vendor.dto.VendorRequestDTO;
import com.eventmanagement.vendor.dto.VendorResponseDTO;
import com.eventmanagement.vendor.entity.Vendor;
import com.eventmanagement.vendor.exception.EventNotFoundException;
import com.eventmanagement.vendor.exception.InvalidCostException;
import com.eventmanagement.vendor.exception.VendorNotFoundException;
import com.eventmanagement.vendor.repository.VendorRepository;
import com.eventmanagement.vendor.service.VendorService;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class VendorServiceImpl implements VendorService {

    private final VendorRepository vendorRepository;
    private final EventServiceClient eventServiceClient;

    @Override
    public VendorResponseDTO createVendor(VendorRequestDTO vendorRequestDTO) {
        // Validate event exists if eventId is provided
        if (vendorRequestDTO.getEventId() != null) {
            validateEventExists(vendorRequestDTO.getEventId());
        }

        // Validate cost is positive
        validateCost(vendorRequestDTO.getCost());

        Vendor vendor = mapToEntity(vendorRequestDTO);
        Vendor savedVendor = vendorRepository.save(vendor);
        log.info("Created vendor with id: {}", savedVendor.getId());
        return mapToResponseDTO(savedVendor);
    }

    @Override
    @Transactional(readOnly = true)
    public VendorResponseDTO getVendorById(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new VendorNotFoundException("Vendor not found with id: " + id));
        return mapToResponseDTO(vendor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponseDTO> getAllVendors() {
        return vendorRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponseDTO> getVendorsByEventId(Long eventId) {
        return vendorRepository.findByEventId(eventId).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponseDTO> getVendorsByType(String vendorType) {
        return vendorRepository.findByVendorType(vendorType).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorResponseDTO> getVendorsByContractStatus(String contractStatus) {
        return vendorRepository.findByContractStatus(contractStatus).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public VendorResponseDTO updateVendor(Long id, VendorRequestDTO vendorRequestDTO) {
        Vendor existingVendor = vendorRepository.findById(id)
                .orElseThrow(() -> new VendorNotFoundException("Vendor not found with id: " + id));

        // Validate event exists if eventId is being changed
        if (vendorRequestDTO.getEventId() != null &&
                !vendorRequestDTO.getEventId().equals(existingVendor.getEventId())) {
            validateEventExists(vendorRequestDTO.getEventId());
        }

        // Validate cost is positive
        validateCost(vendorRequestDTO.getCost());

        existingVendor.setEventId(vendorRequestDTO.getEventId());
        existingVendor.setVendorName(vendorRequestDTO.getVendorName());
        existingVendor.setVendorType(vendorRequestDTO.getVendorType());
        existingVendor.setContactPerson(vendorRequestDTO.getContactPerson());
        existingVendor.setContactEmail(vendorRequestDTO.getContactEmail());
        existingVendor.setContactPhone(vendorRequestDTO.getContactPhone());
        existingVendor.setServiceDescription(vendorRequestDTO.getServiceDescription());
        existingVendor.setCost(vendorRequestDTO.getCost());
        existingVendor.setContractStatus(vendorRequestDTO.getContractStatus());

        Vendor updatedVendor = vendorRepository.save(existingVendor);
        log.info("Updated vendor with id: {}", updatedVendor.getId());
        return mapToResponseDTO(updatedVendor);
    }

    @Override
    public void deleteVendor(Long id) {
        if (!vendorRepository.existsById(id)) {
            throw new VendorNotFoundException("Vendor not found with id: " + id);
        }
        vendorRepository.deleteById(id);
        log.info("Deleted vendor with id: {}", id);
    }

    /**
     * Validates that an event exists by calling the Event Service via OpenFeign
     */
    private void validateEventExists(Long eventId) {
        try {
            EventDTO event = eventServiceClient.getEventById(eventId);
            log.debug("Event validated successfully: {}", event.getName());
        } catch (FeignException.NotFound e) {
            log.error("Event not found with id: {}", eventId);
            throw new EventNotFoundException("Event not found with id: " + eventId);
        } catch (FeignException e) {
            log.error("Error communicating with Event Service: {}", e.getMessage());
            throw e; // Let GlobalExceptionHandler handle this
        }
    }

    /**
     * Validates that cost is positive
     */
    private void validateCost(Double cost) {
        if (cost != null && cost <= 0) {
            throw new InvalidCostException("Cost must be positive. Provided value: " + cost);
        }
    }

    private Vendor mapToEntity(VendorRequestDTO dto) {
        return Vendor.builder()
                .eventId(dto.getEventId())
                .vendorName(dto.getVendorName())
                .vendorType(dto.getVendorType())
                .contactPerson(dto.getContactPerson())
                .contactEmail(dto.getContactEmail())
                .contactPhone(dto.getContactPhone())
                .serviceDescription(dto.getServiceDescription())
                .cost(dto.getCost())
                .contractStatus(dto.getContractStatus())
                .build();
    }

    private VendorResponseDTO mapToResponseDTO(Vendor vendor) {
        return VendorResponseDTO.builder()
                .id(vendor.getId())
                .eventId(vendor.getEventId())
                .vendorName(vendor.getVendorName())
                .vendorType(vendor.getVendorType())
                .contactPerson(vendor.getContactPerson())
                .contactEmail(vendor.getContactEmail())
                .contactPhone(vendor.getContactPhone())
                .serviceDescription(vendor.getServiceDescription())
                .cost(vendor.getCost())
                .contractStatus(vendor.getContractStatus())
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .build();
    }
}
