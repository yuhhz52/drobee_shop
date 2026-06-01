package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class OrderControllerTest {

    @Mock
    private OrderService orderService;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);










        OrderController controller = new OrderController();
        // set package-private field
        controller.orderService = orderService;
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void testCancelOrder_returnsTrue() throws Exception {
        UUID id = UUID.randomUUID();
        when(orderService.cancelOrder(eq(id), any(Principal.class))).thenReturn(true);

        mockMvc.perform(post("/api/order/cancel/" + id).contentType(MediaType.APPLICATION_JSON)
                        .principal((Principal) () -> "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(true));
    }
}


