package com.eventmanagement.attendee.service;

import com.eventmanagement.attendee.dto.AttendeeRequestDTO;
import com.eventmanagement.attendee.dto.AttendeeResponseDTO;

import java.util.List;

/**
 * This interface defines the business logic methods for creating,
   retrieving, updating, and deleting attendees in the Event
   Management System.
 */

public interface AttendeeService {

    AttendeeResponseDTO createAttendee(AttendeeRequestDTO dto);
    AttendeeResponseDTO getAttendeeById(Long id);
    List<AttendeeResponseDTO>getAllAttendees();
    AttendeeResponseDTO getAttendeeByEmail(String email);
    AttendeeResponseDTO updateAttendee(Long id,AttendeeRequestDTO dto);
    void deleteAttendee(Long id);
}
