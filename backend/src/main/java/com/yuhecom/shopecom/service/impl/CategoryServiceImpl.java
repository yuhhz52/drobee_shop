package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.entity.CategoryType;
import com.yuhecom.shopecom.exception.ResourceNotFoundEx;
import com.yuhecom.shopecom.mapper.CategoryMapper;
import com.yuhecom.shopecom.reponsitory.CategoryRepository;
import com.yuhecom.shopecom.service.CategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {

    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    public Category getCategory(UUID categoryId){
        return categoryRepository.findById(categoryId).orElse(null);
    }


    public Category createCategory(CategoryDto categoryDto){
        Category category = categoryMapper.toEntity(categoryDto);
        return categoryRepository.save(category);
    }

    public List<Category> getAllCategory() {
        return categoryRepository.findAll();
    }

    public Category updateCategory(CategoryDto categoryDto, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundEx("Category not found with Id " + categoryId));

        // Cập nhật thông tin chính Category
        categoryMapper.updateCategoryFromDto(categoryDto, category);

        // Xử lý CategoryTypes update/add
        if (categoryDto.getCategoryTypes() != null) {
            List<CategoryType> existingTypes = category.getCategoryTypes();
            List<CategoryType> updatedTypes = categoryDto.getCategoryTypes().stream().map(dto -> {
                if (dto.getId() != null) {
                    // Update CategoryType đã tồn tại
                    CategoryType existing = existingTypes.stream()
                            .filter(t -> t.getId().equals(dto.getId()))
                            .findFirst()
                            .orElseThrow(() -> new ResourceNotFoundEx("CategoryType not found with Id " + dto.getId()));

                    categoryMapper.updateCategoryTypeFromDto(dto, existing);
                    return existing;
                } else {
                    // Thêm mới CategoryType
                    CategoryType newType = categoryMapper.toCategoryType(dto);
                    newType.setCategory(category);
                    return newType;
                }
            }).toList();

            category.setCategoryTypes(updatedTypes);
        }

        return categoryRepository.save(category);
    }

    public void deleteCategory(UUID categoryId) {
        categoryRepository.deleteById(categoryId);
    }
}
