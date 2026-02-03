package com.eventmanagement.attendee.service;

import com.eventmanagement.attendee.dto.AttendeeRequestDTO;
import com.eventmanagement.attendee.dto.AttendeeResponseDTO;

import java.util.List;

public interface AttendeeService {

    AttendeeResponseDTO createAttendee(AttendeeRequestDTO dto);
    AttendeeResponseDTO getAttendeeById(Long id);
    List<AttendeeResponseDTO>getAllAttendees();
    AttendeeResponseDTO getAttendeeByEmail(String email);
    AttendeeResponseDTO updateAttendee(Long id,AttendeeRequestDTO dto);
    void deleteAttendee(Long id);
}
