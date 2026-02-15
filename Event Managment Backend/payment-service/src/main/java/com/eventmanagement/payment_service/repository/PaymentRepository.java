package com.eventmanagement.payment_service.repository;
import com.eventmanagement.payment_service.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import com.eventmanagement.payment_service.enums.PaymentStatus;

import java.util.List;
import java.util.Optional;


public interface PaymentRepository extends JpaRepository<Payment, Long> {
    // Find payment by bookingId (Booking Service will need this)
    Optional<Payment> findByBookingId(Long bookingId);

    // Find payment by transactionId (useful for tracking)
    Optional<Payment> findByTransactionId(String transactionId);

    // Get all payments by status (useful for analytics)
    List<Payment> findAllByPaymentStatus(String paymentStatus);
}
