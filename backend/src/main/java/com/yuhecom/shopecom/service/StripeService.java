package com.yuhecom.shopecom.service;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.entity.Order;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class StripeService {

    @Value("${stripe.secret}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public Map<String, String> createPaymentIntent(Order order) throws StripeException {
        User user = order.getUser();
        Map<String, String> metaData = new HashMap<>();
        metaData.put("orderId",order.getId().toString());
        PaymentIntentCreateParams paymentIntentCreateParams = PaymentIntentCreateParams.builder()
                .setAmount(order.getTotalAmount().longValue())
                .setCurrency("usd")
                .putAllMetadata(metaData)
                .addPaymentMethodType("card")
                .setDescription("Thanh toán đơn thành công")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(false).build()
                )
                .putMetadata("orderId", order.getId().toString())
                .build();


        PaymentIntent paymentIntent = PaymentIntent.create(paymentIntentCreateParams);
        Map<String, String> map = new HashMap<>();
        map.put("client_secret", paymentIntent.getClientSecret());
        return map;
    }
}

















