package com.yuhecom.shopecom.mapper;

import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.dto.CategoryTypeDto;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.entity.CategoryType;
import org.mapstruct.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "categoryTypes", source = "categoryTypes")
    CategoryDto toDto(Category category);

    @Mapping(target = "categoryTypes", source = "categoryTypes")
    Category toEntity(CategoryDto categoryDto);

    List<CategoryDto> toDtoList(List<Category> categories);
    List<Category> toEntityList(List<CategoryDto> dtos);

    // Prevent circular reference by ignoring parent reference
    @Mapping(target = "category", ignore = true)
    CategoryTypeDto toCategoryTypeDto(CategoryType categoryType);

    @Mapping(target = "category", ignore = true)
    CategoryType toCategoryType(CategoryTypeDto dto);

    List<CategoryTypeDto> toCategoryTypeDtoList(List<CategoryType> categoryTypes);

    List<CategoryType> toCategoryTypeList(List<CategoryTypeDto> dtos);

    // Helper method to break circular reference
    default UUID mapCategoryToId(Category category) {
        return category != null ? category.getId() : null;
    }

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
