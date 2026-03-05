package com.eventmanagement.booking_service.service;

import com.eventmanagement.booking_service.dto.BookingRequestDTO;
import com.eventmanagement.booking_service.dto.BookingResponseDTO;

import java.util.List;

public interface BookingService {

    // Create a new booking (orchestrates Event, Ticketing, Payment services)
    BookingResponseDTO createBooking(BookingRequestDTO dto);

    // Retrieve a single booking by its database ID
    BookingResponseDTO getBookingById(Long id);

    // Retrieve all bookings
    List<BookingResponseDTO> getAllBookings();

    // Retrieve a booking by its human-readable reference code (e.g. BK-2026-ABC123)
    BookingResponseDTO getBookingByReference(String bookingReference);

    // Retrieve all bookings for a specific event
    List<BookingResponseDTO> getBookingsByEventId(Long eventId);

    // Retrieve all bookings belonging to a specific attendee
    List<BookingResponseDTO> getBookingsByAttendeeId(Long attendeeId);

    // Cancel a booking and attempt to restore ticket quantity
    BookingResponseDTO cancelBooking(Long id);

    // Confirm a pending booking
    BookingResponseDTO confirmBooking(Long id);

    // Permanently delete a booking record
    void deleteBooking(Long id);
}
