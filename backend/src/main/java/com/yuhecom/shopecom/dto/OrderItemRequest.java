package com.yuhecom.shopecom.dto;

import lombok.*;

import java.util.UUID;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {
    private UUID productId;

    private UUID productVariantId;

    private BigDecimal discount;

    private Integer quantity;


}
