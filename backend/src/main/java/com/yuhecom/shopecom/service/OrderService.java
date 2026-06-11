package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.dto.OrderDetails;
import com.yuhecom.shopecom.dto.OrderRequest;
import com.yuhecom.shopecom.dto.PagingResult;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request, Principal principal, HttpServletRequest httpRequest) throws Exception;

    Map<String, String> updateStatus(String paymentIntentId, String status);

    boolean validateVnPayReturn(Map<String, String> params);

    String buildVnPayRedirectUrl(Map<String, String> params);

    List<OrderDetails> getOrdersByUser(String name);

    boolean cancelOrder(UUID id, Principal principal);

    PagingResult<OrderDetails> getOrdersPage(Pageable pageable);

    Page<OrderDetails> getAllOrders(Pageable pageable);
}
