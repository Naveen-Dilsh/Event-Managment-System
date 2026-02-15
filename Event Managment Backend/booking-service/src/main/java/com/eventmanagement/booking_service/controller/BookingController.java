package com.eventmanagement.booking_service.controller;

import com.eventmanagement.booking_service.dto.BookingRequestDTO;
import com.eventmanagement.booking_service.dto.BookingResponseDTO;
import com.eventmanagement.booking_service.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // ✅ CREATE BOOKING
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponseDTO createBooking(@Valid @RequestBody BookingRequestDTO dto) {
        return bookingService.createBooking(dto);
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public BookingResponseDTO getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id);
    }

    // ✅ GET BY REFERENCE
    @GetMapping("/reference/{ref}")
    public BookingResponseDTO getBookingByReference(@PathVariable String ref) {
        return bookingService.getBookingByReference(ref);
    }

    // ✅ GET BY EVENT
    @GetMapping("/event/{eventId}")
    public List<BookingResponseDTO> getBookingsByEventId(@PathVariable Long eventId) {
        return bookingService.getBookingsByEventId(eventId);
    }

    // ✅ GET BY ATTENDEE
    @GetMapping("/attendee/{attendeeId}")
    public List<BookingResponseDTO> getBookingsByAttendeeId(@PathVariable Long attendeeId) {
        return bookingService.getBookingsByAttendeeId(attendeeId);
    }

    // ✅ CANCEL
    @PatchMapping("/{id}/cancel")
    public BookingResponseDTO cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }
}
