package com.eventmanagement.ticketing.service;

import com.eventmanagement.ticketing.dto.TicketRequestDTO;
import com.eventmanagement.ticketing.dto.TicketResponseDTO;

import java.util.List;

public interface TicketService {

    TicketResponseDTO createTicket(TicketRequestDTO dto);

    TicketResponseDTO getTicketById(Long id);

    List<TicketResponseDTO> getAllTickets();

    List<TicketResponseDTO> getTicketsByEventId(Long eventId);

    TicketResponseDTO updateTicket(Long id, TicketRequestDTO dto);

    void reduceTicketQuantity(Long ticketId, Integer quantity);

    void deleteTicket(Long id);
}
