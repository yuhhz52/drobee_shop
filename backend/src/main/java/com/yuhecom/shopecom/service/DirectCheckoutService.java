package com.yuhecom.shopecom.service;

/**
 * Use case: Buy Now checkout (single-item direct checkout).
 *
 * <p>Encapsulates the Buy Now flow:
 * <ol>
 *   <li>Validate product + variant + quantity.</li>
 *   <li>Validate stock availability.</li>
 *   <li>Atomically deduct stock per variant.</li>
 *   <li>Persist Order, OrderItem, Payment.</li>
 *   <li>Initiate payment provider side-effects (Stripe / VNPay).</li>
 * </ol>
 *
 * <p><b>Hard rule:</b> the cart must NEVER be touched by this flow. No reads,
 * no writes, no clears, no merges. The cart is fully owned by the user and
 * must remain untouched so other items survive the checkout.
 */
public interface DirectCheckoutService {

    /**
     * Place a Buy Now order directly from the supplied item(s) without
     * involving the cart.
     *
     * @param request   one or more items + address + payment method
     * @param userEmail principal name (email) of the authenticated user
     * @param clientIp  client IP used by VNPay URL signing
     * @return order response with payment credentials when applicable
     */
    com.yuhecom.shopecom.auth.dto.OrderResponse checkout(
            com.yuhecom.shopecom.dto.DirectCheckoutRequest request,
            String userEmail,
            String clientIp
    ) throws Exception;
}
