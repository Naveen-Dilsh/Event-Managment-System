package com.eventmanagement.notification.controller;

import com.eventmanagement.notification.dto.NotificationRequestDTO;
import com.eventmanagement.notification.dto.NotificationResponseDTO;
import com.eventmanagement.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NotificationResponseDTO send(@Valid @RequestBody NotificationRequestDTO dto) {
        return notificationService.sendNotification(dto);
    }

    @GetMapping
    public List<NotificationResponseDTO> getAll() {
        return notificationService.getAllNotifications();
    }

    @GetMapping("/{id}")
    public NotificationResponseDTO getById(@PathVariable Long id) {
        return notificationService.getNotificationById(id);
    }

    @GetMapping("/booking/{bookingId}")
    public List<NotificationResponseDTO> getByBooking(@PathVariable Long bookingId) {
        return notificationService.getNotificationsByBookingId(bookingId);
    }

    @PostMapping("/{id}/resend")
    public NotificationResponseDTO resend(@PathVariable Long id) {
        return notificationService.resendNotification(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        notificationService.deleteNotification(id);
    }
}
