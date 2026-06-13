package com.yuhecom.shopecom.service.impl;

import com.stripe.model.PaymentIntent;
import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.auth.service.EmailService;
import com.yuhecom.shopecom.config.AppProperties;
import com.yuhecom.shopecom.dto.*;
import com.yuhecom.shopecom.entity.*;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.mapper.OrderMapper;
import com.yuhecom.shopecom.mapper.ProductMapper;
import com.yuhecom.shopecom.mapper.ProductVariantMapper;
import com.yuhecom.shopecom.mapper.UsersMapper;
import com.yuhecom.shopecom.reponsitory.OrderRepository;
import com.yuhecom.shopecom.service.CartService;
import com.yuhecom.shopecom.service.CouponService;
import com.yuhecom.shopecom.service.OrderService;
import com.yuhecom.shopecom.service.ProductService;
import com.yuhecom.shopecom.service.StripeService;
import com.yuhecom.shopecom.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UsersRepository userRepository;
    private final ProductService productService;
    private final StripeService stripeService;
    private final VnPayService vnPayService;
    private final EmailService emailService;
    private final ProductVariantMapper productVariantMapper;
    private final ProductMapper productMapper;
    private final OrderMapper orderMapper;
    private final UsersMapper usersMapper;
    private final AppProperties appProperties;
    private final HttpServletRequest httpServletRequest;
    private final com.yuhecom.shopecom.reponsitory.ProductVariantRepository productVariantRepository;
    private final CartService cartService;
    private final CouponService couponService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse createOrder(OrderRequest request, Principal principal, HttpServletRequest httpRequest) throws Exception {
        User user = userRepository.findByEmailForProfile(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Address address = user.getAddressList().stream()
                .filter(a -> request.getAddressId().equals(a.getId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND, "Address not found"));

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .user(user)
                .address(address)
                .totalAmount(BigDecimal.ZERO)
                .orderDate(LocalDateTime.now())
                .discount(BigDecimal.ZERO)
                .paymentMethod(request.getPaymentMethod())
                .orderStatus(OrderStatus.PENDING)
                .orderDisplayCode(generateDisplayCode())
                .build();

        for (OrderItemRequest itemReq : request.getOrderItemRequest()) {
            Product product = productService.fetchProductById(itemReq.getProductId());
            ProductVariant variant = productVariantRepository.findWithLockingById(itemReq.getProductVariantId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND, 
                            "Variant not found: " + itemReq.getProductVariantId()));

            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Product variant does not belong to product");
            }

            // ATOMIC STOCK DEDUCTION - prevents race conditions
            int rowsAffected = productVariantRepository.deductStock(variant.getId(), itemReq.getQuantity());
            if (rowsAffected == 0) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK, 
                        "Insufficient stock for variant: " + variant.getVariantName());
            }

            // Re-fetch variant to get updated state for price calculation
            variant = productVariantRepository.findById(itemReq.getProductVariantId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND, 
                            "Variant not found after stock deduction: " + itemReq.getProductVariantId()));

            BigDecimal unitPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            BigDecimal additionalPrice = variant.getAdditionalPrice() == null ? BigDecimal.ZERO : variant.getAdditionalPrice();
            BigDecimal itemPrice = unitPrice.add(additionalPrice);
            totalAmount = totalAmount.add(itemPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .productVariant(variant)
                    .quantity(itemReq.getQuantity())
                    .itemPrice(itemPrice)
                    .order(order)
                    .build());
        }

        order.setOrderItemList(orderItems);
        order.setTotalAmount(totalAmount);

        Payment payment = new Payment();
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setOrder(order);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(request.getPaymentMethod());
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);
        log.info("Order created id={} method={} totalAmount={}", 
                savedOrder.getId(), request.getPaymentMethod(), totalAmount);

        // Send order confirmation email (async, fire-and-forget)
        try {
            if (user != null) {
                emailService.sendOrderConfirmation(user, savedOrder);
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch order confirmation email for orderId={}", savedOrder.getId(), e);
        }

        OrderResponse response = OrderResponse.builder()
                .paymentMethod(request.getPaymentMethod())
                .orderId(savedOrder.getId())
                .build();

        if ("CARD".equals(request.getPaymentMethod())) {
            response.setCredentials(stripeService.createPaymentIntent(order));
        } else if ("VNPAY".equals(request.getPaymentMethod())) {
            Map<String, String> credentials = new HashMap<>();
            credentials.put("paymentUrl", vnPayService.createPaymentUrl(order, getClientIp()));
            response.setCredentials(credentials);
        }

        return response;
    }

    /**
     * Checkout from cart - validates and uses cart items for order creation.
     * This is the preferred checkout method as it ensures proper stock validation.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse checkoutFromCart(CheckoutRequest request, Principal principal, HttpServletRequest httpRequest) throws Exception {
        User user = userRepository.findByEmailForProfile(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        // Get cart with pessimistic lock
        Cart cart = cartService.getCartForCheckout(user, request.getCartId());

        // Validate cart before proceeding
        CartCheckoutValidation validation = cartService.validateCartForCheckout(cart);

        // Check if all items are valid
        boolean allItemsValid = validation.getItems().stream()
                .allMatch(item -> item.isInStock() && item.isActive());

        if (!allItemsValid) {
            throw new AppException(ErrorCode.CART_ITEM_UNAVAILABLE,
                    "Some items in your cart are no longer available or out of stock");
        }

        // Validate and calculate coupon discount
        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponDto couponDto = couponService.validateAndCalculateDiscount(
                    request.getCouponCode(), validation.getTotalAmount());
            discountAmount = couponDto.getCalculatedDiscount();
            
            // Load full coupon entity for storage
            appliedCoupon = new Coupon();
            appliedCoupon.setId(couponDto.getId());
            appliedCoupon.setCode(couponDto.getCode());
            log.info("Coupon applied: code={}, discount={}", couponDto.getCode(), discountAmount);
        }

        // Get address
        Address address = user.getAddressList().stream()
                .filter(a -> request.getAddressId().equals(a.getId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND, "Address not found"));

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .user(user)
                .address(address)
                .totalAmount(BigDecimal.ZERO)
                .orderDate(LocalDateTime.now())
                .discount(discountAmount)
                .coupon(appliedCoupon)
                .paymentMethod(request.getPaymentMethod())
                .orderStatus(OrderStatus.PENDING)
                .orderDisplayCode(generateDisplayCode())
                .build();

        // Process each cart item with atomic stock deduction
        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getProductVariant();
            if (variant == null) {
                continue;
            }

            // Atomic stock deduction with pessimistic lock
            int rowsAffected = productVariantRepository.deductStock(variant.getId(), cartItem.getQuantity());
            if (rowsAffected == 0) {
                throw new AppException(ErrorCode.OUT_OF_STOCK,
                        String.format("Insufficient stock for %s", cartItem.getProductSnapshotName()));
            }

            orderItems.add(OrderItem.builder()
                    .product(cartItem.getProduct())
                    .productVariant(variant)
                    .quantity(cartItem.getQuantity())
                    .itemPrice(cartItem.getUnitPrice())
                    .order(order)
                    .build());

            subtotalAmount = subtotalAmount.add(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setOrderItemList(orderItems);
        
        // Calculate final total: subtotal - discount
        BigDecimal finalTotal = subtotalAmount.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }
        order.setTotalAmount(finalTotal);

        Payment payment = new Payment();
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setOrder(order);
        payment.setAmount(finalTotal);
        payment.setPaymentMethod(request.getPaymentMethod());
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        // Increment coupon usage after successful order
        if (appliedCoupon != null) {
            couponService.incrementUsage(appliedCoupon.getId());
        }

        // Clear cart after successful order creation
        cartService.clearCartAfterCheckout(cart.getId());

        log.info("Order created from cart: orderId={}, cartId={}, method={}, subtotal={}, discount={}, total={}",
                savedOrder.getId(), cart.getId(), request.getPaymentMethod(), subtotalAmount, discountAmount, finalTotal);

        // Send order confirmation email (async, fire-and-forget)
        try {
            if (user != null) {
                emailService.sendOrderConfirmation(user, savedOrder);
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch order confirmation email for orderId={}", savedOrder.getId(), e);
        }

        OrderResponse response = OrderResponse.builder()
                .paymentMethod(request.getPaymentMethod())
                .orderId(savedOrder.getId())
                .build();

        if ("CARD".equals(request.getPaymentMethod())) {
            response.setCredentials(stripeService.createPaymentIntent(order));
        } else if ("VNPAY".equals(request.getPaymentMethod())) {
            Map<String, String> credentials = new HashMap<>();
            credentials.put("paymentUrl", vnPayService.createPaymentUrl(order, getClientIp()));
            response.setCredentials(credentials);
        }

        return response;
    }

    @Override
    @Transactional
    public Map<String, String> updateStatus(String paymentIntentId, String status) {
        log.info("Stripe update status paymentIntentId={} status={}", paymentIntentId, status);
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            String stripeStatus = paymentIntent.getStatus();
            String orderId = paymentIntent.getMetadata().get("orderId");

            if (orderId == null || orderId.isBlank()) {
                throw new BusinessException(ErrorCode.PAYMENT_INTENT_INVALID, "PaymentIntent missing orderId metadata");
            }

            Order order = orderRepository.findById(UUID.fromString(orderId))
                    .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found: " + orderId));

            Payment payment = order.getPayment();
            payment.setPaymentMethod(paymentIntent.getPaymentMethod());

            if ("succeeded".equals(stripeStatus)) {
                // Payment successful
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                order.setOrderStatus(OrderStatus.IN_PROGRESS);
                orderRepository.save(order);
                log.info("Stripe payment confirmed orderId={}", orderId);
                if (order.getUser() != null) {
                    emailService.sendPaymentSuccess(order.getUser(), order);
                }
            } else if ("canceled".equals(stripeStatus) || "failed".equals(stripeStatus)) {
                // Payment failed - restore stock
                payment.setPaymentStatus(PaymentStatus.FAILED);
                order.setOrderStatus(OrderStatus.CANCELLED);
                restoreOrderStock(order.getId());
                orderRepository.save(order);
                log.info("Stripe payment failed, stock restored orderId={}", orderId);
                if (order.getUser() != null) {
                    emailService.sendPaymentFailure(order.getUser(), order, stripeStatus);
                }
            } else {
                // Other status - don't change order status yet
                log.info("Stripe payment status: {} for orderId={}", stripeStatus, orderId);
            }

            Map<String, String> result = new HashMap<>();
            result.put("orderId", orderId);
            result.put("paymentStatus", stripeStatus);
            result.put("amount", String.valueOf(order.getTotalAmount()));
            return result;

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Stripe update status failed paymentIntentId={}", paymentIntentId, e);
            throw new BusinessException(ErrorCode.PAYMENT_INTENT_INVALID, "PaymentIntent not found or missing metadata");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateVnPayReturn(Map<String, String> params) {
        return vnPayService.validateReturn(params);
    }

    @Override
    public String buildVnPayRedirectUrl(Map<String, String> params) {
        boolean valid = validateVnPayReturn(params);
        String status;
        String orderId;

        try {
            String orderInfo = params.get("vnp_OrderInfo");
            orderId = extractOrderId(orderInfo);

            // Verify amount on return to prevent tampering
            Order order = orderRepository.findById(UUID.fromString(orderId))
                    .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found: " + orderId));

            boolean amountValid = vnPayService.verifyReturnAmount(params, order);
            if (!amountValid) {
                log.warn("VNPay return amount mismatch for orderId={} — possible tampering", orderId);
                updateOrderStatusVnpay(orderId, false);
                return buildRedirectUrl(orderId, "fail", "Amount mismatch");
            }

            log.info("VNPay return valid={} responseCode={} orderId={}",
                    valid, params.get("vnp_ResponseCode"), orderId);

            boolean success = valid && "00".equals(params.get("vnp_ResponseCode"));
            updateOrderStatusVnpay(orderId, success);
            status = success ? "success" : "fail";

            return buildRedirectUrl(orderId, status, null);
        } catch (Exception e) {
            log.error("VNPay return handling failed", e);
            return buildRedirectUrl(null, "fail", e.getMessage());
        }
    }

    private String buildRedirectUrl(String orderId, String status, String error) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(appProperties.getOrderConfirmedUrl())
                .queryParam("status", status);
        if (orderId != null && !orderId.isBlank()) {
            builder.queryParam("orderId", orderId);
        }
        if (error != null && !error.isBlank()) {
            builder.queryParam("error", error);
        }
        return builder.build(true).toUriString();
    }

    private String extractOrderId(String orderInfo) {
        if (orderInfo != null && orderInfo.startsWith("ORDER_ID_")) {
            return orderInfo.replace("ORDER_ID_", "");
        }
        throw new BusinessException(ErrorCode.ORDER_INFO_INVALID,
                "vnp_OrderInfo does not contain valid orderId: " + orderInfo);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateOrderStatusVnpay(String orderId, boolean success) {
        orderRepository.findById(UUID.fromString(orderId)).ifPresent(order -> {
            Payment payment = order.getPayment();
            if (success) {
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                order.setOrderStatus(OrderStatus.IN_PROGRESS);
            } else {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                order.setOrderStatus(OrderStatus.CANCELLED);
                // Restore stock on payment failure
                restoreOrderStock(order.getId());
            }
            orderRepository.save(order);
            log.info("VNPay order status updated orderId={} success={}", orderId, success);

            // Fire-and-forget email notification
            try {
                User user = order.getUser();
                if (user != null) {
                    if (success) {
                        emailService.sendOrderConfirmation(user, order);
                    } else {
                        emailService.sendPaymentFailure(user, order, "VNPay payment failed");
                    }
                }
            } catch (Exception e) {
                log.warn("Email notification dispatch failed for orderId={}", orderId, e);
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDetails> getOrdersByUser(String name) {
        User user = userRepository.findByEmailForProfile(name)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        List<Order> orders = orderRepository.findByUserWithItems(user);

        return orders.stream().map(order -> OrderDetails.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .orderStatus(order.getOrderStatus())
                .shipmentNumber(order.getShipmentTrackingNumber())
                .address(order.getAddress())
                .totalAmount(order.getTotalAmount())
                .orderItemList(getItemDetails(order.getOrderItemList()))
                .expectedDeliveryDate(order.getExpectedDeliveryDate())
                .paymentMethod(order.getPaymentMethod())
                .orderDisplayCode(order.getOrderDisplayCode())
                .user(usersMapper.toDto(order.getUser()))
                .build()).toList();
    }

    private List<OrderItemDetail> getItemDetails(List<OrderItem> orderItems) {
        return orderItems.stream().map(item -> OrderItemDetail.builder()
                .id(item.getId())
                .itemPrice(item.getItemPrice())
                .product(productMapper.toDto(item.getProduct()))
                .productVariant(productVariantMapper.toDto(item.getProductVariant()))
                .quantity(item.getQuantity())
                .build()).toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelOrder(UUID id, Principal principal) {
        User user = userRepository.findByEmailForAuth(principal.getName())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found: " + id));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Order does not belong to user");
        }
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return false;
        }

        // ATOMIC STOCK RESTORE - prevents race conditions
        if (order.getOrderItemList() != null) {
            for (OrderItem item : order.getOrderItemList()) {
                ProductVariant variant = item.getProductVariant();
                if (variant != null) {
                    productVariantRepository.restoreStock(variant.getId(), item.getQuantity());
                    log.info("Restored stock for variant {}: +{} units", variant.getId(), item.getQuantity());
                }
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.info("Order cancelled id={}", id);

        // Notify user about cancellation (async, fire-and-forget)
        if (order.getUser() != null) {
            emailService.sendPaymentFailure(order.getUser(), order, "Order cancelled by user");
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void restoreOrderStock(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found: " + orderId));

        if (order.getOrderItemList() != null) {
            for (OrderItem item : order.getOrderItemList()) {
                ProductVariant variant = item.getProductVariant();
                if (variant != null) {
                    productVariantRepository.restoreStock(variant.getId(), item.getQuantity());
                    log.info("Restored stock for order {} variant {}: +{} units",
                            orderId, variant.getId(), item.getQuantity());
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagingResult<OrderDetails> getOrdersPage(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        List<OrderDetails> items = orders.map(orderMapper::toDto).getContent();
        return new PagingResult<>(items, buildContentRange(pageable, items.size(), orders.getTotalElements()));
    }

    private String buildContentRange(Pageable pageable, int itemCount, long totalElements) {
        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = totalElements == 0 ? 0 : Math.min(start + itemCount - 1, (int) totalElements - 1);
        return String.format("orders %d-%d/%d", start, end, totalElements);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderDetails> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable).map(orderMapper::toDto);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private String generateDisplayCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String getClientIp() {
        String xForwardedFor = httpServletRequest.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = httpServletRequest.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return httpServletRequest.getRemoteAddr();
    }
}
