package com.eventmanagement.payment_service.service;

import com.eventmanagement.payment_service.dto.PaymentRequestDTO;
import com.eventmanagement.payment_service.dto.PaymentResponseDTO;
import com.eventmanagement.payment_service.dto.RefundRequestDTO;

import java.util.List;

public interface PaymentService {
    PaymentResponseDTO processPayment(PaymentRequestDTO requestDTO);

    List<PaymentResponseDTO> getAllPayments();

    PaymentResponseDTO getPaymentById(Long id);

    PaymentResponseDTO getPaymentByBookingId(Long bookingId);

    PaymentResponseDTO getPaymentByTransactionId(String transactionId);

    PaymentResponseDTO refundPayment(Long paymentId, RefundRequestDTO refundRequestDTO);

    PaymentResponseDTO rejectPayment(Long id);

    PaymentResponseDTO acceptPayment(Long id);
}
