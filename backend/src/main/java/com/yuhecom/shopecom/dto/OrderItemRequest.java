package com.yuhecom.shopecom.dto;

import lombok.*;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {
    @NotNull(message = "Product is required")
    private UUID productId;

    @NotNull(message = "Product variant is required")
    private UUID productVariantId;

    private BigDecimal discount;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;


}
