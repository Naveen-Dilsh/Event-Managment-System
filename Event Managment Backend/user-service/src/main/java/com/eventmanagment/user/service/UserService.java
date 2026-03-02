package com.eventmanagment.user.service;

import com.eventmanagment.user.dto.LoginRequestDTO;
import com.eventmanagment.user.dto.RegisterRequestDTO;
import com.eventmanagment.user.dto.UserResponseDTO;

public interface UserService {

    // Register a new user
    UserResponseDTO register(RegisterRequestDTO dto);

    // Login — returns user info if credentials are correct
    UserResponseDTO login(LoginRequestDTO dto);

    // Logout — just returns a success message (stateless, no token yet)
    String logout(Long userId);
}
