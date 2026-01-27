package com.eventmanagment.event.repository;

import com.eventmanagment.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByCategory(String category); // This is a Custom method to get Event List by Catergory

    List<Event> findByStatus(Event.EventStatus status); // To get Event LIst by Status. Used Enum(EventStatus)
}
