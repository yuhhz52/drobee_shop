package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.CheckoutRequest;
import com.yuhecom.shopecom.dto.DirectCheckoutRequest;
import com.yuhecom.shopecom.dto.OrderDetails;
import com.yuhecom.shopecom.dto.OrderRequest;
import com.yuhecom.shopecom.dto.PagingResult;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.service.IdempotencyService;
import com.yuhecom.shopecom.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final OrderService orderService;
    private final IdempotencyService idempotencyService;

    @GetMapping("/vnpay-return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String[]> parameterMap = request.getParameterMap();
        Map<String, String> params = new HashMap<>();
        for (String key : parameterMap.keySet()) {
            params.put(key, parameterMap.get(key)[0]);
        }
        String redirectUrl = orderService.buildVnPayRedirectUrl(params);
        response.sendRedirect(redirectUrl);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            Principal principal,
            HttpServletRequest httpRequest) throws Exception {

        // Use header idempotency key or fall back to body
        String key = idempotencyKey != null ? idempotencyKey : request.getIdempotencyKey();

        // Check for duplicate request
        if (key != null && !key.isBlank()) {
            var existingResponse = idempotencyService.getExistingResponse(key);
            if (existingResponse.isPresent()) {
                log.info("Returning cached response for idempotency key: {}", key);
                @SuppressWarnings("unchecked")
                Map<String, Object> cached = existingResponse.get();
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
        }

        OrderResponse result = orderService.createOrder(request, principal, httpRequest);

        // Store response for idempotency
        if (key != null && !key.isBlank()) {
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("orderId", result.getOrderId().toString());
            responseMap.put("paymentMethod", result.getPaymentMethod());
            if (result.getCredentials() != null) {
                responseMap.put("credentials", result.getCredentials());
            }
            idempotencyService.completeKey(key, result.getOrderId(), responseMap);
        }

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder().result(result).build());
    }

    /**
     * Checkout from cart - preferred method for creating orders.
     * Uses cart items and validates stock before deducting.
     */
    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkoutFromCart(
            @Valid @RequestBody CheckoutRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            Principal principal,
            HttpServletRequest httpRequest) throws Exception {

        // Use header idempotency key or fall back to body
        String key = idempotencyKey != null ? idempotencyKey : request.getIdempotencyKey();

        // Check for duplicate request
        if (key != null && !key.isBlank()) {
            var existingResponse = idempotencyService.getExistingResponse(key);
            if (existingResponse.isPresent()) {
                log.info("Returning cached response for idempotency key: {}", key);
                @SuppressWarnings("unchecked")
                Map<String, Object> cached = existingResponse.get();
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
        }

        OrderResponse result = orderService.checkoutFromCart(request, principal, httpRequest);

        // Store response for idempotency
        if (key != null && !key.isBlank()) {
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("orderId", result.getOrderId().toString());
            responseMap.put("paymentMethod", result.getPaymentMethod());
            if (result.getCredentials() != null) {
                responseMap.put("credentials", result.getCredentials());
            }
            idempotencyService.completeKey(key, result.getOrderId(), responseMap);
        }

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder().result(result).build());
    }

    /**
     * Direct checkout for Buy Now flow - doesn't use cart.
     * Creates order directly from provided items.
     */
    @PostMapping("/direct")
    public ResponseEntity<ApiResponse<OrderResponse>> directCheckout(
            @Valid @RequestBody DirectCheckoutRequest request,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            Principal principal,
            HttpServletRequest httpRequest) throws Exception {

        // Use header idempotency key or fall back to body
        String key = idempotencyKey != null ? idempotencyKey : request.getIdempotencyKey();

        // Check for duplicate request
        if (key != null && !key.isBlank()) {
            var existingResponse = idempotencyService.getExistingResponse(key);
            if (existingResponse.isPresent()) {
                log.info("Returning cached response for idempotency key: {}", key);
                @SuppressWarnings("unchecked")
                Map<String, Object> cached = existingResponse.get();
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
        }

        OrderResponse result = orderService.directCheckout(request, principal, httpRequest);

        // Store response for idempotency
        if (key != null && !key.isBlank()) {
            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("orderId", result.getOrderId().toString());
            responseMap.put("paymentMethod", result.getPaymentMethod());
            if (result.getCredentials() != null) {
                responseMap.put("credentials", result.getCredentials());
            }
            idempotencyService.completeKey(key, result.getOrderId(), responseMap);
        }

        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder().result(result).build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Boolean>> cancelOrder(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String status = body.get("status");
        if (!"CANCELLED".equalsIgnoreCase(status)) {
            throw new AppException(ErrorCode.BAD_REQUEST,
                    "Unsupported status transition: " + status);
        }
        boolean result = orderService.cancelOrder(id, principal);
        return ResponseEntity.ok(ApiResponse.<Boolean>builder().result(result).build());
    }

    @PatchMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> updatePaymentStatus(
            @RequestBody Map<String, String> body) {
        String paymentIntentId = body.get("paymentIntentId");
        String status = body.get("status");
        Map<String, String> result = orderService.updateStatus(paymentIntentId, status);
        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder().result(result).build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<OrderDetails>>> getOrdersByUser(Principal principal) {
        List<OrderDetails> orders = orderService.getOrdersByUser(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<OrderDetails>>builder().result(orders).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetails>> getOrderById(
            @PathVariable UUID id,
            Principal principal) {
        OrderDetails order = orderService.getOrderById(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.<OrderDetails>builder().result(order).build());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<OrderDetails>>> getAllOrders(Pageable pageable) {
        PagingResult<OrderDetails> pageResult = orderService.getOrdersPage(pageable);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", pageResult.contentRange());
        return ResponseEntity.ok().headers(headers)
                .body(ApiResponse.<List<OrderDetails>>builder().result(pageResult.items()).build());
    }
}
