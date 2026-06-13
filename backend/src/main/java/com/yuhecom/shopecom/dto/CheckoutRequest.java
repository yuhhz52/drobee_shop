package com.yuhecom.shopecom.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {

    /**
     * User's cart will be used for checkout.
     * Stock will be verified and deducted during checkout.
     */
    @NotNull(message = "Cart ID is required")
    private UUID cartId;

    /**
     * Selected shipping address ID.
     */
    @NotNull(message = "Address ID is required")
    private UUID addressId;

    /**
     * Payment method: CARD, VNPAY, COD
     */
    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    /**
     * Optional coupon code.
     */
    private String couponCode;

    /**
     * Idempotency key for preventing duplicate orders.
     */
    private String idempotencyKey;
}
