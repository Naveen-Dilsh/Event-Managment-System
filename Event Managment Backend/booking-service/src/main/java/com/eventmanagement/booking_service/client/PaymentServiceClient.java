package com.eventmanagement.booking_service.client;

import com.eventmanagement.booking_service.dto.PaymentRequestDTO;
import com.eventmanagement.booking_service.dto.PaymentResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", url = "${payment.service.url}")
public interface PaymentServiceClient {

    @PostMapping("/api/payments")
    PaymentResponseDTO processPayment(@RequestBody PaymentRequestDTO dto);
}
