package com.yuhecom.shopecom.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartCheckoutValidation {

    @NotNull
    private UUID cartId;

    @NotEmpty(message = "Cart must contain at least one item")
    private List<CartItemValidation> items;

    private int totalItems;
    private java.math.BigDecimal totalAmount;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemValidation {
        private UUID productId;
        private UUID variantId;
        private String productName;
        private String variantName;
        private int quantity;
        private int availableStock;
        private java.math.BigDecimal unitPrice;
        private java.math.BigDecimal subTotal;
        private boolean inStock;
        private boolean active;
    }
}
