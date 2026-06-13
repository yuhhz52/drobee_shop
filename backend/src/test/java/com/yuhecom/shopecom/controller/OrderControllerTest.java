package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.service.IdempotencyService;
import com.yuhecom.shopecom.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
public class OrderControllerTest {

    @Mock
    private OrderService orderService;

    @Mock
    private IdempotencyService idempotencyService;

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        OrderController controller = new OrderController(orderService, idempotencyService);
        this.mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    public void testCancelOrder_returnsTrue() throws Exception {
        UUID id = UUID.randomUUID();
        when(orderService.cancelOrder(eq(id), any(Principal.class))).thenReturn(true);

        mockMvc.perform(patch("/api/orders/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"CANCELLED\"}")
                        .principal((Principal) () -> "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").value(true));
    }
}
