package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.auth.config.CustomAuthenticationEntryPoint;
import com.yuhecom.shopecom.auth.config.JWTTokenHelper;
import com.yuhecom.shopecom.auth.config.WebSecurityConfig;
import com.yuhecom.shopecom.auth.handler.OAuth2LoginSuccessHandler;
import com.yuhecom.shopecom.exception.AppException;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.exception.GlobalExceptionHandler;
import com.yuhecom.shopecom.service.OrderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.security.Principal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(OrderController.class)
@AutoConfigureMockMvc
@Import({WebSecurityConfig.class, GlobalExceptionHandler.class})
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OrderService orderService;

    @MockBean
    private JWTTokenHelper jwtTokenHelper;

    @MockBean
    private UserDetailsService userDetailsService;

    @MockBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockBean
    private CustomAuthenticationEntryPoint customAuthenticationEntryPoint;

    @Test
    @WithMockUser(username = "user@example.com")
    void cancelOrder_forbidden_returns403() throws Exception {
        UUID id = UUID.randomUUID();

        when(orderService.cancelOrder(eq(id), any(Principal.class)))
                .thenThrow(new AppException(ErrorCode.FORBIDDEN, "Order does not belong to user"));

        mockMvc.perform(post("/api/order/cancel/" + id))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(ErrorCode.FORBIDDEN.getCode()))
                .andExpect(jsonPath("$.errorCode").value(ErrorCode.FORBIDDEN.name()));
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void cancelOrder_notFound_returns404() throws Exception {
        UUID id = UUID.randomUUID();

        when(orderService.cancelOrder(eq(id), any(Principal.class)))
                .thenThrow(new BusinessException(ErrorCode.ORDER_NOT_FOUND, "Order not found with id " + id));

        mockMvc.perform(post("/api/order/cancel/" + id))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(ErrorCode.ORDER_NOT_FOUND.getCode()))
                .andExpect(jsonPath("$.errorCode").value(ErrorCode.ORDER_NOT_FOUND.name()));
    }
}

