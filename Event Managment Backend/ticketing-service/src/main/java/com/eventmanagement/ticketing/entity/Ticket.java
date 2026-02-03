package com.eventmanagement.ticketing.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Cross-service reference
    @NotNull
    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @NotBlank
    @Column(name = "ticket_type", nullable = false)
    private String ticketType;

    @NotNull
    @Positive
    private Double price;

    @NotNull
    @Positive
    private Integer quantity;

    @Column(name = "available_quantity")
    private Integer availableQuantity;

    @Column(name = "sold_quantity")
    private Integer soldQuantity;

    private String description;

    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "max_per_booking")
    private Integer maxPerBooking;

    // Enum field
    @Enumerated(EnumType.STRING)
    private TicketStatus status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // Auto run before insert
    @PrePersist
    public void prePersist() {

        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;

        if (availableQuantity == null) {
            availableQuantity = quantity;
        }

        if (soldQuantity == null) {
            soldQuantity = 0;
        }

        if (status == null) {
            status = TicketStatus.ACTIVE;
        }
    }

    // Auto run before update
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }


    // ENUM INSIDE SAME FILE (Simple Method)
    public enum TicketStatus {

        ACTIVE,
        SOLD_OUT,
        EXPIRED,
        INACTIVE
    }
}

