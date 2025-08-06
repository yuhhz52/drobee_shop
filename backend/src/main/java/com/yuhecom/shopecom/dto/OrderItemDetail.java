package com.yuhecom.shopecom.dto;

import com.yuhecom.shopecom.dto.ProductDto;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDetail {
    private UUID id;
    private ProductDto product;
    private UUID productVariantId;
    private Integer quantity;
    private Double itemPrice;
}
