package com.eventmanagement.ticketing.service.Impl;

import com.eventmanagement.ticketing.client.EventServiceClient;
import com.eventmanagement.ticketing.dto.EventDTO;
import com.eventmanagement.ticketing.dto.TicketRequestDTO;
import com.eventmanagement.ticketing.dto.TicketResponseDTO;
import com.eventmanagement.ticketing.entity.Ticket;
import com.eventmanagement.ticketing.entity.Ticket.TicketStatus;
import com.eventmanagement.ticketing.exception.InsufficientTicketsException;
import com.eventmanagement.ticketing.exception.InvalidEventException;
import com.eventmanagement.ticketing.exception.TicketNotFoundException;
import com.eventmanagement.ticketing.repository.TicketRepository;
import com.eventmanagement.ticketing.service.TicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private EventServiceClient eventServiceClient;

    @Override
    @Transactional
    public TicketResponseDTO createTicket(TicketRequestDTO dto) {
        // Validate event exists via Feign
        try {
            EventDTO event = eventServiceClient.getEventById(dto.getEventId());
            if (event == null || event.getId() == null) {
                throw new InvalidEventException("Event not found or unavailable");
            }
            if (!"PUBLISHED".equalsIgnoreCase(event.getStatus())) {
                throw new InvalidEventException("Event is not published");
            }
        } catch (Exception e) {
            throw new InvalidEventException("Event not found or unavailable");
        }

        // Validate dates
        if (dto.getValidFrom() != null && dto.getValidUntil() != null) {
            if (dto.getValidUntil().isBefore(dto.getValidFrom())) {
                throw new InvalidEventException("validUntil must be after validFrom");
            }
        }

        Ticket ticket = Ticket.builder()
                .eventId(dto.getEventId())
                .ticketType(dto.getTicketType())
                .price(dto.getPrice())
                .quantity(dto.getQuantity())
                .availableQuantity(dto.getQuantity())
                .soldQuantity(0)
                .description(dto.getDescription())
                .validFrom(dto.getValidFrom())
                .validUntil(dto.getValidUntil())
                .maxPerBooking(dto.getMaxPerBooking())
                .status(dto.getStatus() != null ? TicketStatus.valueOf(dto.getStatus()) : TicketStatus.ACTIVE)
                .build();

        Ticket saved = ticketRepository.save(ticket);
        return mapToDto(saved);
    }

    @Override
    public TicketResponseDTO getTicketById(Long id) {
        Ticket t = ticketRepository.findById(id).orElseThrow(() -> new TicketNotFoundException("Ticket not found"));
        return mapToDto(t);
    }

    @Override
    public List<TicketResponseDTO> getAllTickets() {
        return ticketRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<TicketResponseDTO> getTicketsByEventId(Long eventId) {
        return ticketRepository.findByEventId(eventId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TicketResponseDTO updateTicket(Long id, TicketRequestDTO dto) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        if (dto.getTicketType() != null) ticket.setTicketType(dto.getTicketType());
        if (dto.getPrice() != null) ticket.setPrice(dto.getPrice());
        if (dto.getDescription() != null) ticket.setDescription(dto.getDescription());
        if (dto.getValidFrom() != null) ticket.setValidFrom(dto.getValidFrom());
        if (dto.getValidUntil() != null) ticket.setValidUntil(dto.getValidUntil());
        if (dto.getMaxPerBooking() != null) ticket.setMaxPerBooking(dto.getMaxPerBooking());

        if (dto.getQuantity() != null) {
            int oldQuantity = ticket.getQuantity();
            int oldAvailable = ticket.getAvailableQuantity() == null ? 0 : ticket.getAvailableQuantity();
            int sold = ticket.getSoldQuantity() == null ? 0 : ticket.getSoldQuantity();

            // Adjust quantities: if total quantity decreased below sold, invalid
            if (dto.getQuantity() < sold) {
                throw new InvalidEventException("New quantity cannot be less than already sold tickets");
            }

            ticket.setQuantity(dto.getQuantity());
            ticket.setAvailableQuantity(dto.getQuantity() - sold);

            if (ticket.getAvailableQuantity() == 0) {
                ticket.setStatus(TicketStatus.SOLD_OUT);
            } else if (ticket.getAvailableQuantity() > 0) {
                ticket.setStatus(TicketStatus.ACTIVE);
            }
        }

        if (dto.getStatus() != null) {
            ticket.setStatus(TicketStatus.valueOf(dto.getStatus()));
        }

        Ticket updated = ticketRepository.save(ticket);
        return mapToDto(updated);
    }

    @Override
    @Transactional
    public void reduceTicketQuantity(Long ticketId, Integer quantity) {
        Ticket ticket = ticketRepository.findById(ticketId).orElseThrow(() -> new TicketNotFoundException("Ticket not found"));

        if (ticket.getAvailableQuantity() == null || ticket.getAvailableQuantity() <= 0) {
            throw new InsufficientTicketsException("No tickets available");
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        if (ticket.getAvailableQuantity() < quantity) {
            throw new InsufficientTicketsException("Only " + ticket.getAvailableQuantity() + " tickets available");
        }

        ticket.setAvailableQuantity(ticket.getAvailableQuantity() - quantity);
        ticket.setSoldQuantity(ticket.getSoldQuantity() + quantity);

        if (ticket.getAvailableQuantity() == 0) {
            ticket.setStatus(TicketStatus.SOLD_OUT);
        }

        ticketRepository.save(ticket);
    }

    @Override
    public void deleteTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow(() -> new TicketNotFoundException("Ticket not found"));
        ticketRepository.delete(ticket);
    }

    private TicketResponseDTO mapToDto(Ticket t) {
        return TicketResponseDTO.builder()
                .id(t.getId())
                .eventId(t.getEventId())
                .ticketType(t.getTicketType())
                .price(t.getPrice())
                .quantity(t.getQuantity())
                .availableQuantity(t.getAvailableQuantity())
                .soldQuantity(t.getSoldQuantity())
                .description(t.getDescription())
                .validFrom(t.getValidFrom())
                .validUntil(t.getValidUntil())
                .maxPerBooking(t.getMaxPerBooking())
                .status(t.getStatus() != null ? t.getStatus().name() : null)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
