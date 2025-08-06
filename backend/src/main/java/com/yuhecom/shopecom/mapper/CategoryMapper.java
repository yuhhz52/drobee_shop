package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.dto.CategoryTypeDto;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.entity.CategoryType;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "categoryTypes", source = "categoryTypes")
    CategoryDto toDto(Category category);

    @Mapping(target = "categoryTypes", source = "categoryTypes")
    Category toEntity(CategoryDto categoryDto);

    List<CategoryDto> toDtoList(List<Category> categories);
    List<Category> toEntityList(List<CategoryDto> dtos);

    CategoryTypeDto toCategoryTypeDto(CategoryType categoryType);

    CategoryType toCategoryType(CategoryTypeDto dto);

    List<CategoryTypeDto> toCategoryTypeDtoList(List<CategoryType> categoryTypes);

    List<CategoryType> toCategoryTypeList(List<CategoryTypeDto> dtos);


    // Cập nhật entity Category từ DTO (update)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoryTypes", ignore = true)
    void updateCategoryFromDto(CategoryDto dto, @MappingTarget Category entity);

    // Cập nhật entity CategoryType từ DTO
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    void updateCategoryTypeFromDto(CategoryTypeDto dto, @MappingTarget CategoryType entity);



}
