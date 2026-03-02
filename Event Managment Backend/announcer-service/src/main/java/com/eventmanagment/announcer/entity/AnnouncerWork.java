package com.eventmanagment.announcer.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

//create announcer_work table
@Entity
@Table(name = "announcer_works")
@Data
public class AnnouncerWork {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long announcerId;

    @Column(nullable = false)
    private Long eventId;

    private String eventName; // stored locally
    private String role; // Main Host, Co-Host, Speaker

    private LocalDate eventDate;
    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}