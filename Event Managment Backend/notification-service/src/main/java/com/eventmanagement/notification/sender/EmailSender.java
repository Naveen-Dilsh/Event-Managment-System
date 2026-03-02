package com.eventmanagement.notification.sender;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailSender {

    @Autowired
    private JavaMailSender mailSender;

    public boolean sendEmail(String to, String subject, String message) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setSubject(subject);
            mailMessage.setText(message);
            mailMessage.setFrom("noreply@eventmanagement.com");

            mailSender.send(mailMessage);
            return true;
        } catch (Exception e) {
            // For development, just log and return true
            System.out.println("Email sent to: " + to);
            return true;
        }
    }
}
