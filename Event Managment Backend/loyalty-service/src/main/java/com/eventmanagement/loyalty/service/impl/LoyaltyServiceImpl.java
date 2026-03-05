package com.eventmanagement.loyalty.service.impl;

import com.eventmanagement.loyalty.client.AttendeeServiceClient;
import com.eventmanagement.loyalty.dto.AttendeeDTO;
import com.eventmanagement.loyalty.dto.LoyaltyRequestDTO;
import com.eventmanagement.loyalty.dto.LoyaltyResponseDTO;
import com.eventmanagement.loyalty.dto.EarnPointsRequestDTO;
import com.eventmanagement.loyalty.entity.LoyaltyAccount;
import com.eventmanagement.loyalty.exception.LoyaltyAccountNotFoundException;
import com.eventmanagement.loyalty.repository.LoyaltyRepository;
import com.eventmanagement.loyalty.service.LoyaltyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoyaltyServiceImpl implements LoyaltyService {

    private final LoyaltyRepository loyaltyRepository;
    private final AttendeeServiceClient attendeeServiceClient;

    @Override
    public LoyaltyResponseDTO createAccount(LoyaltyRequestDTO dto) {
        AttendeeDTO attendee;
        try {
            attendee = attendeeServiceClient.getAttendeeById(dto.getAttendeeId());
        } catch (Exception e) {
            throw new RuntimeException("Attendee not found with ID: " + dto.getAttendeeId());
        }

        LoyaltyAccount account = new LoyaltyAccount();
        account.setAttendeeId(dto.getAttendeeId());
        account.setPointsBalance(dto.getPointsBalance());
        account.setTotalPointsEarned(dto.getTotalPointsEarned());
        account.setMembershipTier(dto.getMembershipTier());
        account.setStatus(dto.getStatus());

        LoyaltyAccount saved = loyaltyRepository.save(account);
        return mapToDTO(saved, attendee.getFirstName() + " " + attendee.getLastName());
    }

    @Override
    public LoyaltyResponseDTO getAccountById(Long id) {
        LoyaltyAccount account = loyaltyRepository.findById(id)
                .orElseThrow(() -> new LoyaltyAccountNotFoundException("Account not found: " + id));
        return mapToDTO(account, getAttendeeName(account.getAttendeeId()));
    }

    @Override
    public LoyaltyResponseDTO getAccountByAttendeeId(Long attendeeId) {
        LoyaltyAccount account = loyaltyRepository.findByAttendeeId(attendeeId)
                .orElseThrow(() -> new LoyaltyAccountNotFoundException("No account for attendee: " + attendeeId));
        return mapToDTO(account, getAttendeeName(attendeeId));
    }

    @Override
    public List<LoyaltyResponseDTO> getAllAccounts() {
        return loyaltyRepository.findAll().stream()
                .map(a -> mapToDTO(a, getAttendeeName(a.getAttendeeId())))
                .collect(Collectors.toList());
    }

    @Override
    public LoyaltyResponseDTO updateAccount(Long id, LoyaltyRequestDTO dto) {
        LoyaltyAccount account = loyaltyRepository.findById(id)
                .orElseThrow(() -> new LoyaltyAccountNotFoundException("Account not found: " + id));

        account.setPointsBalance(dto.getPointsBalance());
        account.setTotalPointsEarned(dto.getTotalPointsEarned());
        account.setMembershipTier(dto.getMembershipTier());
        account.setStatus(dto.getStatus());

        LoyaltyAccount updated = loyaltyRepository.save(account);
        return mapToDTO(updated, getAttendeeName(updated.getAttendeeId()));
    }

    @Override
    public void deleteAccount(Long id) {
        if (!loyaltyRepository.existsById(id)) {
            throw new LoyaltyAccountNotFoundException("Account not found: " + id);
        }
        loyaltyRepository.deleteById(id);
    }

    @Override
    public LoyaltyResponseDTO earnPoints(EarnPointsRequestDTO dto) {
        LoyaltyAccount account = loyaltyRepository.findByAttendeeId(dto.getAttendeeId())
                .orElseGet(() -> {
                    // Implicitly verify attendee exists
                    try {
                        attendeeServiceClient.getAttendeeById(dto.getAttendeeId());
                    } catch (Exception e) {
                        throw new RuntimeException("Attendee not found with ID: " + dto.getAttendeeId());
                    }
                    LoyaltyAccount newAccount = new LoyaltyAccount();
                    newAccount.setAttendeeId(dto.getAttendeeId());
                    newAccount.setPointsBalance(0.0);
                    newAccount.setTotalPointsEarned(0.0);
                    newAccount.setMembershipTier("Basic");
                    newAccount.setStatus("ACTIVE");
                    return loyaltyRepository.save(newAccount);
                });

        account.setPointsBalance(account.getPointsBalance() + dto.getPointsToEarn());
        account.setTotalPointsEarned(account.getTotalPointsEarned() + dto.getPointsToEarn());

        // Auto-update tier if needed
        double total = account.getTotalPointsEarned();
        if (total >= 100.0) {
            account.setMembershipTier("VIP");
        } else if (total >= 50.0) {
            account.setMembershipTier("Premium");
        } else {
            account.setMembershipTier("Basic");
        }

        LoyaltyAccount updated = loyaltyRepository.save(account);
        return mapToDTO(updated, getAttendeeName(updated.getAttendeeId()));
    }

    // Helper methods
    private String getAttendeeName(Long attendeeId) {
        try {
            AttendeeDTO a = attendeeServiceClient.getAttendeeById(attendeeId);
            return a.getFirstName() + " " + a.getLastName();
        } catch (Exception e) {
            return "Unknown Attendee";
        }
    }

    private LoyaltyResponseDTO mapToDTO(LoyaltyAccount a, String name) {
        LoyaltyResponseDTO dto = new LoyaltyResponseDTO();
        dto.setId(a.getId());
        dto.setAttendeeId(a.getAttendeeId());
        dto.setAttendeeName(name);
        dto.setPointsBalance(a.getPointsBalance());
        dto.setTotalPointsEarned(a.getTotalPointsEarned());
        dto.setMembershipTier(a.getMembershipTier());
        dto.setStatus(a.getStatus());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setUpdatedAt(a.getUpdatedAt());
        return dto;
    }
}