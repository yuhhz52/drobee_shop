package com.yuhecom.shopecom.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private UUID id;
    private UUID productId;
    private String productName;
    private String productSlug;
    private String productImage;

    private UUID variantId;
    private String variantName;
    private String variantColor;

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subTotal;
}
