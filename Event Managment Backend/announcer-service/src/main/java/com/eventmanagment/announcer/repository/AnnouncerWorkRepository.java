package com.eventmanagment.announcer.repository;

import com.eventmanagment.announcer.entity.AnnouncerWork;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncerWorkRepository extends JpaRepository<AnnouncerWork, Long> {

    // Get all past works of an announcer
    List<AnnouncerWork> findByAnnouncerId(Long announcerId);

    // Get works by event
    List<AnnouncerWork> findByEventId(Long eventId);
}