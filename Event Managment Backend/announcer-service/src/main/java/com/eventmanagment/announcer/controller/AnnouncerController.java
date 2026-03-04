package com.eventmanagment.announcer.controller;

import com.eventmanagment.announcer.dto.*;
import com.eventmanagment.announcer.service.AnnouncerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/announcers")
@RequiredArgsConstructor
public class AnnouncerController {

    private final AnnouncerService announcerService;

    @PostMapping
    public ResponseEntity<AnnouncerResponseDTO> create(@Valid @RequestBody AnnouncerRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(announcerService.createAnnouncer(dto));
    }

    @GetMapping
    public ResponseEntity<List<AnnouncerResponseDTO>> getAll() {
        return ResponseEntity.ok(announcerService.getAllAnnouncers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncerResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(announcerService.getAnnouncerById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnouncerResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncerRequestDTO dto) {

        return ResponseEntity.ok(announcerService.updateAnnouncer(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        announcerService.deleteAnnouncer(id);
        return ResponseEntity.noContent().build();
    }
}