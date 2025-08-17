package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.ProductVariantDto;
import com.yuhecom.shopecom.entity.ProductVariant;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {


    ProductVariantDto toDto(ProductVariant entity);

    ProductVariant toEntity(ProductVariantDto dto);
}