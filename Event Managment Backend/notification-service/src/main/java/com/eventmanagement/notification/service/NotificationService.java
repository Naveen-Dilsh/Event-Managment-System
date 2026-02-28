package com.eventmanagement.notification.service;

import com.eventmanagement.notification.dto.NotificationRequestDTO;
import com.eventmanagement.notification.dto.NotificationResponseDTO;

import java.util.List;

public interface NotificationService {

    NotificationResponseDTO sendNotification(NotificationRequestDTO dto);

    NotificationResponseDTO getNotificationById(Long id);

    List<NotificationResponseDTO> getAllNotifications();

    List<NotificationResponseDTO> getNotificationsByBookingId(Long bookingId);

    NotificationResponseDTO resendNotification(Long id);

    void deleteNotification(Long id);
}
