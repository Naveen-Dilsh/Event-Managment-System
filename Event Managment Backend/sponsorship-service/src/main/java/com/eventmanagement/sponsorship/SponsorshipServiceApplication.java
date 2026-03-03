package com.eventmanagement.sponsorship;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SponsorshipServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(SponsorshipServiceApplication.class, args);
    }
}