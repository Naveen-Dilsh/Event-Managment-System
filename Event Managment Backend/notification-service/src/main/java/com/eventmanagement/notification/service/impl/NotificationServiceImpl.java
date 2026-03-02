//no feign yet - 10.02.2026

package com.eventmanagement.notification.service.impl;

import com.eventmanagement.notification.dto.NotificationRequestDTO;
import com.eventmanagement.notification.dto.NotificationResponseDTO;
import com.eventmanagement.notification.entity.Notification;
import com.eventmanagement.notification.entity.Notification.NotificationStatus;
import com.eventmanagement.notification.exception.NotificationNotFoundException;
import com.eventmanagement.notification.repository.NotificationRepository;
import com.eventmanagement.notification.sender.EmailSender;
import com.eventmanagement.notification.sender.SmsSender;
import com.eventmanagement.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailSender emailSender;
    private final SmsSender smsSender;

    //main method to send a notification
    @Override
    public NotificationResponseDTO sendNotification(NotificationRequestDTO dto) {

        //notification entity from dto
        Notification notification = Notification.builder()
                .bookingId(dto.getBookingId())  //link to booking
                .eventId(dto.getEventId())   //link to event
                .recipientEmail(dto.getRecipientEmail())
                .recipientPhone(dto.getRecipientPhone())
                .notificationType(dto.getNotificationType())
                .channel(dto.getChannel())
                .subject(dto.getSubject())
                .message(dto.getMessage())
                .status(NotificationStatus.PENDING)
                .build();

        boolean emailSent = false;

        //send email if channel allows
        if (dto.getChannel() == Notification.Channel.EMAIL ||
                dto.getChannel() == Notification.Channel.BOTH) {

            emailSent = emailSender.sendEmail(
                    dto.getRecipientEmail(),
                    dto.getSubject(),
                    dto.getMessage()
            );
        }

        //send sms if channel allows
        if (dto.getChannel() == Notification.Channel.SMS ||
                dto.getChannel() == Notification.Channel.BOTH) {

            smsSender.sendSms(dto.getRecipientPhone(), dto.getMessage());
        }

        //update status if email sent
        if (emailSent) {
            notification.setStatus(NotificationStatus.SENT); //mark as sent
            notification.setSentAt(LocalDateTime.now());  //timestamp
        } else {
            notification.setStatus(NotificationStatus.FAILED); //mark as failed
        }

        //save to db and convert entity to dto for api response
        return mapToResponse(notificationRepository.save(notification));
    }

    //fetch a notification by its id
    @Override
    public NotificationResponseDTO getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));
    }

    //fetch all notifications in db
    @Override
    public List<NotificationResponseDTO> getAllNotifications() {
        return notificationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //fetch notification filtered by bookingId
    @Override
    public List<NotificationResponseDTO> getNotificationsByBookingId(Long bookingId) {
        return notificationRepository.findByBookingId(bookingId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    //resending an existing notification, only via email
    @Override
    public NotificationResponseDTO resendNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found"));

        //sending email again
        emailSender.sendEmail(
                notification.getRecipientEmail(),
                notification.getSubject(),
                notification.getMessage()
        );

        //updating status and timestamp
        notification.setStatus(NotificationStatus.SENT);
        notification.setSentAt(LocalDateTime.now());

        //saving updated entity and return dto
        return mapToResponse(notificationRepository.save(notification));
    }

    //deleting a notification by id
    @Override
    public void deleteNotification(Long id) {
        notificationRepository.deleteById(id);
    }

    //maps entity to dto for api responses
    private NotificationResponseDTO mapToResponse(Notification n) {
        return NotificationResponseDTO.builder()
                .id(n.getId())
                .bookingId(n.getBookingId())
                .eventId(n.getEventId())
                .recipientEmail(n.getRecipientEmail())
                .recipientPhone(n.getRecipientPhone())
                .notificationType(n.getNotificationType())
                .channel(n.getChannel())
                .subject(n.getSubject())
                .message(n.getMessage())
                .status(n.getStatus())
                .sentAt(n.getSentAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
