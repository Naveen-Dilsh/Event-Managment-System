package com.eventmanagement.booking_service.repository;

import com.eventmanagement.booking_service.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByEventId(Long eventId);

    List<Booking> findByAttendeeId(Long attendeeId);

    Optional<Booking> findByBookingReference(String bookingReference);
}
