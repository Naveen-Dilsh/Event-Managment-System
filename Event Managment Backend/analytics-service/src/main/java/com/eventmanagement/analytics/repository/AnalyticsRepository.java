package com.eventmanagement.analytics.repository;

import com.eventmanagement.analytics.entity.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {

    List<Analytics> findByReportType(String reportType);

    List<Analytics> findByEventId(Long eventId);

    List<Analytics> findByReportDate(LocalDate reportDate);

    List<Analytics> findByReportTypeAndEventId(String reportType, Long eventId);
}
