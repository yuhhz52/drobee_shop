package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.dto.PagingResult;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.mapper.CategoryMapper;
import com.yuhecom.shopecom.service.CategoryService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryMapper categoryMapper;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryById(@PathVariable("id") UUID categoryId){
        Category category = categoryService.getCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.<CategoryDto>builder().result(categoryMapper.toDto(category)).build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories(HttpServletResponse response){
        PagingResult<Category> pageResult = categoryService.getCategoryPage();
        response.setHeader("Content-Range", pageResult.contentRange());
        List<CategoryDto> dtos = categoryMapper.toDtoList(pageResult.items());
        return ResponseEntity.ok(ApiResponse.<List<CategoryDto>>builder().result(dtos).build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@RequestBody CategoryDto categoryDto){
        Category category = categoryService.createCategory(categoryDto);
        return ResponseEntity.status(201).body(ApiResponse.<CategoryDto>builder().result(categoryMapper.toDto(category)).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(@RequestBody CategoryDto categoryDto, @PathVariable("id") UUID categoryId){
        Category category = categoryService.updateCategory(categoryDto, categoryId);
        return ResponseEntity.ok(ApiResponse.<CategoryDto>builder().result(categoryMapper.toDto(category)).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable("id") UUID categoryId){
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.<Void>builder().result(null).build());
    }

}
