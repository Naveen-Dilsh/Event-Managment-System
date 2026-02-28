package com.eventmanagement.booking_service.service;

import com.eventmanagement.booking_service.dto.BookingRequestDTO;
import com.eventmanagement.booking_service.dto.BookingResponseDTO;

import java.util.List;

public interface BookingService {

    BookingResponseDTO createBooking(BookingRequestDTO dto);

    BookingResponseDTO getBookingById(Long id);

    BookingResponseDTO getBookingByReference(String reference);

    List<BookingResponseDTO> getBookingsByEventId(Long eventId);

    List<BookingResponseDTO> getBookingsByAttendeeId(Long attendeeId);

    BookingResponseDTO cancelBooking(Long bookingId);
}
