package com.yuhecom.shopecom.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectCheckoutRequest {

    @NotNull(message = "Address is required")
    private UUID addressId;

    @NotNull(message = "Payment method is required")
    private String paymentMethod;

    @NotEmpty(message = "Order must contain at least one item")
    private List<DirectOrderItem> items;

    private String idempotencyKey;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DirectOrderItem {
        @NotNull(message = "Product is required")
        private UUID productId;

        @NotNull(message = "Product variant is required")
        private UUID productVariantId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }
}
