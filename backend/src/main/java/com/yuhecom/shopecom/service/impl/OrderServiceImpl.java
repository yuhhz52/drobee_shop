package com.yuhecom.shopecom.service.impl;

import com.stripe.model.PaymentIntent;
import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
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
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UsersRepository userRepository;
    private final ProductService productService;
    private final StripeService stripeService;
    private final VnPayService vnPayService;
    private final ProductVariantMapper productVariantMapper;
    private final ProductMapper productMapper;
    private final OrderMapper orderMapper;
    private final UsersMapper usersMapper;
    private final AppProperties appProperties;
    private final HttpServletRequest httpServletRequest;

    @Override
    @Transactional
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
            ProductVariant variant = productService.fetchProductVariantByIdForUpdate(itemReq.getProductVariantId());

            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Product variant does not belong to product");
            }
            if (variant.getStockQuantity() == null || variant.getStockQuantity() < itemReq.getQuantity()) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK, "Product variant is out of stock");
            }
            variant.setStockQuantity(variant.getStockQuantity() - itemReq.getQuantity());

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
        log.info("Order created id={} method={}", savedOrder.getId(), request.getPaymentMethod());

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
            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new BusinessException(ErrorCode.PAYMENT_INTENT_INVALID, "PaymentIntent not succeeded");
            }

            String orderId = paymentIntent.getMetadata().get("orderId");
            if (orderId == null || orderId.isBlank()) {
                throw new BusinessException(ErrorCode.PAYMENT_INTENT_INVALID, "PaymentIntent missing orderId metadata");
            }

            Order order = orderRepository.findById(UUID.fromString(orderId))
                    .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found: " + orderId));

            Payment payment = order.getPayment();
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
            payment.setPaymentMethod(paymentIntent.getPaymentMethod());
            order.setOrderStatus(OrderStatus.IN_PROGRESS);
            orderRepository.save(order);

            log.info("Stripe payment confirmed orderId={}", orderId);
            Map<String, String> result = new HashMap<>();
            result.put("orderId", orderId);
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

    @Transactional
    public void updateOrderStatusVnpay(String orderId, boolean success) {
        orderRepository.findById(UUID.fromString(orderId)).ifPresent(order -> {
            Payment payment = order.getPayment();
            if (success) {
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                order.setOrderStatus(OrderStatus.IN_PROGRESS);
            } else {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                order.setOrderStatus(OrderStatus.CANCELLED);
            }
            orderRepository.save(order);
            log.info("VNPay order status updated orderId={} success={}", orderId, success);
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
    @Transactional
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

        if (order.getOrderItemList() != null) {
            for (OrderItem item : order.getOrderItemList()) {
                ProductVariant variant = item.getProductVariant();
                if (variant != null && variant.getStockQuantity() != null) {
                    variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity());
                }
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        return true;
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
