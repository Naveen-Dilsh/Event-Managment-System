package com.eventmanagement.sponsorship.repository;

import com.eventmanagement.sponsorship.entity.Sponsorship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SponsorshipRepository extends JpaRepository<Sponsorship, Long> {
    List<Sponsorship> findByEventId(Long eventId);
    List<Sponsorship> findByStatus(String status);
    List<Sponsorship> findBySponsorshipTier(String tier);
    List<Sponsorship> findByPaymentStatus(String paymentStatus);
}