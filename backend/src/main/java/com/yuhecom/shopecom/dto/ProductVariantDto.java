package com.yuhecom.shopecom.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDto {

    private UUID id;
    private String color;
    private String size;
    private Integer stockQuantity;
}