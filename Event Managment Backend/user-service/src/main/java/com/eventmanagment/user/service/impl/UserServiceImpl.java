package com.eventmanagment.user.service.impl;

import com.eventmanagment.user.dto.LoginRequestDTO;
import com.eventmanagment.user.dto.RegisterRequestDTO;
import com.eventmanagment.user.dto.UserResponseDTO;
import com.eventmanagment.user.entity.User;
import com.eventmanagment.user.exception.UserNotFoundException;
import com.eventmanagment.user.repository.UserRepository;
import com.eventmanagment.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponseDTO register(RegisterRequestDTO dto) {
        // Check if email already exists
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already registered: " + dto.getEmail());
        }

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword()); // plain text — add hashing later if needed
        user.setRole(dto.getRole() != null ? dto.getRole() : "USER");
        user.setStatus("ACTIVE");

        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    @Override
    public UserResponseDTO login(LoginRequestDTO dto) {
        // Find user by email
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new UserNotFoundException("No account found with email: " + dto.getEmail()));

        // Check password
        if (!user.getPassword().equals(dto.getPassword())) {
            throw new RuntimeException("Incorrect password");
        }

        // Check account is active
        if (!user.getStatus().equals("ACTIVE")) {
            throw new RuntimeException("Account is not active");
        }

        return mapToDTO(user);
    }

    @Override
    public String logout(Long userId) {
        // Confirm user exists
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found with ID: " + userId);
        }
        // Stateless: no session to clear — just return success message
        return "User " + userId + " logged out successfully";
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private UserResponseDTO mapToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
