package com.yuhecom.shopecom.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "scooter_specs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScooterSpec extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    @JsonIgnore
    private Product product;

    @Column
    private Integer motorPowerW;

    @Column
    private Integer peakPowerW;

    @Column
    private Integer maxSpeedKmh;

    @Column
    private Integer maxSpeedUnlockedKmh;

    @Column
    private Integer rangeKm;

    @Column
    private Integer maxInclinePercent;

    @Column(precision = 10, scale = 2)
    private BigDecimal batteryCapacityAh;

    @Column(precision = 10, scale = 2)
    private BigDecimal batteryVoltageV;

    @Column
    private String batteryType;

    @Column(precision = 10, scale = 2)
    private BigDecimal chargingTimeHours;

    @Column
    private Boolean removableBattery;

    @Column(precision = 10, scale = 2)
    private BigDecimal weightKg;

    @Column
    private Integer maxLoadKg;

    @Column
    private String frameMaterial;

    @Column(precision = 10, scale = 2)
    private BigDecimal wheelSizeInch;

    @Column
    private String tireType;

    @Column
    private String brakeFront;

    @Column
    private String brakeRear;

    @Column
    private String suspensionFront;

    @Column
    private String suspensionRear;

    @Column(precision = 10, scale = 2)
    private BigDecimal lengthCm;

    @Column(precision = 10, scale = 2)
    private BigDecimal widthCm;

    @Column(precision = 10, scale = 2)
    private BigDecimal heightCm;

    @Column(precision = 10, scale = 2)
    private BigDecimal foldedLengthCm;

    @Column(precision = 10, scale = 2)
    private BigDecimal foldedWidthCm;

    @Column(precision = 10, scale = 2)
    private BigDecimal foldedHeightCm;

    @Column
    private String waterResistanceRating;

    @Column
    private String lights;

    @Column
    private String displayType;

    @Column
    private String connectivity;

    @Column
    private Integer warrantyMonths;

    @Column
    private String certifications;
}
