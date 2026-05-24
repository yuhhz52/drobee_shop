package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.ProductVariantDto;
import com.yuhecom.shopecom.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductVariantMapper {

    ProductVariantDto toDto(ProductVariant entity);

    @Mapping(target = "product", ignore = true)
    ProductVariant toEntity(ProductVariantDto dto);
}
