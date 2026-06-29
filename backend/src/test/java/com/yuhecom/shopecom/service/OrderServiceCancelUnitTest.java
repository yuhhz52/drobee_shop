package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.auth.repository.UsersRepository;
import com.yuhecom.shopecom.auth.service.EmailService;
import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.OrderStatus;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.mapper.OrderMapper;
import com.yuhecom.shopecom.mapper.ProductMapper;
import com.yuhecom.shopecom.mapper.ProductVariantMapper;
import com.yuhecom.shopecom.mapper.UsersMapper;
import com.yuhecom.shopecom.repository.OrderRepository;
import com.yuhecom.shopecom.repository.ProductVariantRepository;
import com.yuhecom.shopecom.service.impl.OrderServiceImpl;
import com.yuhecom.shopecom.config.AppProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceCancelUnitTest {

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductService productService;

    @Mock
    private StripeService stripeService;

    @Mock
    private VnPayService vnPayService;

    @Mock
    private EmailService emailService;

    @Mock
    private ProductVariantMapper productVariantMapper;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private OrderMapper orderMapper;

    @Mock
    private UsersMapper usersMapper;

    @Mock
    private AppProperties appProperties;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private CartCheckoutService cartCheckoutService;

    @Mock
    private DirectCheckoutService directCheckoutService;

    @Mock
    private CouponService couponService;

    private OrderServiceImpl orderService;

    @BeforeEach
    public void setup() {
        orderService = new OrderServiceImpl(
                orderRepository,
                usersRepository,
                productService,
                stripeService,
                vnPayService,
                emailService,
                productVariantMapper,
                productMapper,
                orderMapper,
                usersMapper,
                appProperties,
                productVariantRepository,
                couponService,
                cartCheckoutService,
                directCheckoutService
        );
    }

    @Test
    public void cancelOrder_success() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "user@example.com";

        User user = User.builder().id(userId).email(email).build();
        Order order = Order.builder().id(id).user(user).orderStatus(OrderStatus.PENDING).build();

        when(usersRepository.findByEmailForAuth(email)).thenReturn(Optional.of(user));
        when(orderRepository.findById(id)).thenReturn(Optional.of(order));

        Principal p = () -> email;
        boolean result = orderService.cancelOrder(id, p);

        assertThat(result).isTrue();
        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getOrderStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    public void cancelOrder_forbiddenUser() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID otherUserId = UUID.randomUUID();

        User user = User.builder().id(userId).email("user@example.com").build();
        User otherUser = User.builder().id(otherUserId).email("other@example.com").build();
        Order order = Order.builder().id(id).user(otherUser).orderStatus(OrderStatus.PENDING).build();

        when(usersRepository.findByEmailForAuth(user.getEmail())).thenReturn(Optional.of(user));
        when(orderRepository.findById(id)).thenReturn(Optional.of(order));

        Principal p = () -> user.getEmail();

        assertThrows(AppException.class, () -> orderService.cancelOrder(id, p));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void cancelOrder_alreadyCancelled() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "user@example.com";

        User user = User.builder().id(userId).email(email).build();
        Order order = Order.builder().id(id).user(user).orderStatus(OrderStatus.CANCELLED).build();

        when(usersRepository.findByEmailForAuth(email)).thenReturn(Optional.of(user));
        when(orderRepository.findById(id)).thenReturn(Optional.of(order));

        Principal p = () -> email;
        boolean result = orderService.cancelOrder(id, p);

        assertThat(result).isFalse();
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void cancelOrder_notFound() {
        UUID id = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        String email = "user@example.com";

        User user = User.builder().id(userId).email(email).build();

        when(usersRepository.findByEmailForAuth(email)).thenReturn(Optional.of(user));
        when(orderRepository.findById(id)).thenReturn(Optional.empty());

        Principal p = () -> email;

        assertThrows(BusinessException.class, () -> orderService.cancelOrder(id, p));
        verify(orderRepository, never()).save(any(Order.class));
    }
}
