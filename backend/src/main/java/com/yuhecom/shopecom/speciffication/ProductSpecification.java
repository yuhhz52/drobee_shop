package com.yuhecom.shopecom.speciffication;

import com.yuhecom.shopecom.entity.Product;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class ProductSpecification {

    public static Specification<Product> hasCategoryId(UUID categoryId){
        return  (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("categoryType").get("category").get("id"), categoryId);
    }

    public static Specification<Product> hasCategoryIds(List<UUID> categoryIds){
        return  (root, query, criteriaBuilder) ->
                root.get("categoryType").get("category").get("id").in(categoryIds);
    }

    public static Specification<Product> hasCategoryTypeId(UUID typeId){
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("categoryType").get("id"), typeId);
    }

    public static Specification<Product> hasCategoryTypeIds(List<UUID> typeIds) {
        return (root, query, criteriaBuilder) -> root.get("categoryType").get("id").in(typeIds);
    }

    public static Specification<Product> hasNewArrival(Boolean newArrival) {
        return (root, query, cb) -> cb.equal(root.get("newArrival"), newArrival);
    }

    public static Specification<Product> hasNameLike(String name) {
        return (root, query, criteriaBuilder) ->
            criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }

    // ScooterSpec filters - always use LEFT JOIN so products without specs still appear
    public static Specification<Product> hasMinMaxSpeed(Integer minMaxSpeed) {
        if (minMaxSpeed == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.greaterThanOrEqualTo(root.get("scooterSpec").get("maxSpeedKmh"), minMaxSpeed);
        };
    }

    public static Specification<Product> hasMinRange(Integer minRange) {
        if (minRange == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.greaterThanOrEqualTo(root.get("scooterSpec").get("rangeKm"), minRange);
        };
    }

    public static Specification<Product> hasMaxMotorPower(Integer maxMotor) {
        if (maxMotor == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.lessThanOrEqualTo(root.get("scooterSpec").get("motorPowerW"), maxMotor);
        };
    }

    public static Specification<Product> hasMaxWeight(BigDecimal maxWeight) {
        if (maxWeight == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.lessThanOrEqualTo(root.get("scooterSpec").get("weightKg"), maxWeight);
        };
    }

    public static Specification<Product> hasMinBatteryCapacity(BigDecimal minAh) {
        if (minAh == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.greaterThanOrEqualTo(root.get("scooterSpec").get("batteryCapacityAh"), minAh);
        };
    }

    public static Specification<Product> hasMinBatteryVoltage(BigDecimal minV) {
        if (minV == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.greaterThanOrEqualTo(root.get("scooterSpec").get("batteryVoltageV"), minV);
        };
    }

    public static Specification<Product> hasRemovableBattery(Boolean removable) {
        if (removable == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.equal(root.get("scooterSpec").get("removableBattery"), removable);
        };
    }

    public static Specification<Product> hasMaxWheelSize(BigDecimal maxInch) {
        if (maxInch == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.lessThanOrEqualTo(root.get("scooterSpec").get("wheelSizeInch"), maxInch);
        };
    }

    public static Specification<Product> hasMinMaxLoad(Integer minLoad) {
        if (minLoad == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.greaterThanOrEqualTo(root.get("scooterSpec").get("maxLoadKg"), minLoad);
        };
    }

    public static Specification<Product> hasMinMaxIncline(Integer minIncline) {
        if (minIncline == null) return null;
        return (root, query, cb) -> {
            root.join("scooterSpec", JoinType.LEFT);
            return cb.greaterThanOrEqualTo(root.get("scooterSpec").get("maxInclinePercent"), minIncline);
        };
    }
}
