package com.yuhecom.shopecom.service;

/**
 * Use case: checkout from the user's saved cart.
 *
 * <p>Encapsulates the cart-based order placement flow:
 * <ol>
 *   <li>Load cart with pessimistic lock.</li>
 *   <li>Validate stock + product availability.</li>
 *   <li>Apply coupon discount (optional).</li>
 *   <li>Atomically deduct stock per variant.</li>
 *   <li>Persist Order, OrderItems, Payment.</li>
 *   <li>Clear cart items after successful commit.</li>
 *   <li>Initiate payment provider side-effects (Stripe / VNPay).</li>
 * </ol>
 *
 * <p>This service is intentionally isolated from {@link DirectCheckoutService}
 * so that each use case has its own lifecycle, idempotency story, and
 * side-effects — never the "boolean flag" branching anti-pattern.
 */
public interface CartCheckoutService {

    /**
     * Place an order from the authenticated user's cart.
     *
     * @param request      cart id + address + payment method (+ optional coupon)
     * @param userEmail    principal name (email) of the authenticated user
     * @param clientIp     client IP used by VNPay URL signing
     * @return order response with payment credentials when applicable
     */
    com.yuhecom.shopecom.auth.dto.OrderResponse checkout(
            com.yuhecom.shopecom.dto.CheckoutRequest request,
            String userEmail,
            String clientIp
    ) throws Exception;
}
