package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.auth.entity.User;
import com.yuhecom.shopecom.entity.Order;
import com.yuhecom.shopecom.entity.OrderStatus;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.reponsitory.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.core.userdetails.UserDetailsService;

import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceCancelUnitTest {

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private OrderRepository orderRepository;

    // other dependencies (not used in cancel) mocked
    @Mock
    private com.yuhecom.shopecom.service.ProductService productService;
    @Mock
    private com.yuhecom.shopecom.service.StripeService stripeService;
    @Mock
    private com.yuhecom.shopecom.service.VnPayService vnPayService;
    @Mock
    private com.yuhecom.shopecom.mapper.ProductVariantMapper productVariantMapper;
    @Mock
    private com.yuhecom.shopecom.mapper.ProductMapper productMapper;
    @Mock
    private com.yuhecom.shopecom.mapper.OrderMapper orderMapper;
    @Mock
    private com.yuhecom.shopecom.mapper.UsersMapper usersMapper;
    @Mock
    private com.yuhecom.shopecom.config.AppProperties appProperties;

    private OrderService orderService;

    @BeforeEach
    public void setup() {
        orderService = new OrderService(
                userDetailsService,
                orderRepository,
                (com.yuhecom.shopecom.service.ProductService) productService,
                (com.yuhecom.shopecom.service.StripeService) stripeService,
                (com.yuhecom.shopecom.service.VnPayService) vnPayService,
                (com.yuhecom.shopecom.mapper.ProductVariantMapper) productVariantMapper,
                (com.yuhecom.shopecom.mapper.ProductMapper) productMapper,
                (com.yuhecom.shopecom.mapper.OrderMapper) orderMapper,
                (com.yuhecom.shopecom.mapper.UsersMapper) usersMapper,
                (com.yuhecom.shopecom.config.AppProperties) appProperties
        );
    }

    @Test
    public void cancelOrder_success() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).email("user@example.com").build();
        Order order = new Order();
        order.setId(id);
        order.setUser(user);
        order.setOrderStatus(OrderStatus.PENDING);

        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(user);
        when(orderRepository.findById(id)).thenReturn(Optional.of(order));

        Principal p = () -> user.getEmail();

        boolean result = orderService.cancelOrder(id, p);

        assertThat(result).isTrue();

        ArgumentCaptor<Order> captor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository, times(1)).save(captor.capture());
        assertThat(captor.getValue().getOrderStatus()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    public void cancelOrder_forbiddenUser() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).email("user@example.com").build();
        User otherUser = User.builder().id(UUID.randomUUID()).email("other@example.com").build();
        Order order = new Order();
        order.setId(id);
        order.setUser(otherUser);
        order.setOrderStatus(OrderStatus.PENDING);

        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(user);
        when(orderRepository.findById(id)).thenReturn(Optional.of(order));

        Principal p = () -> user.getEmail();

        assertThrows(AppException.class, () -> orderService.cancelOrder(id, p));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void cancelOrder_alreadyCancelled() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).email("user@example.com").build();
        Order order = new Order();
        order.setId(id);
        order.setUser(user);
        order.setOrderStatus(OrderStatus.CANCELLED);

        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(user);
        when(orderRepository.findById(id)).thenReturn(Optional.of(order));

        Principal p = () -> user.getEmail();

        boolean result = orderService.cancelOrder(id, p);

        assertThat(result).isFalse();
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    public void cancelOrder_notFound() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(UUID.randomUUID()).email("user@example.com").build();

        when(userDetailsService.loadUserByUsername(user.getEmail())).thenReturn(user);
        when(orderRepository.findById(id)).thenReturn(Optional.empty());

        Principal p = () -> user.getEmail();

        assertThrows(BusinessException.class, () -> orderService.cancelOrder(id, p));
        verify(orderRepository, never()).save(any(Order.class));
    }
}
