package com.eventmanagement.payment_service.service.impl;

import com.eventmanagement.payment_service.dto.PaymentRequestDTO;
import com.eventmanagement.payment_service.dto.PaymentResponseDTO;
import com.eventmanagement.payment_service.dto.RefundRequestDTO;
import com.eventmanagement.payment_service.entity.Payment;
import com.eventmanagement.payment_service.enums.PaymentStatus;
import com.eventmanagement.payment_service.exception.PaymentFailedException;
import com.eventmanagement.payment_service.exception.PaymentNotFoundException;
import com.eventmanagement.payment_service.exception.RefundFailedException;
import com.eventmanagement.payment_service.gateway.PaymentGatewayService;
import com.eventmanagement.payment_service.repository.PaymentRepository;
import com.eventmanagement.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentGatewayService paymentGatewayService;

    @Override
    public PaymentResponseDTO processPayment(PaymentRequestDTO requestDTO) {

        // Step 1: Create Payment entity (PROCESSING)
        Payment payment = Payment.builder()
                .bookingId(requestDTO.getBookingId())
                .amount(requestDTO.getAmount())
                .paymentMethod(requestDTO.getPaymentMethod())
                .paymentGateway(requestDTO.getPaymentGateway())
                .cardLastFour(requestDTO.getCardLastFour())
                .paymentStatus(PaymentStatus.PROCESSING)
                .build();

        // Step 2: Save first (so we have ID)
        payment = paymentRepository.save(payment);

        try {
            // Step 3: Call gateway (Mock) — get transaction ID but keep PROCESSING
            // Admin must explicitly accept before status becomes SUCCESS
            String transactionId = paymentGatewayService.processPayment(requestDTO);
            payment.setTransactionId(transactionId);
            // Status stays PROCESSING — awaiting admin approval

        } catch (Exception ex) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setFailureReason(ex.getMessage());
            paymentRepository.save(payment);
            throw new PaymentFailedException("Payment failed: " + ex.getMessage());
        }

        // Step 4: Save with transactionId (still PROCESSING)
        payment = paymentRepository.save(payment);

        return mapToResponseDTO(payment);
    }

    @Override
    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + id));

        return mapToResponseDTO(payment);
    }

    @Override
    public PaymentResponseDTO getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found for bookingId: " + bookingId));

        return mapToResponseDTO(payment);
    }

    @Override
    public PaymentResponseDTO getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(
                        () -> new PaymentNotFoundException("Payment not found for transactionId: " + transactionId));

        return mapToResponseDTO(payment);
    }

    @Override
    public PaymentResponseDTO refundPayment(Long paymentId, RefundRequestDTO refundRequestDTO) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + paymentId));

        // Only allow refund if payment is SUCCESS
        if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new RefundFailedException("Refund not allowed. Payment status is: " + payment.getPaymentStatus());
        }

        Double refundAmount = refundRequestDTO.getRefundAmount();

        // Validate refund amount
        if (refundAmount > payment.getAmount()) {
            throw new RefundFailedException("Refund amount cannot be greater than payment amount");
        }

        boolean refundSuccess = paymentGatewayService.processRefund(payment.getTransactionId(), refundAmount);

        if (!refundSuccess) {
            throw new RefundFailedException("Refund failed in payment gateway");
        }

        // Update refund details
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        payment.setRefundAmount(refundAmount);
        payment.setRefundDate(LocalDateTime.now());

        payment = paymentRepository.save(payment);

        return mapToResponseDTO(payment);
    }

    @Override
    public PaymentResponseDTO rejectPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + id));

        if (payment.getPaymentStatus() != PaymentStatus.PROCESSING) {
            throw new PaymentFailedException(
                    "Only PROCESSING payments can be rejected. Current status: " + payment.getPaymentStatus());
        }

        payment.setPaymentStatus(PaymentStatus.REJECTED);
        payment.setFailureReason("Rejected by admin");
        payment = paymentRepository.save(payment);

        return mapToResponseDTO(payment);
    }

    @Override
    public PaymentResponseDTO acceptPayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found with id: " + id));

        if (payment.getPaymentStatus() != PaymentStatus.PROCESSING) {
            throw new PaymentFailedException(
                    "Only PROCESSING payments can be accepted. Current status: " + payment.getPaymentStatus());
        }

        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setPaymentDate(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        return mapToResponseDTO(payment);
    }

    // ------------------------
    // Mapper Method
    // ------------------------
    private PaymentResponseDTO mapToResponseDTO(Payment payment) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .bookingId(payment.getBookingId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .transactionId(payment.getTransactionId())
                .paymentDate(payment.getPaymentDate())
                .paymentGateway(payment.getPaymentGateway())
                .cardLastFour(payment.getCardLastFour())
                .refundAmount(payment.getRefundAmount())
                .refundDate(payment.getRefundDate())
                .failureReason(payment.getFailureReason())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }
}
