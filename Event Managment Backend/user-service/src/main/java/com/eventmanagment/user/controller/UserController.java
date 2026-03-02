package com.eventmanagment.user.controller;

import com.eventmanagment.user.dto.LoginRequestDTO;
import com.eventmanagment.user.dto.RegisterRequestDTO;
import com.eventmanagment.user.dto.UserResponseDTO;
import com.eventmanagment.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // POST /api/users/register
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody RegisterRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(dto));
    }

    // POST /api/users/login
    @PostMapping("/login")
    public ResponseEntity<UserResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

    // POST /api/users/logout/{userId}
    @PostMapping("/logout/{userId}")
    public ResponseEntity<Map<String, String>> logout(@PathVariable Long userId) {
        String message = userService.logout(userId);
        return ResponseEntity.ok(Map.of("message", message));
    }
}
