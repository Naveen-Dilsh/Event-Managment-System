package com.eventmanagment.event.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "event")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Event name cannot be blank")
    @Size(min = 3, max = 200, message = "Event name must be between 3 and 200 characters")
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    @Column(name = "description", length = 2000)
    private String description;

    @NotNull(message = "Venue ID cannot be null")
    @Column(name = "venue_id", nullable = false)
    private Long venueId;         // Foreign key reference to Venue Service

    @NotBlank(message = "Category cannot be blank")
    @Size(max = 100, message = "Category cannot exceed 100 characters")
    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 100000, message = "Capacity cannot exceed 100,000")
    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Min(value = 0, message = "Available seats cannot be negative")
    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private EventStatus status = EventStatus.DRAFT;

    @NotNull(message = "Event date cannot be null")
    @Future(message = "Event date must be in the future")
    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    @NotNull(message = "Start time cannot be null")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time cannot be null")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @NotBlank(message = "Organizer name cannot be blank")
    @Size(min = 2, max = 150, message = "Organizer name must be between 2 and 150 characters")
    @Column(name = "organizer_name", nullable = false, length = 150)
    private String organizerName;

    @NotBlank(message = "Organizer contact cannot be blank")
    @Column(name = "organizer_contact", nullable = false, length = 100)
    private String organizerContact;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Enum for Event Status
    public enum EventStatus {
        DRAFT,
        PUBLISHED,
        ONGOING,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }

}