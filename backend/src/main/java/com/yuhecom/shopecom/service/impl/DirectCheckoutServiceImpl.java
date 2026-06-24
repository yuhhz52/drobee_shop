package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.auth.service.EmailService;
import com.yuhecom.shopecom.dto.DirectCheckoutRequest;
import com.yuhecom.shopecom.entity.Address;
import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.OrderItem;
import com.yuhecom.shopecom.entity.OrderStatus;
import com.yuhecom.shopecom.entity.Payment;
import com.yuhecom.shopecom.entity.PaymentStatus;
import com.yuhecom.shopecom.entity.Product;
import com.yuhecom.shopecom.entity.ProductVariant;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.repository.OrderRepository;
import com.yuhecom.shopecom.repository.ProductVariantRepository;
import com.yuhecom.shopecom.service.DirectCheckoutService;
import com.yuhecom.shopecom.service.ProductService;
import com.yuhecom.shopecom.service.StripeService;
import com.yuhecom.shopecom.service.VnPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Buy Now / direct checkout use case implementation.
 *
 * <p>Single responsibility: orchestrate order creation directly from
 * caller-supplied items — no cart read, no cart write, no cart merge.
 *
 * <p>Flow:
 * <ol>
 *   <li>Validate user + address.</li>
 *   <li>Validate product + variant per item.</li>
 *   <li>Validate quantity > 0.</li>
 *   <li>Validate stock availability.</li>
 *   <li>Atomically deduct stock.</li>
 *   <li>Persist Order, OrderItems, Payment.</li>
 *   <li>Initiate payment provider side-effects (Stripe / VNPay).</li>
 * </ol>
 *
 * <p><b>Hard rule:</b> Cart service is NEVER injected here. This is a
 * non-negotiable invariant — Buy Now must leave the cart exactly as
 * the user left it.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DirectCheckoutServiceImpl implements DirectCheckoutService {

    private final OrderRepository orderRepository;
    private final UsersRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductService productService;
    private final StripeService stripeService;
    private final VnPayService vnPayService;
    private final EmailService emailService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse checkout(DirectCheckoutRequest request, String userEmail, String clientIp) throws Exception {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new AppException(ErrorCode.BUY_NOW_PAYLOAD_INVALID,
                    "Buy Now checkout requires at least one item");
        }
        for (DirectCheckoutRequest.DirectOrderItem item : request.getItems()) {
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new AppException(ErrorCode.CHECKOUT_QUANTITY_INVALID,
                        "Quantity must be greater than zero");
            }
        }

        User user = userRepository.findByEmailForProfile(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

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
                .discount(BigDecimal.ZERO)
                .paymentMethod(request.getPaymentMethod())
                .orderStatus(OrderStatus.PENDING)
                .orderDisplayCode(generateDisplayCode())
                .build();

        for (DirectCheckoutRequest.DirectOrderItem itemReq : request.getItems()) {
            Product product = productService.fetchProductById(itemReq.getProductId());

            ProductVariant variant = productVariantRepository.findWithLockingById(itemReq.getProductVariantId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.PRODUCT_VARIANT_NOT_FOUND,
                            "Variant not found: " + itemReq.getProductVariantId()));

            if (!variant.getProduct().getId().equals(product.getId())) {
                throw new BusinessException(ErrorCode.BAD_REQUEST,
                        "Product variant does not belong to product");
            }

            int rowsAffected = productVariantRepository.deductStock(variant.getId(), itemReq.getQuantity());
            if (rowsAffected == 0) {
                throw new AppException(ErrorCode.OUT_OF_STOCK,
                        "Insufficient stock for variant: " + variant.getVariantName());
            }

            BigDecimal itemPrice = product.getPrice();
            if (variant.getAdditionalPrice() != null) {
                itemPrice = itemPrice.add(variant.getAdditionalPrice());
            }

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .productVariant(variant)
                    .quantity(itemReq.getQuantity())
                    .itemPrice(itemPrice)
                    .order(order)
                    .build());

            subtotalAmount = subtotalAmount.add(
                    itemPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        order.setOrderItemList(orderItems);
        order.setTotalAmount(subtotalAmount);

        Payment payment = new Payment();
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setOrder(order);
        payment.setAmount(subtotalAmount);
        payment.setPaymentMethod(request.getPaymentMethod());
        order.setPayment(payment);

        Order savedOrder = orderRepository.save(order);

        log.info("Direct checkout: orderId={}, method={}, total={}, items={}",
                savedOrder.getId(), request.getPaymentMethod(), subtotalAmount, orderItems.size());

        try {
            if (user != null) {
                emailService.sendOrderConfirmation(user, savedOrder);
            }
        } catch (Exception e) {
            log.warn("Failed to dispatch order confirmation email for orderId={}", savedOrder.getId(), e);
        }

        return buildPaymentResponse(savedOrder, request.getPaymentMethod(), clientIp);
    }

    private OrderResponse buildPaymentResponse(Order order, String paymentMethod, String clientIp) throws Exception {
        OrderResponse response = OrderResponse.builder()
                .paymentMethod(paymentMethod)
                .orderId(order.getId())
                .build();

        if ("CARD".equals(paymentMethod)) {
            response.setCredentials(stripeService.createPaymentIntent(order));
        } else if ("VNPAY".equals(paymentMethod)) {
            Map<String, String> credentials = new HashMap<>();
            credentials.put("paymentUrl", vnPayService.createPaymentUrl(order, clientIp));
            response.setCredentials(credentials);
        }
        return response;
    }

    private String generateDisplayCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
