package com.yuhecom.shopecom.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {
    private UUID productId;

    private UUID productVariantId;

    private Double discount;

    private Integer quantity;


}
