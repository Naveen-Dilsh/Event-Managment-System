package com.eventmanagement.attendee.repository;

import com.eventmanagement.attendee.entity.Attendee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository interface for managing Attendee entities.
 * This interface extends JpaRepository to provide built-in CRUD operations.
   (save, findById, findAll, deleteById, and update)
 */

public interface AttendeeRepository extends JpaRepository<Attendee, Long> {

    Optional<Attendee> findByEmail(String email);
}
