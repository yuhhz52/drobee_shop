package com.yuhecom.shopecom.service;

import com.stripe.model.PaymentIntent;
import com.yuhecom.shopecom.auth.dto.OrderResponse;
import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.dto.*;
import com.yuhecom.shopecom.entity.*;
import com.yuhecom.shopecom.exception.ResourceNotFoundEx;
import com.yuhecom.shopecom.mapper.OrderMapper;
import com.yuhecom.shopecom.mapper.ProductVariantMapper;
import com.yuhecom.shopecom.mapper.UsersMapper;
import com.yuhecom.shopecom.reponsitory.OrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {


    UserDetailsService userDetailsService;


    OrderRepository orderRepository;


    ProductService productService;


    StripeService stripeService;


    VnPayService vnPayService;

    ProductVariantMapper productVariantMapper;

    OrderMapper orderMapper;

    UsersMapper usersMapper;



    // Tao code don hang de hien thi ben ui
    private String generateDisplayCode() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest, Principal principal) throws Exception {
        User user = (User) userDetailsService.loadUserByUsername(principal.getName());
        Address address = user.getAddressList().stream()
                .filter(address1 -> orderRequest.getAddressId().equals(address1.getId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Address not found"));

        Order order = Order.builder()
                .user(user)
                .address(address)
                .totalAmount(orderRequest.getTotalAmount())
                .orderDate(orderRequest.getOrderDate())
                .discount(orderRequest.getDiscount())
                .expectedDeliveryDate(orderRequest.getExpectedDeliveryDate())
                .paymentMethod(orderRequest.getPaymentMethod())
                .orderStatus(OrderStatus.PENDING)
                .orderDisplayCode(generateDisplayCode())
                .build();

        List<OrderItem> orderItems = (orderRequest.getOrderItemRequest() == null || orderRequest.getOrderItemRequest().isEmpty())
            ? List.of()
            : orderRequest.getOrderItemRequest().stream()
                .map(orderItemRequest -> {
                    try {
                        Product product = productService.fetchProductById(orderItemRequest.getProductId());
                        ProductVariant productVariant = productService.fetchProductVariantById(
                                orderItemRequest.getProductVariantId());
                        return OrderItem.builder()
                                .product(product)
                                .productVariant(productVariant)
                                .quantity(orderItemRequest.getQuantity())
                                .order(order)
                                .build();
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to fetch product: " + e.getMessage(), e);
                    }
                }).toList();

        order.setOrderItemList(orderItems);
        
        Payment payment = new Payment();
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentDate(new Date());
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(order.getPaymentMethod());
        order.setPayment(payment);
        Order savedOrder = orderRepository.save(order);

        OrderResponse orderResponse = OrderResponse.builder()
                .paymentMethod(orderRequest.getPaymentMethod())
                .orderId(savedOrder.getId())
                .build();
        if(Objects.equals(orderRequest.getPaymentMethod(), "CARD")){
            orderResponse.setCredentials(stripeService.createPaymentIntent(order));
        } else if (Objects.equals(orderRequest.getPaymentMethod(), "VNPAY")) {
            Map<String, String> credentials = new HashMap<>();
            credentials.put("paymentUrl", vnPayService.createPaymentUrl(order));
            orderResponse.setCredentials(credentials);
        }

        return orderResponse;
    }

    public Map<String, String> updateStatus(String paymentIntentId, String status){
        try{
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            if (paymentIntent != null && paymentIntent.getStatus().equals("succeeded")) {
                String orderId = paymentIntent.getMetadata().get("orderId") ;
                Order order= orderRepository.findById(UUID.fromString(orderId)).orElseThrow(BadRequestException::new);
                Payment payment = order.getPayment();
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                payment.setPaymentMethod(paymentIntent.getPaymentMethod());
                order.setPaymentMethod(paymentIntent.getPaymentMethod());
                order.setOrderStatus(OrderStatus.IN_PROGRESS);
                order.setPayment(payment);
                Order savedOrder = orderRepository.save(order);
                Map<String,String> map = new HashMap<>();
                map.put("orderId", String.valueOf(savedOrder.getId()));
                return map;
            }
            else{
                throw new IllegalArgumentException("PaymentIntent not found or missing metadata");
            }
        }
        catch (Exception e){
            throw new IllegalArgumentException("PaymentIntent not found or missing metadata");
        }
    }

    public boolean validateVnPayReturn(Map<String, String> params) {
        return vnPayService.validateReturn(params);
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
        }
    }

    public List<OrderDetails> getOrdersByUser(String name) {
        User user = (User) userDetailsService.loadUserByUsername(name);
        List<Order> orders = orderRepository.findByUser(user);

        return orders.stream().map(order ->{
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
            ProductDto productDto = productService.getProductById(orderItem.getProduct().getId());
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
                .orElseThrow(() -> new ResourceNotFoundEx.OrderNotFoundException("Order not found with id " + id));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundEx.AccessDeniedException("Order does not belong to user");
        }

        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            return false;
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);


        return true;
    }

    @Transactional(readOnly = true)
    public Page<OrderDetails> getAllOrders(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(orderMapper::toDto);
    }

}














