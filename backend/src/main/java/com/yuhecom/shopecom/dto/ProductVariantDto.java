package com.yuhecom.shopecom.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDto {

    private UUID id;
    private String color;
    private String variantName;
    private Integer stockQuantity;
    private BigDecimal additionalPrice;
}