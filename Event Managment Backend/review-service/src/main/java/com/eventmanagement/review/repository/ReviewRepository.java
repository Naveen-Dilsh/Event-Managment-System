package com.eventmanagement.review.repository;

import com.eventmanagement.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Find all reviews for an event
    List<Review> findByEventId(Long eventId);

    // Find all reviews by an attendee
    List<Review> findByAttendeeId(Long attendeeId);

    // Check if review already exists (unique constraint support)
    Optional<Review> findByEventIdAndAttendeeId(Long eventId, Long attendeeId);

    // Average rating for an event
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.eventId = :eventId")
    Double findAverageRatingByEventId(@Param("eventId") Long eventId);

    // Total review count for an event
    @Query("SELECT COUNT(r) FROM Review r WHERE r.eventId = :eventId")
    Long countReviewsByEventId(@Param("eventId") Long eventId);
}
