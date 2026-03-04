package com.eventmanagment.announcer.controller;

import com.eventmanagment.announcer.dto.*;
import com.eventmanagment.announcer.service.AnnouncerWorkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/announcer-works")
@RequiredArgsConstructor
public class AnnouncerWorkController {

    private final AnnouncerWorkService workService;

    @PostMapping
    public ResponseEntity<AnnouncerWorkResponseDTO> addWork(
            @Valid @RequestBody AnnouncerWorkRequestDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workService.addWork(dto));
    }

    @GetMapping
    public ResponseEntity<List<AnnouncerWorkResponseDTO>> getAll() {
        return ResponseEntity.ok(workService.getAllWorks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncerWorkResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workService.getWorkById(id));
    }

    @GetMapping("/announcer/{announcerId}")
    public ResponseEntity<List<AnnouncerWorkResponseDTO>> getByAnnouncer(
            @PathVariable Long announcerId) {

        return ResponseEntity.ok(workService.getWorksByAnnouncer(announcerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnouncerWorkResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncerWorkRequestDTO dto) {

        return ResponseEntity.ok(workService.updateWork(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workService.deleteWork(id);
        return ResponseEntity.noContent().build();
    }
}