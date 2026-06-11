package com.yuhecom.shopecom.service.impl;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.Stripe;
import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.service.StripeService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class StripeServiceImpl implements StripeService {

    @Value("${stripe.secret}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Override
    public Map<String, String> createPaymentIntent(Order order) throws StripeException {
        Map<String, String> metaData = new HashMap<>();
        metaData.put("orderId", order.getId().toString());

        long amountInCents = order.getTotalAmount()
                .multiply(java.math.BigDecimal.valueOf(100))
                .longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .putAllMetadata(metaData)
                .addPaymentMethodType("card")
                .setDescription("Thanh toán đơn thành công")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(false)
                                .build()
                )
                .putMetadata("orderId", order.getId().toString())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);
        Map<String, String> result = new HashMap<>();
        result.put("client_secret", paymentIntent.getClientSecret());
        return result;
    }
}
