package com.eventmanagement.attendee.controller;

import com.eventmanagement.attendee.dto.AttendeeRequestDTO;
import com.eventmanagement.attendee.dto.AttendeeResponseDTO;
import com.eventmanagement.attendee.service.AttendeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendees")
public class AttendeeController {

    private final AttendeeService attendeeService;

    public AttendeeController(AttendeeService attendeeService) {
        this.attendeeService = attendeeService;
    }

    @PostMapping
    public ResponseEntity<AttendeeResponseDTO> createAttendee(@Valid @RequestBody AttendeeRequestDTO dto) {
        return new ResponseEntity<>(attendeeService.createAttendee(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AttendeeResponseDTO>> getAllAttendees() {
        return ResponseEntity.ok(attendeeService.getAllAttendees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendeeResponseDTO> getAttendeeById(@PathVariable Long id) {
        return ResponseEntity.ok(attendeeService.getAttendeeById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<AttendeeResponseDTO> getAttendeeByEmail(@PathVariable String email) {
        return ResponseEntity.ok(attendeeService.getAttendeeByEmail(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendeeResponseDTO> updateAttendee(@PathVariable Long id, @Valid @RequestBody AttendeeRequestDTO dto) {
        return ResponseEntity.ok(attendeeService.updateAttendee(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendee(@PathVariable Long id) {
        attendeeService.deleteAttendee(id);
        return ResponseEntity.noContent().build();
    }
}
