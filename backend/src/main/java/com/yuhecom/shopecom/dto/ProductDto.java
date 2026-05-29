package com.yuhecom.shopecom.dto;

import lombok.*;

import java.math.BigDecimal;
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
    private String shortDescription;
    private String description;
    private BigDecimal price;
    private BigDecimal salePrice;
    private String brand;
    private Boolean newArrival;
    private BigDecimal rating;
    private Integer totalSold;
    private Boolean featured;
    private Boolean active;
    private String sku;
    private Integer motorPowerW;
    private Integer peakPowerW;
    private Integer maxSpeedKmh;
    private Integer maxSpeedUnlockedKmh;
    private Integer rangeKm;
    private Integer maxInclinePercent;
    private BigDecimal batteryCapacityAh;
    private BigDecimal batteryVoltageV;
    private String batteryType;
    private BigDecimal chargingTimeHours;
    private Boolean removableBattery;
    private BigDecimal weightKg;
    private Integer maxLoadKg;
    private String frameMaterial;
    private BigDecimal wheelSizeInch;
    private String tireType;
    private String brakeFront;
    private String brakeRear;
    private String suspensionFront;
    private String suspensionRear;
    private BigDecimal lengthCm;
    private BigDecimal widthCm;
    private BigDecimal heightCm;
    private BigDecimal foldedLengthCm;
    private BigDecimal foldedWidthCm;
    private BigDecimal foldedHeightCm;
    private String lights;
    private String displayType;
    private String connectivity;
    private String waterResistanceRating;
    private String certifications;
    private Integer warrantyMonths;
    private UUID categoryId;
    private String slug;
    private String categoryName;
    private UUID categoryTypeId;
    private String categoryTypeName;
    private List<ProductVariantDto> variants;
    private List<ProductResourceDto> productResources;

}
