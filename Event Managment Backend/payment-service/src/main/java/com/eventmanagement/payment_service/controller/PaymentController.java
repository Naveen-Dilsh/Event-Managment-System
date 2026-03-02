package com.eventmanagement.payment_service.controller;

import com.eventmanagement.payment_service.dto.PaymentRequestDTO;
import com.eventmanagement.payment_service.dto.PaymentResponseDTO;
import com.eventmanagement.payment_service.dto.RefundRequestDTO;
import com.eventmanagement.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponseDTO> processPayment(
            @Valid @RequestBody PaymentRequestDTO requestDTO
    ) {
        return new ResponseEntity<>(paymentService.processPayment(requestDTO), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDTO> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<PaymentResponseDTO> getPaymentByTransactionId(@PathVariable String transactionId) {
        return ResponseEntity.ok(paymentService.getPaymentByTransactionId(transactionId));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponseDTO> refundPayment(
            @PathVariable Long paymentId,
            @Valid @RequestBody RefundRequestDTO refundRequestDTO
    ) {
        return ResponseEntity.ok(paymentService.refundPayment(paymentId, refundRequestDTO));
    }
}
