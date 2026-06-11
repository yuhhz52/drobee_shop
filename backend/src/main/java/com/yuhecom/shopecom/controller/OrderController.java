package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.OrderDetails;
import com.yuhecom.shopecom.dto.OrderRequest;
import com.yuhecom.shopecom.dto.PagingResult;
import com.yuhecom.shopecom.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
public class OrderController {

    private final OrderService orderService;

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
            Principal principal,
            HttpServletRequest httpRequest) throws Exception {
        OrderResponse result = orderService.createOrder(request, principal, httpRequest);
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder().result(result).build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Boolean>> cancelOrder(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body,
            Principal principal) {
        String status = body.get("status");
        if ("CANCELLED".equalsIgnoreCase(status)) {
            boolean result = orderService.cancelOrder(id, principal);
            return ResponseEntity.ok(ApiResponse.<Boolean>builder().result(result).build());
        }
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Boolean>builder().message("Unsupported status transition").result(false).build());
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
