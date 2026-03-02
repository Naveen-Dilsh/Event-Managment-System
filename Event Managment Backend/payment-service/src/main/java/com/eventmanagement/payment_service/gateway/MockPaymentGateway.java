package com.eventmanagement.payment_service.gateway;


import com.eventmanagement.payment_service.dto.PaymentRequestDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class MockPaymentGateway implements PaymentGatewayService {
    @Override
    public String processPayment(PaymentRequestDTO requestDTO) {

        // Simple mock rule:
        // If amount <= 0, fail (already validated, but just in case)
        if (requestDTO.getAmount() == null || requestDTO.getAmount() <= 0) {
            throw new RuntimeException("Invalid payment amount");
        }

        // Generate a unique transaction ID
        // Example: TXN-2026-AB12CD34
        String year = String.valueOf(LocalDateTime.now().getYear());
        String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        return "TXN-" + year + "-" + randomPart;
    }

    @Override
    public boolean processRefund(String transactionId, Double refundAmount) {

        // Mock rule:
        // Refund succeeds if transactionId is not null and refundAmount > 0
        if (transactionId == null || transactionId.isBlank()) {
            return false;
        }

        if (refundAmount == null || refundAmount <= 0) {
            return false;
        }

        return true;
    }
}
