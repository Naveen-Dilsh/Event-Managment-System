package com.eventmanagement.notification.dto;

import com.eventmanagement.notification.entity.Notification.Channel;
import com.eventmanagement.notification.entity.Notification.NotificationType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequestDTO {

    @NotNull
    private Long bookingId;

    @NotNull
    private Long eventId;

    @NotNull
    private String recipientEmail;

    @NotNull
    private String recipientPhone;

    @NotNull
    private NotificationType notificationType;

    @NotNull
    private Channel channel;

    @NotNull
    private String subject;

    @NotNull
    private String message;
}
