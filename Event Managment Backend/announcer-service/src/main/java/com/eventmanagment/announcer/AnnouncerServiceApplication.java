package com.eventmanagment.announcer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class AnnouncerServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AnnouncerServiceApplication.class, args);
	}
}