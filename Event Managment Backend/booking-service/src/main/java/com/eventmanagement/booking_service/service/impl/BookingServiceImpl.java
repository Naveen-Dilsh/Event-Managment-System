package com.eventmanagement.booking_service.service.impl;

import com.eventmanagement.booking_service.entity.Booking;
import com.eventmanagement.booking_service.repository.BookingRepository;
import com.eventmanagement.booking_service.service.BookingService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @Override
    public Booking createBooking(Booking booking) {

        // Business defaults
        booking.setStatus("PENDING");
        booking.setPaymentStatus("UNPAID");

        // Temporary booking reference generator
        booking.setBookingReference(
                "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
        );

        booking.setBookingDate(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    @Override
    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Override
    public Booking getBookingByReference(String reference) {
        return bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Override
    public List<Booking> getBookingsByEventId(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }

    @Override
    public List<Booking> getBookingsByAttendeeId(Long attendeeId) {
        return bookingRepository.findByAttendeeId(attendeeId);
    }

    @Override
    public Booking cancelBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);
        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }
}
