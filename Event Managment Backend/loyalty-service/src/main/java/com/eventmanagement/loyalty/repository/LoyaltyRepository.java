package com.eventmanagement.loyalty.repository;

import com.eventmanagement.loyalty.entity.LoyaltyAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface LoyaltyRepository extends JpaRepository<LoyaltyAccount, Long> {

    Optional<LoyaltyAccount> findByAttendeeId(Long attendeeId);

    List<LoyaltyAccount> findByMembershipTier(String tier);

    List<LoyaltyAccount> findByStatus(String status);
}