package com.eventmanagement.ticketing.repository;

import com.eventmanagement.ticketing.entity.Ticket;
import com.eventmanagement.ticketing.entity.Ticket.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Find all tickets by event id
    List<Ticket> findByEventId(Long eventId);

    // Find tickets by status
    List<Ticket> findByStatus(TicketStatus status);

    // Find tickets by event id and status
    List<Ticket> findByEventIdAndStatus(Long eventId, TicketStatus status);
}
