package com.yuhecom.shopecom.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jdk.jshell.Snippet;
import lombok.*;

import java.math.BigDecimal;
import java.rmi.server.UID;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {

    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String brand;
    private Boolean newArrival;
    private Float rating;
    private UUID categoryId;
    private String thumbnail;
    private String slug;
    private String categoryName;
    private UUID categoryTypeId;
    private String categoryTypeName;
    private List<ProductVariantDto> variants;
    private List<ProductResourceDto> productResources;



}
