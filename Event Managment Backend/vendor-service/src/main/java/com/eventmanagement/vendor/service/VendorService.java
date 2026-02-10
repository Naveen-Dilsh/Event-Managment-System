package com.eventmanagement.vendor.service;

import com.eventmanagement.vendor.dto.VendorRequestDTO;
import com.eventmanagement.vendor.dto.VendorResponseDTO;

import java.util.List;

public interface VendorService {

    VendorResponseDTO createVendor(VendorRequestDTO vendorRequestDTO);

    VendorResponseDTO getVendorById(Long id);

    List<VendorResponseDTO> getAllVendors();

    List<VendorResponseDTO> getVendorsByEventId(Long eventId);

    List<VendorResponseDTO> getVendorsByType(String vendorType);

    List<VendorResponseDTO> getVendorsByContractStatus(String contractStatus);

    VendorResponseDTO updateVendor(Long id, VendorRequestDTO vendorRequestDTO);

    void deleteVendor(Long id);
}
