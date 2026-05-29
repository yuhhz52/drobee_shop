package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.entity.CategoryType;
import com.yuhecom.shopecom.entity.Product;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.UUID;

@Mapper(
        componentModel = "spring",
        uses = {ProductVariantMapper.class, ProductResourceMapper.class},
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface ProductMapper {

    List<ProductDto> toDtoList(List<Product> products);

    @Mapping(target = "categoryType", source = "categoryTypeId", qualifiedByName = "idToCategoryType")
    @Mapping(source = "variants", target = "variants")
    @Mapping(source = "productResources", target = "resources")
    @Mapping(source = "motorPowerW", target = "scooterSpec.motorPowerW")
    @Mapping(source = "peakPowerW", target = "scooterSpec.peakPowerW")
    @Mapping(source = "maxSpeedKmh", target = "scooterSpec.maxSpeedKmh")
    @Mapping(source = "maxSpeedUnlockedKmh", target = "scooterSpec.maxSpeedUnlockedKmh")
    @Mapping(source = "rangeKm", target = "scooterSpec.rangeKm")
    @Mapping(source = "maxInclinePercent", target = "scooterSpec.maxInclinePercent")
    @Mapping(source = "batteryCapacityAh", target = "scooterSpec.batteryCapacityAh")
    @Mapping(source = "batteryVoltageV", target = "scooterSpec.batteryVoltageV")
    @Mapping(source = "batteryType", target = "scooterSpec.batteryType")
    @Mapping(source = "chargingTimeHours", target = "scooterSpec.chargingTimeHours")
    @Mapping(source = "removableBattery", target = "scooterSpec.removableBattery")
    @Mapping(source = "weightKg", target = "scooterSpec.weightKg")
    @Mapping(source = "maxLoadKg", target = "scooterSpec.maxLoadKg")
    @Mapping(source = "frameMaterial", target = "scooterSpec.frameMaterial")
    @Mapping(source = "wheelSizeInch", target = "scooterSpec.wheelSizeInch")
    @Mapping(source = "tireType", target = "scooterSpec.tireType")
    @Mapping(source = "brakeFront", target = "scooterSpec.brakeFront")
    @Mapping(source = "brakeRear", target = "scooterSpec.brakeRear")
    @Mapping(source = "suspensionFront", target = "scooterSpec.suspensionFront")
    @Mapping(source = "suspensionRear", target = "scooterSpec.suspensionRear")
    @Mapping(source = "lengthCm", target = "scooterSpec.lengthCm")
    @Mapping(source = "widthCm", target = "scooterSpec.widthCm")
    @Mapping(source = "heightCm", target = "scooterSpec.heightCm")
    @Mapping(source = "foldedLengthCm", target = "scooterSpec.foldedLengthCm")
    @Mapping(source = "foldedWidthCm", target = "scooterSpec.foldedWidthCm")
    @Mapping(source = "foldedHeightCm", target = "scooterSpec.foldedHeightCm")
    @Mapping(source = "lights", target = "scooterSpec.lights")
    @Mapping(source = "displayType", target = "scooterSpec.displayType")
    @Mapping(source = "connectivity", target = "scooterSpec.connectivity")
    @Mapping(source = "waterResistanceRating", target = "scooterSpec.waterResistanceRating")
    @Mapping(source = "certifications", target = "scooterSpec.certifications")
    @Mapping(source = "warrantyMonths", target = "scooterSpec.warrantyMonths")
    Product toEntity(ProductDto productDto);

    @Mapping(source = "categoryType.category.id", target = "categoryId")
    @Mapping(source = "categoryType.category.name", target = "categoryName")
    @Mapping(source = "categoryType.id", target = "categoryTypeId")
    @Mapping(source = "categoryType.name", target = "categoryTypeName")
    @Mapping(source = "variants", target = "variants")
    @Mapping(source = "resources", target = "productResources")
    @Mapping(source = "scooterSpec.motorPowerW", target = "motorPowerW")
    @Mapping(source = "scooterSpec.peakPowerW", target = "peakPowerW")
    @Mapping(source = "scooterSpec.maxSpeedKmh", target = "maxSpeedKmh")
    @Mapping(source = "scooterSpec.maxSpeedUnlockedKmh", target = "maxSpeedUnlockedKmh")
    @Mapping(source = "scooterSpec.rangeKm", target = "rangeKm")
    @Mapping(source = "scooterSpec.maxInclinePercent", target = "maxInclinePercent")
    @Mapping(source = "scooterSpec.batteryCapacityAh", target = "batteryCapacityAh")
    @Mapping(source = "scooterSpec.batteryVoltageV", target = "batteryVoltageV")
    @Mapping(source = "scooterSpec.batteryType", target = "batteryType")
    @Mapping(source = "scooterSpec.chargingTimeHours", target = "chargingTimeHours")
    @Mapping(source = "scooterSpec.removableBattery", target = "removableBattery")
    @Mapping(source = "scooterSpec.weightKg", target = "weightKg")
    @Mapping(source = "scooterSpec.maxLoadKg", target = "maxLoadKg")
    @Mapping(source = "scooterSpec.frameMaterial", target = "frameMaterial")
    @Mapping(source = "scooterSpec.wheelSizeInch", target = "wheelSizeInch")
    @Mapping(source = "scooterSpec.tireType", target = "tireType")
    @Mapping(source = "scooterSpec.brakeFront", target = "brakeFront")
    @Mapping(source = "scooterSpec.brakeRear", target = "brakeRear")
    @Mapping(source = "scooterSpec.suspensionFront", target = "suspensionFront")
    @Mapping(source = "scooterSpec.suspensionRear", target = "suspensionRear")
    @Mapping(source = "scooterSpec.lengthCm", target = "lengthCm")
    @Mapping(source = "scooterSpec.widthCm", target = "widthCm")
    @Mapping(source = "scooterSpec.heightCm", target = "heightCm")
    @Mapping(source = "scooterSpec.foldedLengthCm", target = "foldedLengthCm")
    @Mapping(source = "scooterSpec.foldedWidthCm", target = "foldedWidthCm")
    @Mapping(source = "scooterSpec.foldedHeightCm", target = "foldedHeightCm")
    @Mapping(source = "scooterSpec.lights", target = "lights")
    @Mapping(source = "scooterSpec.displayType", target = "displayType")
    @Mapping(source = "scooterSpec.connectivity", target = "connectivity")
    @Mapping(source = "scooterSpec.waterResistanceRating", target = "waterResistanceRating")
    @Mapping(source = "scooterSpec.certifications", target = "certifications")
    @Mapping(source = "scooterSpec.warrantyMonths", target = "warrantyMonths")
    ProductDto toDto(Product product);

    @Named("idToCategoryType")
    default CategoryType mapCategoryTypeIdToCategoryType(UUID categoryTypeId) {
        if (categoryTypeId == null) {
            return null;
        }
        CategoryType categoryType = new CategoryType();
        categoryType.setId(categoryTypeId);
        return categoryType;
    }

    @AfterMapping
    default void linkProductRelations(@MappingTarget Product product) {
        if (product.getResources() != null) {
            product.getResources().forEach(r -> r.setProduct(product));
        }
        if (product.getVariants() != null) {
            product.getVariants().forEach(v -> v.setProduct(product));
        }
        if (product.getScooterSpec() != null) {
            product.getScooterSpec().setProduct(product);
        }
    }
}
