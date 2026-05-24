package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.ProductResourceDto;
import com.yuhecom.shopecom.entity.ProductResource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductResourceMapper {
    ProductResourceDto toDto(ProductResource entity);
    List<ProductResourceDto> toDtoList(List<ProductResource> entities);

    @Mapping(target = "product", ignore = true)
    ProductResource toEntity(ProductResourceDto dto);

    List<ProductResource> toEntityList(List<ProductResourceDto> dtos);
}
