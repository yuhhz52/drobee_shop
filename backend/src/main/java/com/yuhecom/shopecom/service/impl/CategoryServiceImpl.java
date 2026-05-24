package com.yuhecom.shopecom.service.impl;

import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.dto.CategoryTypeDto;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.entity.CategoryType;
import com.yuhecom.shopecom.exception.BusinessException;
import com.yuhecom.shopecom.exception.ErrorCode;
import com.yuhecom.shopecom.mapper.CategoryMapper;
import com.yuhecom.shopecom.reponsitory.CategoryRepository;
import com.yuhecom.shopecom.service.CategoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {

    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    @Override
    public Category getCategory(UUID categoryId) {
        if (categoryId == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Category ID must not be null");
        }
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found with id " + categoryId));
    }

    @Override
    @Transactional
    public Category createCategory(CategoryDto categoryDto) {
        if (categoryDto == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Category data must not be null");
        }
        Category category = categoryMapper.toEntity(categoryDto);
        linkCategoryTypesToParent(category);
        return categoryRepository.save(category);
    }

    @Override
    public List<Category> getAllCategory() {
        return categoryRepository.findAll();
    }

    @Override
    @Transactional
    public Category updateCategory(CategoryDto categoryDto, UUID categoryId) {
        if (categoryDto == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Category data must not be null");
        }
        if (categoryId == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Category ID must not be null");
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND,
                        "Category not found with id " + categoryId));

        categoryMapper.updateCategoryFromDto(categoryDto, category);

        if (categoryDto.getCategoryTypes() != null) {
            syncCategoryTypes(category, categoryDto.getCategoryTypes());
        }

        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID categoryId) {
        if (categoryId == null) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Category ID must not be null");
        }
        if (!categoryRepository.existsById(categoryId)) {
            throw new BusinessException(ErrorCode.CATEGORY_NOT_FOUND,
                    "Category not found with id " + categoryId);
        }
        categoryRepository.deleteById(categoryId);
    }

    /** Gán quan hệ parent cho CategoryType sau khi MapStruct map (tránh lỗi FK category_id null). */
    private void linkCategoryTypesToParent(Category category) {
        if (category.getCategoryTypes() == null) {
            return;
        }
        category.getCategoryTypes().forEach(type -> type.setCategory(category));
    }

    /**
     * Đồng bộ danh sách CategoryType: cập nhật có id, thêm mới không id, xóa type không còn trong DTO.
     */
    private void syncCategoryTypes(Category category, List<CategoryTypeDto> typeDtos) {
        List<CategoryType> managedTypes = category.getCategoryTypes();
        if (managedTypes == null) {
            managedTypes = new ArrayList<>();
            category.setCategoryTypes(managedTypes);
        }

        Set<UUID> incomingIds = typeDtos.stream()
                .map(CategoryTypeDto::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        managedTypes.removeIf(type -> type.getId() != null && !incomingIds.contains(type.getId()));

        for (CategoryTypeDto dto : typeDtos) {
            if (dto.getId() != null) {
                CategoryType existing = managedTypes.stream()
                        .filter(t -> dto.getId().equals(t.getId()))
                        .findFirst()
                        .orElseThrow(() -> new BusinessException(ErrorCode.CATEGORY_TYPE_NOT_FOUND,
                                "CategoryType not found with id " + dto.getId()));
                categoryMapper.updateCategoryTypeFromDto(dto, existing);
                existing.setCategory(category);
            } else {
                CategoryType newType = categoryMapper.toCategoryType(dto);
                newType.setCategory(category);
                managedTypes.add(newType);
            }
        }
    }
}
