package com.eventmanagement.booking_service.service;

import com.eventmanagement.booking_service.entity.Booking;

import java.util.List;

public interface BookingService {

    // Create a booking
    Booking createBooking(Booking booking);

    // Get booking by ID
    Booking getBookingById(Long id);

    // Get booking by reference
    Booking getBookingByReference(String reference);

    // Get bookings by event
    List<Booking> getBookingsByEventId(Long eventId);

    // Get bookings by attendee
    List<Booking> getBookingsByAttendeeId(Long attendeeId);

    // Cancel booking
    Booking cancelBooking(Long bookingId);
}
