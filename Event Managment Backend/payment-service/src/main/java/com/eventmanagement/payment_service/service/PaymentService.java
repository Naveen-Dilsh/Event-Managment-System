package com.eventmanagement.payment_service.service;

import com.eventmanagement.payment_service.dto.PaymentRequestDTO;
import com.eventmanagement.payment_service.dto.PaymentResponseDTO;
import com.eventmanagement.payment_service.dto.RefundRequestDTO;

public interface PaymentService {
    PaymentResponseDTO processPayment(PaymentRequestDTO requestDTO);

    PaymentResponseDTO getPaymentById(Long id);

    PaymentResponseDTO getPaymentByBookingId(Long bookingId);

    PaymentResponseDTO getPaymentByTransactionId(String transactionId);

    PaymentResponseDTO refundPayment(Long paymentId, RefundRequestDTO refundRequestDTO);
}
