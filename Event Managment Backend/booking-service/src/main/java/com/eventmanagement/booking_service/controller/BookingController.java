package com.eventmanagement.booking_service.controller;

import com.eventmanagement.booking_service.dto.BookingRequestDTO;
import com.eventmanagement.booking_service.dto.BookingResponseDTO;
import com.eventmanagement.booking_service.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST /api/bookings — create a new booking
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponseDTO createBooking(@Valid @RequestBody BookingRequestDTO dto) {
        return bookingService.createBooking(dto);
    }

    // GET /api/bookings — get all bookings
    @GetMapping
    public List<BookingResponseDTO> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // GET /api/bookings/{id} — get booking by ID
    @GetMapping("/{id}")
    public BookingResponseDTO getBookingById(@PathVariable Long id) {
        return bookingService.getBookingById(id);
    }

    // GET /api/bookings/reference/{reference} — get booking by reference code
    @GetMapping("/reference/{reference}")
    public BookingResponseDTO getBookingByReference(@PathVariable String reference) {
        return bookingService.getBookingByReference(reference);
    }

    // GET /api/bookings/event/{eventId} — get all bookings for an event
    @GetMapping("/event/{eventId}")
    public List<BookingResponseDTO> getBookingsByEventId(@PathVariable Long eventId) {
        return bookingService.getBookingsByEventId(eventId);
    }

    // GET /api/bookings/attendee/{attendeeId} — get all bookings for an attendee
    @GetMapping("/attendee/{attendeeId}")
    public List<BookingResponseDTO> getBookingsByAttendeeId(@PathVariable Long attendeeId) {
        return bookingService.getBookingsByAttendeeId(attendeeId);
    }

    // PATCH /api/bookings/{id}/cancel — cancel a booking
    @PatchMapping("/{id}/cancel")
    public BookingResponseDTO cancelBooking(@PathVariable Long id) {
        return bookingService.cancelBooking(id);
    }

    // PATCH /api/bookings/{id}/confirm — confirm a pending booking
    @PatchMapping("/{id}/confirm")
    public BookingResponseDTO confirmBooking(@PathVariable Long id) {
        return bookingService.confirmBooking(id);
    }

    // DELETE /api/bookings/{id} — permanently delete a booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.noContent().build();
    }
}
