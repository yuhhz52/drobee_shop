package com.yuhecom.shopecom.service;

import com.stripe.model.PaymentIntent;
import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.auth.entity.User;
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
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.Principal;
import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OrderService {


    UserDetailsService userDetailsService;


    OrderRepository orderRepository;


    ProductService productService;


    StripeService stripeService;


    VnPayService vnPayService;

    ProductVariantMapper productVariantMapper;

    ProductMapper productMapper;

    OrderMapper orderMapper;

    UsersMapper usersMapper;

    AppProperties appProperties;

    HttpServletRequest httpServletRequest;



    // Tao code don hang de hien thi ben ui
    private String generateDisplayCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, Principal principal, HttpServletRequest request) throws Exception {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        Address address = user.getAddressList().stream()
                .filter(address1 -> orderRequest.getAddressId().equals(address1.getId()))
                .findFirst()
                .orElseThrow(() -> new BusinessException(ErrorCode.ADDRESS_NOT_FOUND, "Address not found"));

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        Order order = Order.builder()
                .user(user)
                .address(address)
                .totalAmount(BigDecimal.ZERO)
                .orderDate(new Date())
                .discount(BigDecimal.ZERO)
                .paymentMethod(orderRequest.getPaymentMethod())
                .orderStatus(OrderStatus.PENDING)
                .orderDisplayCode(generateDisplayCode())
                .build();

        for (OrderItemRequest orderItemRequest : orderRequest.getOrderItemRequest()) {
            Product product = productService.fetchProductById(orderItemRequest.getProductId());
            ProductVariant productVariant = productService.fetchProductVariantByIdForUpdate(orderItemRequest.getProductVariantId());

            if (!productVariant.getProduct().getId().equals(product.getId())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST, "Product variant does not belong to product");
            }
            if (productVariant.getStockQuantity() == null || productVariant.getStockQuantity() < orderItemRequest.getQuantity()) {
                throw new BusinessException(ErrorCode.OUT_OF_STOCK, "Product variant is out of stock");
            }
            productVariant.setStockQuantity(productVariant.getStockQuantity() - orderItemRequest.getQuantity());

            BigDecimal unitPrice = product.getSalePrice() != null ? product.getSalePrice() : product.getPrice();
            BigDecimal additionalPrice = productVariant.getAdditionalPrice() == null ? BigDecimal.ZERO : productVariant.getAdditionalPrice();
            BigDecimal itemPrice = unitPrice.add(additionalPrice);
            totalAmount = totalAmount.add(itemPrice.multiply(BigDecimal.valueOf(orderItemRequest.getQuantity())));

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .productVariant(productVariant)
                    .quantity(orderItemRequest.getQuantity())
                    .itemPrice(itemPrice)
                    .order(order)
                    .build());
        }

        order.setOrderItemList(orderItems);
        order.setTotalAmount(totalAmount);
        
        Payment payment = new Payment();
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(new Date());
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(order.getPaymentMethod());
        order.setPayment(payment);
        Order savedOrder = orderRepository.save(order);
        log.info("Order created id={} paymentMethod={}", savedOrder.getId(), orderRequest.getPaymentMethod());

        OrderResponse orderResponse = OrderResponse.builder()
                .paymentMethod(orderRequest.getPaymentMethod())
                .orderId(savedOrder.getId())
                .build();
        if(Objects.equals(orderRequest.getPaymentMethod(), "CARD")){
            orderResponse.setCredentials(stripeService.createPaymentIntent(order));
        } else if (Objects.equals(orderRequest.getPaymentMethod(), "VNPAY")) {
            Map<String, String> credentials = new HashMap<>();
            String clientIp = getClientIp();
            credentials.put("paymentUrl", vnPayService.createPaymentUrl(order, clientIp));
            orderResponse.setCredentials(credentials);
        }

        return orderResponse;
    }

    @Transactional(rollbackFor = Exception.class)
    public Map<String, String> updateStatus(String paymentIntentId, String status){
        try{
            log.info("Stripe update status request paymentIntentId={} status={}", paymentIntentId, status);
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            if (paymentIntent != null && "succeeded".equals(paymentIntent.getStatus())) {
                String orderId = paymentIntent.getMetadata().get("orderId");
                if (orderId == null || orderId.isBlank()) {
                    throw new BusinessException(ErrorCode.PAYMENT_INTENT_INVALID, "PaymentIntent missing orderId metadata");
                }
                Order order = orderRepository.findById(UUID.fromString(orderId))
                        .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found with id " + orderId));
                Payment payment = order.getPayment();
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                payment.setPaymentMethod(paymentIntent.getPaymentMethod());
                order.setPaymentMethod(paymentIntent.getPaymentMethod());
                order.setOrderStatus(OrderStatus.IN_PROGRESS);
                order.setPayment(payment);
                Order savedOrder = orderRepository.save(order);
                Map<String,String> map = new HashMap<>();
                map.put("orderId", String.valueOf(savedOrder.getId()));
                map.put("amount", String.valueOf(savedOrder.getTotalAmount()));
                log.info("Stripe payment confirmed orderId={}", savedOrder.getId());
                return map;
            }
            log.warn("Stripe payment not confirmed paymentIntentId={} status={}", paymentIntentId, paymentIntent == null ? "null" : paymentIntent.getStatus());
            throw new BusinessException(ErrorCode.PAYMENT_INTENT_INVALID, "PaymentIntent not found or invalid status");
        }
        catch (BusinessException e){
            throw e;
        }
        catch (Exception e){
            log.error("Stripe update status failed paymentIntentId={}", paymentIntentId, e);
            throw new BusinessException(ErrorCode.PAYMENT_INTENT_INVALID, "PaymentIntent not found or missing metadata");
        }
    }

    public boolean validateVnPayReturn(Map<String, String> params) {
        return vnPayService.validateReturn(params);
    }

    public String buildVnPayRedirectUrl(Map<String, String> params) {
        boolean valid = validateVnPayReturn(params);
        String status = "fail";
        String orderId;

        try {
            String orderInfo = params.get("vnp_OrderInfo");
            orderId = extractOrderIdFromVnpOrderInfo(orderInfo);
            log.info("VNPay return received valid={} responseCode={} orderId={}", valid, params.get("vnp_ResponseCode"), orderId);

            if (valid && "00".equals(params.get("vnp_ResponseCode"))) {
                updateOrderStatusVnpay(orderId, true);
                status = "success";
            } else {
                updateOrderStatusVnpay(orderId, false);
            }

            return buildRedirectUrl(orderId, status, null);
        } catch (Exception e) {
            log.error("VNPay return handling failed", e);
            return buildRedirectUrl(null, "fail", e.getMessage());
        }
    }

    private String buildRedirectUrl(String orderId, String status, String error) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(appProperties.getOrderConfirmedUrl())
                .queryParam("status", status);
        if (orderId != null && !orderId.isBlank()) {
            builder.queryParam("orderId", orderId);
        }
        if (error != null && !error.isBlank()) {
            builder.queryParam("error", error);
        }
        return builder.build(true).toUriString();
    }

    private String extractOrderIdFromVnpOrderInfo(String orderInfo) {
        if (orderInfo != null && orderInfo.startsWith("ORDER_ID_")) {
            return orderInfo.replace("ORDER_ID_", "");
        }
        throw new BusinessException(ErrorCode.ORDER_INFO_INVALID,
                "vnp_OrderInfo không chứa orderId hợp lệ: " + orderInfo);
    }

    @Transactional
    public void updateOrderStatusVnpay(String orderId, boolean success) {
        Optional<Order> optionalOrder = orderRepository.findById(UUID.fromString(orderId));
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
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
        } else {
            log.warn("VNPay order not found orderId={}", orderId);
        }
    }

    public List<OrderDetails> getOrdersByUser(String name) {
        User user = (User) userDetailsService.loadUserByUsername(name);
        List<Order> orders = orderRepository.findByUserWithItems(user);

        return orders.stream().map(order -> {
            return OrderDetails.builder()
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
                    .build();
        }).toList();
    }


    private List<OrderItemDetail> getItemDetails(List<OrderItem> orderItemList) {
        return orderItemList.stream().map(orderItem -> {
            ProductDto productDto = productMapper.toDto(orderItem.getProduct());
            ProductVariantDto productVariantDto = productVariantMapper.toDto(orderItem.getProductVariant());

            return OrderItemDetail.builder()
                    .id(orderItem.getId())
                    .itemPrice(orderItem.getItemPrice())
                    .product(productDto)
                    .productVariant(productVariantDto)
                    .quantity(orderItem.getQuantity())
                    .build();
        }).toList();
    }


    @Transactional
    public boolean cancelOrder(UUID id, Principal principal) {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found with id " + id));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Order does not belong to user");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return false;
        }

        // Restore stock for each order item before cancelling
        if (order.getOrderItemList() != null) {
            for (OrderItem orderItem : order.getOrderItemList()) {
                ProductVariant variant = orderItem.getProductVariant();
                if (variant != null && variant.getStockQuantity() != null) {
                    variant.setStockQuantity(variant.getStockQuantity() + orderItem.getQuantity());
                }
            }
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        return true;
    }

    @Transactional(readOnly = true)
    public PagingResult<OrderDetails> getOrdersPage(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        List<OrderDetails> items = orders.map(orderMapper::toDto).getContent();
        String contentRange = buildContentRange(pageable, items.size(), orders.getTotalElements());
        return new PagingResult<>(items, contentRange);
    }

    private String buildContentRange(Pageable pageable, int itemCount, long totalElements) {
        int start = pageable.getPageNumber() * pageable.getPageSize();
        int end = totalElements == 0 ? 0 : Math.min(start + itemCount - 1, (int) totalElements - 1);
        return String.format("orders %d-%d/%d", start, end, totalElements);
    }

    @Transactional(readOnly = true)
    public Page<OrderDetails> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(orderMapper::toDto);
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
