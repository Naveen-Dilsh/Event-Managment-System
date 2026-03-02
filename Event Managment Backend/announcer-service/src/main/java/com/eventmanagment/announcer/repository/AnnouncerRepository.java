package com.eventmanagment.announcer.repository;

import com.eventmanagment.announcer.entity.Announcer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnnouncerRepository extends JpaRepository<Announcer, Long> {

    List<Announcer> findByStatus(String status);

    List<Announcer> findBySpecialization(String specialization);
}