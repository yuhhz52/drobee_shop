package com.yuhecom.shopecom.service;

import com.stripe.exception.StripeException;
import com.yuhecom.shopecom.entity.Order;

import java.util.Map;

public interface StripeService {

    Map<String, String> createPaymentIntent(Order order) throws StripeException;
}
