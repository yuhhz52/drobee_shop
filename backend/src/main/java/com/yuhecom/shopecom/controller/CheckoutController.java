package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.CheckoutRequest;
import com.yuhecom.shopecom.dto.DirectCheckoutRequest;
import com.yuhecom.shopecom.service.CartCheckoutService;
import com.yuhecom.shopecom.service.DirectCheckoutService;
import com.yuhecom.shopecom.service.IdempotencyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Checkout endpoints with one purpose per use case:
 *
 * <ul>
 *   <li>{@code POST /api/checkout/cart}   — cart-based checkout (clears the cart).</li>
 *   <li>{@code POST /api/checkout/direct} — Buy Now checkout (cart is never touched).</li>
 * </ul>
 *
 * <p>Each use case has its own service, its own DTO, its own URL — no shared
 * {@code boolean isDirect} branching. Both endpoints support
 * {@code X-Idempotency-Key} so duplicate POSTs return the cached order.
 */
@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
@Slf4j
public class CheckoutController {

    private final CartCheckoutService cartCheckoutService;
    private final DirectCheckoutService directCheckoutService;
    private final IdempotencyService idempotencyService;

    /**
     * Cart-based checkout. Items come from the user's saved cart.
     * On success the cart is cleared.
     */
    @PostMapping("/cart")
    public ResponseEntity<ApiResponse<OrderResponse>> checkoutCart(
            @Valid @RequestBody CheckoutRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            Principal principal,
            HttpServletRequest httpRequest) throws Exception {

        String key = idempotencyKey != null ? idempotencyKey : request.getIdempotencyKey();
        if (key != null && !key.isBlank()) {
            var existing = idempotencyService.getExistingResponse(key);
            if (existing.isPresent()) {
                return ResponseEntity.ok(cachedResponse(existing.get(), "cart checkout"));
            }
        }

        OrderResponse result = cartCheckoutService.checkout(
                request, principal.getName(), clientIp(httpRequest));

        if (key != null && !key.isBlank()) {
            idempotencyService.completeKey(key, result.getOrderId(), toResponseMap(result));
        }
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder().result(result).build());
    }

    /**
     * Buy Now / direct checkout. Items are submitted inline — the cart is
     * never read, written, or cleared.
     */
    @PostMapping("/direct")
    public ResponseEntity<ApiResponse<OrderResponse>> checkoutDirect(
            @Valid @RequestBody DirectCheckoutRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            Principal principal,
            HttpServletRequest httpRequest) throws Exception {

        String key = idempotencyKey != null ? idempotencyKey : request.getIdempotencyKey();
        if (key != null && !key.isBlank()) {
            var existing = idempotencyService.getExistingResponse(key);
            if (existing.isPresent()) {
                return ResponseEntity.ok(cachedResponse(existing.get(), "direct checkout"));
            }
        }

        OrderResponse result = directCheckoutService.checkout(
                request, principal.getName(), clientIp(httpRequest));

        if (key != null && !key.isBlank()) {
            idempotencyService.completeKey(key, result.getOrderId(), toResponseMap(result));
        }
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder().result(result).build());
    }

    private ResponseEntity<ApiResponse<OrderResponse>> cachedResponse(
            Map<String, Object> cached, String flowName) {
        log.info("Returning cached response for idempotency key ({}): orderId={}",
                flowName, cached.get("orderId"));
        OrderResponse cachedOrder = OrderResponse.builder()
                .orderId(UUID.fromString((String) cached.get("orderId")))
                .paymentMethod((String) cached.get("paymentMethod"))
                .build();
        @SuppressWarnings("unchecked")
        Map<String, String> credentials = (Map<String, String>) cached.get("credentials");
        if (credentials != null) {
            cachedOrder.setCredentials(credentials);
        }
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder()
                .result(cachedOrder)
                .message("Duplicate request - returning cached response")
                .build());
    }

    private Map<String, Object> toResponseMap(OrderResponse result) {
        Map<String, Object> map = new HashMap<>();
        map.put("orderId", result.getOrderId().toString());
        map.put("paymentMethod", result.getPaymentMethod());
        if (result.getCredentials() != null) {
            map.put("credentials", result.getCredentials());
        }
        return map;
    }

    private String clientIp(HttpServletRequest httpRequest) {
        if (httpRequest == null) return null;
        String xForwardedFor = httpRequest.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = httpRequest.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return httpRequest.getRemoteAddr();
    }
}
