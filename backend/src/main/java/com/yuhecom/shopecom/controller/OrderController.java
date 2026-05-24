package com.yuhecom.shopecom.controller;
import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.OrderDetails;
import com.yuhecom.shopecom.dto.OrderRequest;
import com.yuhecom.shopecom.dto.PagingResult;
import com.yuhecom.shopecom.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/order")
public class OrderController {

    @Autowired
    OrderService orderService;

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
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@RequestBody OrderRequest orderRequest, Principal principal) throws Exception {
        OrderResponse orderResponse = orderService.createOrder(orderRequest,principal);
        return ResponseEntity.ok(ApiResponse.<OrderResponse>builder().result(orderResponse).build());
    }

    @PostMapping("/update-payment")
    public ResponseEntity<ApiResponse<Map<String,String>>> updatePaymentStatus(@RequestBody Map<String,String> request){
        String paymentIntentId = request.get("paymentIntentId");
        String status = request.get("status");
        Map<String,String> response = orderService.updateStatus(paymentIntentId, status);
        return ResponseEntity.ok(ApiResponse.<Map<String,String>>builder().result(response).build());
    }

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<List<OrderDetails>>> getOrderByUser(Principal principal) {
        List<OrderDetails> orders = orderService.getOrdersByUser(principal.getName());
        return ResponseEntity.ok(ApiResponse.<List<OrderDetails>>builder().result(orders).build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderDetails>>> getAllOrders(Pageable pageable) {
        PagingResult<OrderDetails> pageResult = orderService.getOrdersPage(pageable);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Range", pageResult.contentRange());
        return ResponseEntity.ok().headers(headers)
                .body(ApiResponse.<List<OrderDetails>>builder().result(pageResult.items()).build());
    }
}
