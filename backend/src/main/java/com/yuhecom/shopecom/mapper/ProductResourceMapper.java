package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.ProductResourceDto;
import com.yuhecom.shopecom.entity.ProductResource;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductResourceMapper {
    ProductResourceDto toDto(ProductResource entity);
    List<ProductResourceDto> toDtoList(List<ProductResource> entities);

    ProductResource toEntity(ProductResourceDto dto);
    List<ProductResource> toEntityList(List<ProductResourceDto> dtos);
}
