package com.eventmanagement.attendee.service.impl;

import com.eventmanagement.attendee.dto.AttendeeRequestDTO;
import com.eventmanagement.attendee.dto.AttendeeResponseDTO;
import com.eventmanagement.attendee.entity.Attendee;
import com.eventmanagement.attendee.exception.AttendeeNotFoundException;
import com.eventmanagement.attendee.exception.DuplicateEmailException;
import com.eventmanagement.attendee.repository.AttendeeRepository;
import com.eventmanagement.attendee.service.AttendeeService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendeeServiceImpl implements AttendeeService {

    private final AttendeeRepository attendeeRepository;

    public AttendeeServiceImpl(AttendeeRepository attendeeRepository) {
        this.attendeeRepository = attendeeRepository;
    }

    @Override
    public AttendeeResponseDTO createAttendee(AttendeeRequestDTO dto) {
        //Check if email already exists
        if (attendeeRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new DuplicateEmailException("Email already in use: " + dto.getEmail());
        }

        //Map DTO to Entity
        Attendee attendee = new Attendee();
        BeanUtils.copyProperties(dto, attendee);

        //Save to Database
        Attendee savedAttendee = attendeeRepository.save(attendee);

        //Return Response DTO
        return mapToResponseDTO(savedAttendee);
    }

    @Override
    public AttendeeResponseDTO getAttendeeById(Long id) {
        Attendee attendee = attendeeRepository.findById(id)
                .orElseThrow(() -> new AttendeeNotFoundException("Attendee not found with id: " + id));
        return mapToResponseDTO(attendee);
    }

    @Override
    public List<AttendeeResponseDTO> getAllAttendees() {
        return attendeeRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AttendeeResponseDTO getAttendeeByEmail(String email) {
        Attendee attendee = attendeeRepository.findByEmail(email)
                .orElseThrow(() -> new AttendeeNotFoundException("Attendee not found with email: " + email));
        return mapToResponseDTO(attendee);
    }

    @Override
    public AttendeeResponseDTO updateAttendee(Long id, AttendeeRequestDTO dto) {
        Attendee existingAttendee = attendeeRepository.findById(id)
                .orElseThrow(() -> new AttendeeNotFoundException("Attendee not found with id: " + id));

        // Update fields (excluding ID and CreatedAt)
        BeanUtils.copyProperties(dto, existingAttendee, "id", "createdAt");

        Attendee updatedAttendee = attendeeRepository.save(existingAttendee);
        return mapToResponseDTO(updatedAttendee);
    }

    @Override
    public void deleteAttendee(Long id) {
        if (!attendeeRepository.existsById(id)) {
            throw new AttendeeNotFoundException("Cannot delete. Attendee not found with id: " + id);
        }
        attendeeRepository.deleteById(id);
    }

    // Helper method to convert Entity -> DTO
    private AttendeeResponseDTO mapToResponseDTO(Attendee attendee) {
        AttendeeResponseDTO responseDTO = new AttendeeResponseDTO();
        BeanUtils.copyProperties(attendee, responseDTO);
        return responseDTO;
    }
}