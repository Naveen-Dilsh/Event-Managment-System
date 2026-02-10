package com.eventmanagement.notification.repository;

import com.eventmanagement.notification.entity.Notification;
import com.eventmanagement.notification.entity.Notification.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long>  //to get the CRUD operations
{

    List<Notification> findByBookingId(Long bookingId);  // = SELECT * FROM notification WHERE booking_id = ?

    List<Notification> findByEventId(Long eventId);

    List<Notification> findByStatus(NotificationStatus status);
}
