package com.yuhecom.shopecom.controller;
import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.dto.OrderDetails;
import com.yuhecom.shopecom.dto.OrderRequest;
import com.yuhecom.shopecom.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;


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

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, Principal principal) throws Exception {
        OrderResponse orderResponse = orderService.createOrder(orderRequest,principal);
        return new ResponseEntity<>(orderResponse,HttpStatus.OK);
    }

    @PostMapping("/update-payment")
    public ResponseEntity<?> updatePaymentStatus(@RequestBody Map<String,String> request){
        String paymentIntentId = request.get("paymentIntentId");
        String status = request.get("status");
        Map<String,String> response = orderService.updateStatus(paymentIntentId, status);
        return new ResponseEntity<>(response,HttpStatus.OK);
    }


    @GetMapping("/vnpay-return")
    public void vnpayReturn(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Map<String, String[]> parameterMap = request.getParameterMap();
        Map<String, String> params = new HashMap<>();
        for (String key : parameterMap.keySet()) {
            params.put(key, parameterMap.get(key)[0]);
        }

        boolean valid = orderService.validateVnPayReturn(params);
        String orderId = null;
        String status = "fail";

        try {
            // Lấy orderId từ vnp_OrderInfo thay vì vnp_TxnRef
            String orderInfo = params.get("vnp_OrderInfo");
            
            if (orderInfo != null && orderInfo.startsWith("ORDER_ID_")) {
                orderId = orderInfo.replace("ORDER_ID_", "");
            } else {
                throw new IllegalArgumentException("vnp_OrderInfo không chứa orderId hợp lệ: " + orderInfo);
            }

            if (valid && "00".equals(params.get("vnp_ResponseCode"))) {
                orderService.updateOrderStatusVnpay(orderId, true);
                status = "success";
            } else {
                orderService.updateOrderStatusVnpay(orderId, false);
            }

            String redirectUrl = "http://localhost:5175/orderConfirmed?orderId=" + orderId + "&status=" + status;
            response.sendRedirect(redirectUrl);

        } catch (Exception e) {
            response.sendRedirect("http://localhost:5175/orderConfirmed?status=fail&error=" + e.getMessage());
        }
    }

    private String extractOrderId(String orderInfo) {
        if (orderInfo != null && orderInfo.startsWith("ORDER_ID=")) {
            return orderInfo.replace("ORDER_ID=", "");
        }
        throw new IllegalArgumentException("vnp_OrderInfo không chứa orderId hợp lệ");
    }


    @PostMapping("/cancel/{id}")
    public ResponseEntity<?> cancelOrder(@PathVariable UUID id, Principal principal){
        orderService.cancelOrder(id,principal);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/user")
    public ResponseEntity<List<OrderDetails>> getOrderByUser(Principal principal) {
        List<OrderDetails> orders = orderService.getOrdersByUser(principal.getName());
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

}










