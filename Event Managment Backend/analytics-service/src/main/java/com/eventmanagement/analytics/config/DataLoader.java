package com.eventmanagement.analytics.config;

import com.eventmanagement.analytics.entity.Analytics;
import com.eventmanagement.analytics.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final AnalyticsRepository analyticsRepository;

    @Override
    public void run(String... args) {

        if (analyticsRepository.count() == 0) {

            Analytics analytics = Analytics.builder()
                    .reportType("DASHBOARD")
                    .reportDate(LocalDate.now())
                    .totalBookings(120)
                    .totalRevenue(56000.0)
                    .totalAttendees(340)
                    .averageRating(4.5)
                    .generatedBy("SYSTEM")
                    .dataJson("{\"note\":\"Initial analytics test\"}")
                    .build();

            analyticsRepository.save(analytics);

            System.out.println("Analytics record saved successfully!");
        }
    }
}
