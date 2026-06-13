package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.dto.CheckoutRequest;
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

    /**
     * Create order from direct OrderRequest (legacy/bypass cart).
     * Items are submitted directly without going through cart.
     */
    OrderResponse createOrder(OrderRequest request, Principal principal, HttpServletRequest httpRequest) throws Exception;

    /**
     * Create order from cart - uses cart items for order creation.
     * Validates stock and deducts inventory during checkout.
     */
    OrderResponse checkoutFromCart(CheckoutRequest request, Principal principal, HttpServletRequest httpRequest) throws Exception;

    Map<String, String> updateStatus(String paymentIntentId, String status);

    boolean validateVnPayReturn(Map<String, String> params);

    String buildVnPayRedirectUrl(Map<String, String> params);

    void updateOrderStatusVnpay(String orderId, boolean success);

    List<OrderDetails> getOrdersByUser(String name);

    boolean cancelOrder(UUID id, Principal principal);

    PagingResult<OrderDetails> getOrdersPage(Pageable pageable);

    Page<OrderDetails> getAllOrders(Pageable pageable);

    /**
     * Restore stock for an order - used when payment fails or order is cancelled.
     */
    void restoreOrderStock(UUID orderId);
}
