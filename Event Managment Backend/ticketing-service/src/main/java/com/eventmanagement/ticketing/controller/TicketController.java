package com.eventmanagement.ticketing.controller;

import com.eventmanagement.ticketing.dto.TicketRequestDTO;
import com.eventmanagement.ticketing.dto.TicketResponseDTO;
import com.eventmanagement.ticketing.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping
    public ResponseEntity<TicketResponseDTO> createTicket(@Valid @RequestBody TicketRequestDTO request) {
        TicketResponseDTO dto = ticketService.createTicket(request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<TicketResponseDTO>> getAll() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<TicketResponseDTO>> getByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(ticketService.getTicketsByEventId(eventId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketResponseDTO> update(@PathVariable Long id, @Valid @RequestBody TicketRequestDTO request) {
        return ResponseEntity.ok(ticketService.updateTicket(id, request));
    }

    @PatchMapping("/{id}/reduce")
    public ResponseEntity<Void> reduce(@PathVariable Long id, @RequestParam Integer quantity) {
        ticketService.reduceTicketQuantity(id, quantity);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }
}
