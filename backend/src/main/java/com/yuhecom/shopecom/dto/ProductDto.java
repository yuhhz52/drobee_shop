package com.yuhecom.shopecom.dto;

import lombok.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    @NotBlank
    @Size(max = 255)
    private String name;
    private String shortDescription;
    private String description;
    @NotNull
    @DecimalMin(value = "0.00")
    private BigDecimal price;
    @DecimalMin(value = "0.00")
    private BigDecimal salePrice;
    @NotBlank
    @Size(max = 255)
    private String brand;
    @NotNull
    private Boolean newArrival;
    @DecimalMin(value = "0.0")
    private BigDecimal rating;
    @Min(0)
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
    @NotBlank
    @Size(max = 255)
    private String slug;
    private String categoryName;
    @NotNull
    private UUID categoryTypeId;
    private String categoryTypeName;
    @Valid
    private List<ProductVariantDto> variants;
    @Valid
    private List<ProductResourceDto> productResources;

}
