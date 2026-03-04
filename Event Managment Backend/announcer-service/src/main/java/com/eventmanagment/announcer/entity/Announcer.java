package com.eventmanagment.announcer.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
//create announcer table
@Entity
@Table(name = "announcers")
@Data
public class Announcer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String fullName;

    private String email;
    private String phone;
    private String specialization;

    @Column(length = 1000)
    private String bio;

    private Integer experienceYears;

    @Column(nullable = false)
    private String status = "AVAILABLE"; //Availability status: AVAILABLE, BUSY, INACTIVE

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // auto-set timestamps
    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}