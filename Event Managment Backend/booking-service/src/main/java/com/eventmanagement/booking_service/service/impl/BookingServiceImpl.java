package com.eventmanagement.booking_service.service.impl;


import com.eventmanagement.booking_service.dto.BookingRequestDTO;
import com.eventmanagement.booking_service.dto.BookingResponseDTO;
import com.eventmanagement.booking_service.entity.Booking;
import com.eventmanagement.booking_service.repository.BookingRepository;

import com.eventmanagement.booking_service.service.BookingService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    public BookingServiceImpl(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // ✅ CREATE BOOKING
    @Override
    public BookingResponseDTO createBooking(BookingRequestDTO dto) {

        Booking booking = mapToEntity(dto);

        // Business defaults
        booking.setStatus("PENDING");
        booking.setPaymentStatus("UNPAID");
        booking.setBookingDate(LocalDateTime.now());

        // Generate unique booking reference
        booking.setBookingReference(
                "BK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase()
        );

        Booking savedBooking = bookingRepository.save(booking);

        return mapToResponse(savedBooking);
    }

    // ✅ GET BY ID
    @Override
    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));

        return mapToResponse(booking);
    }

    // ✅ GET BY REFERENCE
    @Override
    public BookingResponseDTO getBookingByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
                .orElseThrow(() -> new RuntimeException("Booking not found with reference: " + reference));

        return mapToResponse(booking);
    }

    // ✅ GET BY EVENT
    @Override
    public List<BookingResponseDTO> getBookingsByEventId(Long eventId) {
        return bookingRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET BY ATTENDEE
    @Override
    public List<BookingResponseDTO> getBookingsByAttendeeId(Long attendeeId) {
        return bookingRepository.findByAttendeeId(attendeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ CANCEL BOOKING
    @Override
    public BookingResponseDTO cancelBooking(Long bookingId) {

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");

        Booking updatedBooking = bookingRepository.save(booking);

        return mapToResponse(updatedBooking);
    }

    // ======================================================
    // ================= MAPPER METHODS =====================
    // ======================================================

    private Booking mapToEntity(BookingRequestDTO dto) {
        return Booking.builder()
                .eventId(dto.getEventId())
                .ticketId(dto.getTicketId())
                .attendeeId(dto.getAttendeeId())
                .quantity(dto.getQuantity())
                .totalPrice(dto.getTotalPrice())
                .customerName(dto.getCustomerName())
                .customerEmail(dto.getCustomerEmail())
                .customerPhone(dto.getCustomerPhone())
                .specialRequests(dto.getSpecialRequests())
                .build();
    }

    private BookingResponseDTO mapToResponse(Booking booking) {
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .eventId(booking.getEventId())
                .ticketId(booking.getTicketId())
                .attendeeId(booking.getAttendeeId())
                .quantity(booking.getQuantity())
                .totalPrice(booking.getTotalPrice())
                .bookingDate(booking.getBookingDate())
                .bookingReference(booking.getBookingReference())
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .paymentId(booking.getPaymentId())
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                .customerPhone(booking.getCustomerPhone())
                .specialRequests(booking.getSpecialRequests())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
