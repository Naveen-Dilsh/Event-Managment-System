package com.eventmanagement.attendee.controller;

import com.eventmanagement.attendee.dto.AttendeeRequestDTO;
import com.eventmanagement.attendee.dto.AttendeeResponseDTO;
import com.eventmanagement.attendee.service.AttendeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
/**
 * REST Controller responsible for handling attendee-related API requests.

 * This controller provides endpoints for creating, retrieving, updating,
  and deleting attendees in the Event Management system.
 */

@RestController
@RequestMapping("/api/attendees")
public class AttendeeController {

    private final AttendeeService attendeeService;

    /**
     * Constructor-based dependency injection for AttendeeService.
     */

    public AttendeeController(AttendeeService attendeeService) {

        this.attendeeService = attendeeService;
    }

    /**
     * Creates a new attendee.
     * @param dto request object containing attendee details
     */

    @PostMapping
    public ResponseEntity<AttendeeResponseDTO> createAttendee(@Valid @RequestBody AttendeeRequestDTO dto) {
        return new ResponseEntity<>(attendeeService.createAttendee(dto), HttpStatus.CREATED);
    }

    /**
     * Retrieves all attendees from the system.
     */

    @GetMapping
    public ResponseEntity<List<AttendeeResponseDTO>> getAllAttendees() {
        return ResponseEntity.ok(attendeeService.getAllAttendees());
    }

    /**
     * Retrieves an attendee by their unique ID.
     */

    @GetMapping("/{id}")
    public ResponseEntity<AttendeeResponseDTO> getAttendeeById(@PathVariable Long id) {
        return ResponseEntity.ok(attendeeService.getAttendeeById(id));
    }
    
    /**
     * Retrieves an attendee by their email address.
     */

    @GetMapping("/email/{email}")
    public ResponseEntity<AttendeeResponseDTO> getAttendeeByEmail(@PathVariable String email) {
        return ResponseEntity.ok(attendeeService.getAttendeeByEmail(email));
    }

    /**
     * Updates an existing attendee's details.
     */

    @PutMapping("/{id}")
    public ResponseEntity<AttendeeResponseDTO> updateAttendee(@PathVariable Long id, @Valid @RequestBody AttendeeRequestDTO dto) {
        return ResponseEntity.ok(attendeeService.updateAttendee(id, dto));
    }

    /**
     * Deletes an attendee from the system.
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendee(@PathVariable Long id) {
        attendeeService.deleteAttendee(id);
        return ResponseEntity.noContent().build();
    }
}
