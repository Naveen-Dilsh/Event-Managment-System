package com.eventmanagement.loyalty.controller;

import com.eventmanagement.loyalty.dto.LoyaltyRequestDTO;
import com.eventmanagement.loyalty.dto.LoyaltyResponseDTO;
import com.eventmanagement.loyalty.service.LoyaltyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
public class LoyaltyController {

    private final LoyaltyService loyaltyService;

    @PostMapping
    public ResponseEntity<LoyaltyResponseDTO> create(@Valid @RequestBody LoyaltyRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(loyaltyService.createAccount(dto));
    }

    @GetMapping
    public ResponseEntity<List<LoyaltyResponseDTO>> getAll() {
        return ResponseEntity.ok(loyaltyService.getAllAccounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoyaltyResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(loyaltyService.getAccountById(id));
    }

    @GetMapping("/attendee/{attendeeId}")
    public ResponseEntity<LoyaltyResponseDTO> getByAttendee(@PathVariable Long attendeeId) {
        return ResponseEntity.ok(loyaltyService.getAccountByAttendeeId(attendeeId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoyaltyResponseDTO> update(@PathVariable Long id,
                                                     @Valid @RequestBody LoyaltyRequestDTO dto) {
        return ResponseEntity.ok(loyaltyService.updateAccount(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        loyaltyService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}