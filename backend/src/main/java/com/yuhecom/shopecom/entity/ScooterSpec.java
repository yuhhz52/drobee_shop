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
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    @JsonIgnore
    private Product product;

    @Column(name = "motor_power_w")
    private Integer motorPowerW;

    @Column(name = "peak_power_w")
    private Integer peakPowerW;

    @Column(name = "max_speed_kmh")
    private Integer maxSpeedKmh;

    @Column(name = "max_speed_unlocked_kmh")
    private Integer maxSpeedUnlockedKmh;

    @Column(name = "range_km")
    private Integer rangeKm;

    @Column(name = "max_incline_percent")
    private Integer maxInclinePercent;

    @Column(name = "battery_capacity_ah", precision = 10, scale = 2)
    private BigDecimal batteryCapacityAh;

    @Column(name = "battery_voltage_v", precision = 10, scale = 2)
    private BigDecimal batteryVoltageV;

    @Column(name = "battery_type")
    private String batteryType;

    @Column(name = "charging_time_hours", precision = 10, scale = 2)
    private BigDecimal chargingTimeHours;

    @Column(name = "removable_battery")
    private Boolean removableBattery;

    @Column(name = "weight_kg", precision = 10, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "max_load_kg")
    private Integer maxLoadKg;

    @Column(name = "frame_material")
    private String frameMaterial;

    @Column(name = "wheel_size_inch", precision = 10, scale = 2)
    private BigDecimal wheelSizeInch;

    @Column(name = "tire_type")
    private String tireType;

    @Column(name = "brake_front")
    private String brakeFront;

    @Column(name = "brake_rear")
    private String brakeRear;

    @Column(name = "suspension_front")
    private String suspensionFront;

    @Column(name = "suspension_rear")
    private String suspensionRear;

    @Column(name = "length_cm", precision = 10, scale = 2)
    private BigDecimal lengthCm;

    @Column(name = "width_cm", precision = 10, scale = 2)
    private BigDecimal widthCm;

    @Column(name = "height_cm", precision = 10, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "folded_length_cm", precision = 10, scale = 2)
    private BigDecimal foldedLengthCm;

    @Column(name = "folded_width_cm", precision = 10, scale = 2)
    private BigDecimal foldedWidthCm;

    @Column(name = "folded_height_cm", precision = 10, scale = 2)
    private BigDecimal foldedHeightCm;

    @Column(name = "water_resistance_rating")
    private String waterResistanceRating;

    @Column(name = "lights")
    private String lights;

    @Column(name = "display_type")
    private String displayType;

    @Column(name = "connectivity")
    private String connectivity;

    @Column(name = "warranty_months")
    private Integer warrantyMonths;

    @Column(name = "certifications")
    private String certifications;
}
