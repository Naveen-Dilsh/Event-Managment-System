package com.eventmanagement.loyalty.service;

import com.eventmanagement.loyalty.dto.LoyaltyRequestDTO;
import com.eventmanagement.loyalty.dto.LoyaltyResponseDTO;

import java.util.List;
import com.eventmanagement.loyalty.dto.EarnPointsRequestDTO;

public interface LoyaltyService {
    LoyaltyResponseDTO createAccount(LoyaltyRequestDTO dto); // POST

    LoyaltyResponseDTO getAccountById(Long id); // GET by ID

    LoyaltyResponseDTO getAccountByAttendeeId(Long attendeeId);

    List<LoyaltyResponseDTO> getAllAccounts();

    LoyaltyResponseDTO updateAccount(Long id, LoyaltyRequestDTO dto); // PUT

    void deleteAccount(Long id); // DELETE

    LoyaltyResponseDTO earnPoints(EarnPointsRequestDTO dto);
}
