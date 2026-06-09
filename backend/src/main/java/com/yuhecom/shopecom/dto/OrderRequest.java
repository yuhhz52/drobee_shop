package com.yuhecom.shopecom.dto;

import lombok.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private UUID userId;
    private LocalDateTime orderDate;

    @NotNull(message = "Address is required")
    private UUID addressId;

    @Valid
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequest> orderItemRequest;

    private BigDecimal totalAmount;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    private BigDecimal discount;
    private LocalDateTime expectedDeliveryDate;


}
