package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.CouponDto;
import com.yuhecom.shopecom.entity.Coupon;
import com.yuhecom.shopecom.entity.CouponType;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.reponsitory.CouponRepository;
import com.yuhecom.shopecom.service.CouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Slf4j
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    @Transactional(readOnly = true)
    public CouponDto validateAndCalculateDiscount(String couponCode, BigDecimal orderAmount) {
        if (couponCode == null || couponCode.isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Coupon code is required");
        }

        Coupon coupon = couponRepository.findByCode(couponCode.trim().toUpperCase())
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND, "Coupon not found: " + couponCode));

        validateCoupon(coupon, orderAmount);

        BigDecimal discount = calculateDiscount(coupon, orderAmount);

        log.info("Coupon validated: code={}, type={}, discount={}, orderAmount={}",
                couponCode, coupon.getType(), discount, orderAmount);

        return toDto(coupon, discount);
    }

    @Override
    @Transactional
    public void incrementUsage(java.util.UUID couponId) {
        int updated = couponRepository.incrementUsageCount(couponId);
        if (updated == 0) {
            throw new AppException(ErrorCode.COUPON_NOT_FOUND, "Coupon not found: " + couponId);
        }
        log.info("Coupon usage incremented: couponId={}", couponId);
    }

    private void validateCoupon(Coupon coupon, BigDecimal orderAmount) {
        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new AppException(ErrorCode.COUPON_INACTIVE, "Coupon is no longer active");
        }

        if (coupon.isNotYetValid()) {
            throw new AppException(ErrorCode.COUPON_NOT_YET_VALID,
                    "Coupon is not yet valid. Valid from: " + coupon.getValidFrom());
        }

        if (coupon.isExpired()) {
            throw new AppException(ErrorCode.COUPON_EXPIRED, "Coupon has expired");
        }

        if (coupon.hasReachedUsageLimit()) {
            throw new AppException(ErrorCode.COUPON_USAGE_LIMIT_REACHED,
                    "Coupon has reached its usage limit");
        }

        if (orderAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new AppException(ErrorCode.COUPON_MIN_ORDER_NOT_MET,
                    String.format("Minimum order amount is %s. Your order amount is %s",
                            coupon.getMinOrderAmount(), orderAmount));
        }
    }

    BigDecimal calculateDiscount(Coupon coupon, BigDecimal orderAmount) {
        BigDecimal discount;

        if (coupon.getType() == CouponType.PERCENTAGE) {
            discount = orderAmount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            if (coupon.getMaxDiscountAmount() != null
                    && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        if (discount.compareTo(orderAmount) > 0) {
            discount = orderAmount;
        }

        return discount.setScale(2, RoundingMode.HALF_UP);
    }

    private CouponDto toDto(Coupon coupon, BigDecimal calculatedDiscount) {
        return CouponDto.builder()
                .id(coupon.getId())
                .code(coupon.getCode())
                .description(coupon.getDescription())
                .type(coupon.getType().name())
                .discountValue(coupon.getDiscountValue())
                .minOrderAmount(coupon.getMinOrderAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .usageLimit(coupon.getUsageLimit())
                .usedCount(coupon.getUsedCount())
                .validFrom(coupon.getValidFrom())
                .validUntil(coupon.getValidUntil())
                .active(coupon.getActive())
                .valid(coupon.isValid())
                .calculatedDiscount(calculatedDiscount)
                .build();
    }
}
