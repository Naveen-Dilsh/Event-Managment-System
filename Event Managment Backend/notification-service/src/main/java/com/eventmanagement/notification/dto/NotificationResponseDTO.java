package com.eventmanagement.notification.dto;

import com.eventmanagement.notification.entity.Notification.Channel;
import com.eventmanagement.notification.entity.Notification.NotificationStatus;
import com.eventmanagement.notification.entity.Notification.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDTO {

    private Long id;
    private Long bookingId;
    private Long eventId;
    private String recipientEmail;
    private String recipientPhone;
    private NotificationType notificationType;
    private Channel channel;
    private String subject;
    private String message;
    private NotificationStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime createdAt;
}
