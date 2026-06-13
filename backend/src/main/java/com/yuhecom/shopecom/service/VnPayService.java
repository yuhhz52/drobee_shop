package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.entity.Order;

import java.util.Map;

public interface VnPayService {

    String createPaymentUrl(Order order, String clientIp);

    boolean validateReturn(Map<String, String> params);

    boolean verifyReturnAmount(Map<String, String> params, Order order);
}
