package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.auth.service.EmailService;
import com.yuhecom.shopecom.dto.CartCheckoutValidation;
import com.yuhecom.shopecom.dto.CheckoutRequest;
import com.yuhecom.shopecom.dto.CouponDto;
import com.yuhecom.shopecom.entity.Address;
import com.yuhecom.shopecom.entity.Cart;
import com.yuhecom.shopecom.entity.CartItem;
import com.yuhecom.shopecom.entity.Coupon;
import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.OrderItem;
import com.yuhecom.shopecom.entity.OrderStatus;
import com.yuhecom.shopecom.entity.Payment;
import com.yuhecom.shopecom.entity.PaymentStatus;
import com.yuhecom.shopecom.entity.ProductVariant;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.repository.OrderRepository;
import com.yuhecom.shopecom.repository.ProductVariantRepository;
import com.yuhecom.shopecom.service.CartCheckoutService;
import com.yuhecom.shopecom.service.CartService;
import com.yuhecom.shopecom.service.CouponService;
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
 * Cart-based checkout use case implementation.
 *
 * <p>Single responsibility: orchestrate order creation from a cart with
 * stock validation, coupon handling, payment provider initiation, and
 * post-commit cart cleanup.
 *
 * <p>Cart cleanup only happens <i>after</i> stock deduction succeeds,
 * inside the same transaction. A rollback restores both stock and cart
 * (stock because the atomic UPDATE never committed, cart because the
 * delete was inside the same transaction).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CartCheckoutServiceImpl implements CartCheckoutService {

    private final OrderRepository orderRepository;
    private final UsersRepository userRepository;
    private final ProductVariantRepository productVariantRepository;
    private final CartService cartService;
    private final CouponService couponService;
    private final StripeService stripeService;
    private final VnPayService vnPayService;
    private final EmailService emailService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse checkout(CheckoutRequest request, String userEmail, String clientIp) throws Exception {
        User user = userRepository.findByEmailForProfile(userEmail)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND, "User not found"));

        Cart cart = cartService.getCartForCheckout(user, request.getCartId());

        CartCheckoutValidation validation = cartService.validateCartForCheckout(cart);
        boolean allItemsValid = validation.getItems().stream()
                .allMatch(item -> item.isInStock() && item.isActive());
        if (!allItemsValid) {
            throw new AppException(ErrorCode.CART_ITEM_UNAVAILABLE,
                    "Some items in your cart are no longer available or out of stock");
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        Coupon appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            CouponDto couponDto = couponService.validateAndCalculateDiscount(
                    request.getCouponCode(), validation.getTotalAmount());
            discountAmount = couponDto.getCalculatedDiscount();
            appliedCoupon = new Coupon();
            appliedCoupon.setId(couponDto.getId());
            appliedCoupon.setCode(couponDto.getCode());
            log.info("Coupon applied: code={}, discount={}", couponDto.getCode(), discountAmount);
        }

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

        for (CartItem cartItem : cart.getItems()) {
            ProductVariant variant = cartItem.getProductVariant();
            if (variant == null) {
                continue;
            }

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

            subtotalAmount = subtotalAmount.add(
                    cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        order.setOrderItemList(orderItems);

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

        if (appliedCoupon != null) {
            couponService.incrementUsage(appliedCoupon.getId());
        }

        cartService.clearCartAfterCheckout(cart.getId());

        log.info("Cart checkout: orderId={}, cartId={}, method={}, subtotal={}, discount={}, total={}",
                savedOrder.getId(), cart.getId(), request.getPaymentMethod(),
                subtotalAmount, discountAmount, finalTotal);

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
