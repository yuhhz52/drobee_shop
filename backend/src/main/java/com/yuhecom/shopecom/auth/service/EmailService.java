package com.yuhecom.shopecom.auth.service;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String sender;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${app.mail.sender-name}")
    private String senderName;

    public String sendMail(User user) {
        String subject = "Verify your email";
        String mailContent = "Hello " + user.getUsername() + ",\n";
        mailContent += "Your verification code is: " + user.getVerificationCode() + "\n";
        mailContent += "Please enter this code to verify your email.";
        mailContent += "\n";
        mailContent += senderName;

        return send(user.getEmail(), subject, mailContent);
    }

    @Async
    public void sendOrderConfirmation(User user, Order order) {
        try {
            String subject = "Order Confirmation - #" + order.getId();
            String body = buildOrderConfirmationBody(user, order);
            send(user.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send order confirmation for orderId={}", order.getId(), e);
        }
    }

    @Async
    public void sendPaymentSuccess(User user, Order order) {
        try {
            String subject = "Payment Successful - Order #" + order.getId();
            String body = "Hello " + user.getUsername() + ",\n\n"
                    + "Your payment of " + formatVnd(order.getTotalAmount())
                    + " for order #" + order.getId() + " has been received.\n"
                    + "We are now processing your order.\n\n"
                    + senderName;
            send(user.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send payment success for orderId={}", order.getId(), e);
        }
    }

    @Async
    public void sendPaymentFailure(User user, Order order, String reason) {
        try {
            String subject = "Payment Failed - Order #" + order.getId();
            String body = "Hello " + user.getUsername() + ",\n\n"
                    + "We could not process your payment of " + formatVnd(order.getTotalAmount())
                    + " for order #" + order.getId() + ".\n"
                    + "Reason: " + (reason != null ? reason : "Unknown")
                    + "\nPlease try again or contact support.\n\n"
                    + senderName;
            send(user.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send payment failure for orderId={}", order.getId(), e);
        }
    }

    @Async
    public void sendOrderShipped(User user, Order order) {
        try {
            String subject = "Order Shipped - #" + order.getId();
            String body = "Hello " + user.getUsername() + ",\n\n"
                    + "Your order #" + order.getId() + " has been shipped.\n"
                    + "Track your order at: " + baseUrl + "/account-details/orders/" + order.getId() + "\n\n"
                    + senderName;
            send(user.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send shipped notification for orderId={}", order.getId(), e);
        }
    }

    @Async
    public void sendOrderDelivered(User user, Order order) {
        try {
            String subject = "Order Delivered - #" + order.getId();
            String body = "Hello " + user.getUsername() + ",\n\n"
                    + "Your order #" + order.getId() + " has been delivered.\n"
                    + "Thank you for shopping with us!\n\n"
                    + senderName;
            send(user.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send delivered notification for orderId={}", order.getId(), e);
        }
    }

    @Async
    public void sendOrderCancellationNotice(User user, Order order) {
        try {
            String subject = "Order Cancelled - #" + order.getId();
            String body = "Hello " + user.getUsername() + ",\n\n"
                    + "Your order #" + order.getId() + " has been cancelled.\n"
                    + "Order Total: " + formatVnd(order.getTotalAmount()) + "\n"
                    + "Payment Method: " + (order.getPayment() != null ? order.getPayment().getPaymentMethod() : "N/A") + "\n\n"
                    + "If you have any questions, please contact our support team.\n\n"
                    + senderName;
            send(user.getEmail(), subject, body);
        } catch (Exception e) {
            log.error("Failed to send cancellation notice for orderId={}", order.getId(), e);
        }
    }

    private String buildOrderConfirmationBody(User user, Order order) {
        return "Hello " + user.getUsername() + ",\n\n"
                + "Thank you for your order!\n"
                + "Order ID: " + order.getId() + "\n"
                + "Total: " + formatVnd(order.getTotalAmount()) + "\n"
                + "Payment Method: " + (order.getPayment() != null ? order.getPayment().getPaymentMethod() : "N/A") + "\n"
                + "Status: " + (order.getOrderStatus() != null ? order.getOrderStatus() : "PENDING") + "\n\n"
                + "View your order: " + baseUrl + "/account-details/orders/" + order.getId() + "\n\n"
                + senderName;
    }

    private String formatVnd(BigDecimal amount) {
        if (amount == null) {
            return "0 VND";
        }
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        return nf.format(amount) + " VND";
    }

    private String send(String to, String subject, String body) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(sender);
            mailMessage.setTo(to);
            mailMessage.setText(body);
            mailMessage.setSubject(subject);
            javaMailSender.send(mailMessage);
            return "Email sent";
        } catch (Exception e) {
            log.warn("Email send failed to={} subject={}: {}", to, subject, e.getMessage());
            return "Error while Sending Mail";
        }
    }
}
