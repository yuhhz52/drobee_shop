package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.entity.Category;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    public Category getCategory(UUID categoryId);

    public Category createCategory(CategoryDto categoryDto);

    public List<Category> getAllCategory();

    public Category updateCategory(CategoryDto categoryDto, UUID categoryId);

    public void deleteCategory(UUID categoryId);


}
