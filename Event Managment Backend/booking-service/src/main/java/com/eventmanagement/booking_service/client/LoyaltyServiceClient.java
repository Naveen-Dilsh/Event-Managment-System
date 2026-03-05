package com.eventmanagement.booking_service.client;

import com.eventmanagement.booking_service.dto.EarnPointsRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "loyalty-service", url = "http://localhost:8088/api/loyalty")
public interface LoyaltyServiceClient {

    @PostMapping("/earn")
    Object earnPoints(@RequestBody EarnPointsRequestDTO dto);
}
