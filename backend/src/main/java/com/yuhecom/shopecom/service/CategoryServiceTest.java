package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.entity.CategoryType;
import com.yuhecom.shopecom.exception.ResourceNotFoundEx;
import com.yuhecom.shopecom.mapper.CategoryMapper;
import com.yuhecom.shopecom.reponsitory.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceTest {

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


//    private Category mapToEntity(CategoryDto categoryDto){
//        Category category = Category.builder()
//                .code(categoryDto.getCode())
//                .name(categoryDto.getName())
//                .description(categoryDto.getDescription())
//                .build();
//
//
//        if(null != categoryDto.getCategoryTypes()){
//            List<CategoryType> categoryTypes = mapToCategoryTypesList(categoryDto.getCategoryTypes(),category);
//            category.setCategoryTypes(categoryTypes);
//        }
//        return category;
//    }


//
//    private List<CategoryType> mapToCategoryTypesList(List<CategoryTypeDto> categoryTypeList, Category category) {
//        return categoryTypeList.stream().map(categoryTypeDto -> {
//            CategoryType categoryType = new CategoryType();
//            categoryType.setCode(categoryTypeDto.getCode());
//            categoryType.setName(categoryTypeDto.getName());
//            categoryType.setDescription(categoryTypeDto.getDescription());
//            categoryType.setCategory(category);
//            return categoryType;
//        }).collect(Collectors.toList());
//    }

//    public Category updateCategory(CategoryDto categoryDto, UUID categoryId) {
//        Category category = categoryRepository.findById(categoryId)
//                .orElseThrow(()-> new ResourceNotFoundEx("Category not found with Id "+categoryDto.getId()));
//
//        // Cập nhật thông tin chính Category
//        categoryMapper.updateCategoryFromDto(categoryDto, category);
//
//        if(null != categoryDto.getName()){
//            category.setName(categoryDto.getName());
//        }
//        if(null != categoryDto.getCode()){
//            category.setCode(categoryDto.getCode());
//        }
//        if(null != categoryDto.getDescription()){
//            category.setDescription(categoryDto.getDescription());
//        }
//
//        List<CategoryType> existing = category.getCategoryTypes();
//        List<CategoryType> list= new ArrayList<>();
//
//        if(categoryDto.getCategoryTypes() != null){
//            categoryDto.getCategoryTypes().forEach(categoryTypeDto -> {
//                if(null != categoryTypeDto.getId()){
//                    Optional<CategoryType> categoryType = existing.stream().filter(t -> t.getId().equals(categoryTypeDto.getId())).findFirst();
//                    CategoryType categoryType1= categoryType.get();
//                    categoryType1.setCode(categoryTypeDto.getCode());
//                    categoryType1.setName(categoryTypeDto.getName());
//                    categoryType1.setDescription(categoryTypeDto.getDescription());
//                    list.add(categoryType1);
//                }
//                else{
//                    CategoryType categoryType = new CategoryType();
//                    categoryType.setCode(categoryTypeDto.getCode());
//                    categoryType.setName(categoryTypeDto.getName());
//                    categoryType.setDescription(categoryTypeDto.getDescription());
//                    categoryType.setCategory(category);
//                    list.add(categoryType);
//                }
//            });
//        }
//        category.setCategoryTypes(list);
//
//        return  categoryRepository.save(category);
//    }


















