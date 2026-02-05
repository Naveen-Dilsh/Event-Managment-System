package com.eventmanagement.vendor.controller;

import com.eventmanagement.vendor.dto.VendorRequestDTO;
import com.eventmanagement.vendor.dto.VendorResponseDTO;
import com.eventmanagement.vendor.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    // CREATE - POST /api/vendors
    @PostMapping
    public ResponseEntity<VendorResponseDTO> createVendor(@Valid @RequestBody VendorRequestDTO vendorRequestDTO) {
        VendorResponseDTO createdVendor = vendorService.createVendor(vendorRequestDTO);
        return new ResponseEntity<>(createdVendor, HttpStatus.CREATED);
    }

    // READ - GET /api/vendors/{id}
    @GetMapping("/{id}")
    public ResponseEntity<VendorResponseDTO> getVendorById(@PathVariable Long id) {
        VendorResponseDTO vendor = vendorService.getVendorById(id);
        return ResponseEntity.ok(vendor); 
 T /api/vendors
    @GetMapping ntity<List<VendorResponseDTO>> getAllVendors() {
        List<VendorResponseDTO> vendors = vendorService.getAllVendors();
        return ResponseEntity.ok(vendors);
    }

    // READ BY EVENT - GET /api/vendors/event/{eventId}
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<VendorResponseDTO>> getVendorsByEventId(@PathVariable Long eventId) {
        List<VendorResponseDTO> vendors = vendorService.getVendorsByEventId(eventId);
        return ResponseEntity.ok(vendors);
    } 
    // READ BY TYPE - GET /api/vendors/type/{vendorType} pe/{vendorType}")
    public ResponseEntity<List<VendorResponseDTO>> getVendorsByType(@PathVariable String vendorType) {
        List<VendorResponseDTO> vendors = vendorService.getVendorsByType(vendorType);
        return ResponseEntity.ok(vendors);
    }

    // READ BY STATUS - GET /api/vendors/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<VendorResponseDTO>> getVendorsByContractStatus(@PathVariable String status) {
        List<VendorResponseDTO> vendors = vendorService.getVendorsByContractStatus(status);
        return ResponseEntity.ok(vendors);
    }

    // UPDATE - PUT /api/vendors/{id}
    @PutMapping("/{id}")
    public ResponseEntity<VendorResponseDTO> updateVendor(@PathVariable Long id,
            @Valid @RequestBody VendorRequestDTO vendorRequestDTO) {
        VendorResponseDTO updatedVendor = vendorService.updateVendor(id, vendorRequestDTO);
        return ResponseEntity.ok(updatedVendor);
    }

    // DELETE - DELETE /api/vendors/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }
}
      