package com.eventmanagement.loyalty.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_accounts")
@Data
public class LoyaltyAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long attendeeId;

    @Column(nullable = false)
    private Integer pointsBalance = 0;

    @Column(nullable = false)
    private Integer totalPointsEarned = 0;

    @Column(nullable = false)
    private String membershipTier = "BRONZE";

    @Column(nullable = false)
    private String status = "ACTIVE";

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
