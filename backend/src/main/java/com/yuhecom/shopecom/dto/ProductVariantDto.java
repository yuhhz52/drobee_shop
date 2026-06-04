package com.yuhecom.shopecom.dto;

import lombok.*;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDto {

    private UUID id;
    @NotBlank
    private String color;
    @NotBlank
    private String variantName;
    @NotNull
    @Min(0)
    private Integer stockQuantity;
    @DecimalMin(value = "0.00")
    private BigDecimal additionalPrice;
}
