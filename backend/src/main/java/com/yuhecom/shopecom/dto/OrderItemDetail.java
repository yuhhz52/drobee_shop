package com.yuhecom.shopecom.dto;

import com.yuhecom.shopecom.dto.ProductDto;
import lombok.*;

import java.util.UUID;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDetail {
    private UUID id;
    private ProductDto product;
    private ProductVariantDto productVariant;
    private Integer quantity;
    private BigDecimal itemPrice;
}
