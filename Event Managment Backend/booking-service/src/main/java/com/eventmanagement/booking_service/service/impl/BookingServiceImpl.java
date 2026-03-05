package com.eventmanagement.booking_service.service.impl;

import com.eventmanagement.booking_service.client.EventServiceClient;
import com.eventmanagement.booking_service.client.PaymentServiceClient;
import com.eventmanagement.booking_service.client.TicketingServiceClient;
import com.eventmanagement.booking_service.dto.*;
import com.eventmanagement.booking_service.entity.Booking;
import com.eventmanagement.booking_service.exception.BookingNotFoundException;
import com.eventmanagement.booking_service.exception.InsufficientTicketsException;
import com.eventmanagement.booking_service.exception.PaymentFailedException;
import com.eventmanagement.booking_service.repository.BookingRepository;
import com.eventmanagement.booking_service.service.BookingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final EventServiceClient eventServiceClient;
    private final TicketingServiceClient ticketingServiceClient;
    private final PaymentServiceClient paymentServiceClient;

    public BookingServiceImpl(BookingRepository bookingRepository,
            EventServiceClient eventServiceClient,
            TicketingServiceClient ticketingServiceClient,
            PaymentServiceClient paymentServiceClient) {
        this.bookingRepository = bookingRepository;
        this.eventServiceClient = eventServiceClient;
        this.ticketingServiceClient = ticketingServiceClient;
        this.paymentServiceClient = paymentServiceClient;
    }

    // =====================================================================
    // CREATE BOOKING - full transactional workflow with inter-service calls
    // =====================================================================
    @Override
    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto) {

        // Step 1: Validate event exists via Event Service
        EventDTO event;
        try {
            event = eventServiceClient.getEventById(dto.getEventId());
        } catch (Exception e) {
            throw new RuntimeException("Event not found with id: " + dto.getEventId());
        }

        // Step 2: Validate ticket and retrieve pricing info via Ticketing Service
        TicketDTO ticket;
        try {
            ticket = ticketingServiceClient.getTicketById(dto.getTicketId());
        } catch (Exception e) {
            throw new RuntimeException("Ticket not found with id: " + dto.getTicketId());
        }

        // Step 3: Check sufficient ticket availability
        if (ticket.getAvailableQuantity() < dto.getQuantity()) {
            throw new InsufficientTicketsException(
                    "Only " + ticket.getAvailableQuantity() + " tickets available. Requested: " + dto.getQuantity());
        }

        // Step 4: Calculate total price (quantity x ticket price)
        double totalPrice = ticket.getPrice() * dto.getQuantity();

        // Step 5: Persist booking with PENDING status
        Booking booking = Booking.builder()
                .eventId(dto.getEventId())
                .ticketId(dto.getTicketId())
                .attendeeId(dto.getAttendeeId())
                .quantity(dto.getQuantity())
                .totalPrice(totalPrice)
                .customerName(dto.getCustomerName())
                .customerEmail(dto.getCustomerEmail())
                .customerPhone(dto.getCustomerPhone())
                .specialRequests(dto.getSpecialRequests())
                .status("PENDING")
                .paymentStatus("UNPAID")
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Step 6: Reduce ticket quantity in Ticketing Service
        try {
            ticketingServiceClient.reduceTicketQuantity(
                    dto.getTicketId(),
                    Map.of("quantity", dto.getQuantity()));
        } catch (Exception e) {
            savedBooking.setStatus("CANCELLED");
            bookingRepository.save(savedBooking);
            throw new RuntimeException("Failed to reserve tickets: " + e.getMessage());
        }

        // Booking is created as PENDING/UNPAID - payment handled separately via Pay Now
        return mapToResponse(bookingRepository.save(savedBooking));

    }

    // =====================================================================
    // READ OPERATIONS
    // =====================================================================
    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
        return mapToResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getAllBookings() {
        return bookingRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponseDTO getBookingByReference(String bookingReference) {
        Booking booking = bookingRepository.findByBookingReference(bookingReference)
                .orElseThrow(
                        () -> new BookingNotFoundException("Booking not found with reference: " + bookingReference));
        return mapToResponse(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsByEventId(Long eventId) {
        return bookingRepository.findByEventId(eventId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponseDTO> getBookingsByAttendeeId(Long attendeeId) {
        return bookingRepository.findByAttendeeId(attendeeId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =====================================================================
    // CANCEL BOOKING - attempts to restore ticket quantity
    // =====================================================================
    @Override
    @Transactional
    public BookingResponseDTO cancelBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // Best-effort restore of ticket quantity in Ticketing Service
        try {
            ticketingServiceClient.restoreTicketQuantity(
                    booking.getTicketId(),
                    Map.of("quantity", booking.getQuantity()));
        } catch (Exception e) {
            // Log and continue - cancellation proceeds regardless
            System.err.println("Warning: could not restore ticket quantity for booking " + id + ": " + e.getMessage());
        }

        booking.setStatus("CANCELLED");
        booking.setPaymentStatus("REFUNDED");

        return mapToResponse(bookingRepository.save(booking));
    }

    // =====================================================================
    // CONFIRM BOOKING - manually confirm a PENDING booking
    // =====================================================================
    @Override
    @Transactional
    public BookingResponseDTO confirmBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Cannot confirm a cancelled booking");
        }
        if ("CONFIRMED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already confirmed");
        }

        booking.setStatus("CONFIRMED");

        return mapToResponse(bookingRepository.save(booking));
    }

    // =====================================================================
    // DELETE BOOKING
    // =====================================================================
    @Override
    @Transactional
    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with id: " + id));
        bookingRepository.delete(booking);
    }

    // =====================================================================
    // MAPPER HELPER
    // =====================================================================
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
