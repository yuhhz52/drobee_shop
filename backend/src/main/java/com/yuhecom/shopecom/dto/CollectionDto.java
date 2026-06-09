package com.yuhecom.shopecom.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionDto {
    private UUID id;
    private String slug;
    private String title;
    private String description;
    private UUID categoryId;
    private UUID categoryTypeId;
    private Boolean isAllProducts;
    private Boolean isNewArrivals;
    private Boolean isSale;
    private Integer displayOrder;
}
