package com.eventmanagement.payment_service.gateway;

import com.eventmanagement.payment_service.dto.PaymentRequestDTO;

public interface PaymentGatewayService {

    /**
     * Simulates processing a payment through a payment gateway.
     * Returns a generated transaction ID if payment is successful.
     */
    String processPayment(PaymentRequestDTO requestDTO);

    /**
     * Simulates refund processing through a payment gateway.
     * Returns true if refund is successful.
     */
    boolean processRefund(String transactionId, Double refundAmount);
}
