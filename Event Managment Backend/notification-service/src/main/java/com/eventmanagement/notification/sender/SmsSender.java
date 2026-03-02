package com.eventmanagement.notification.sender;

import org.springframework.stereotype.Component;

@Component
public class SmsSender {

    // Add this method
    public void sendSms(String phone, String message) {
        // Dummy SMS logic for now
        System.out.println("SMS sent to " + phone + ": " + message);
    }
}
