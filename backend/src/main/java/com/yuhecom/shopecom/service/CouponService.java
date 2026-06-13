package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.CouponDto;

import java.math.BigDecimal;

public interface CouponService {

    CouponDto validateAndCalculateDiscount(String couponCode, BigDecimal orderAmount);

    void incrementUsage(java.util.UUID couponId);
}
