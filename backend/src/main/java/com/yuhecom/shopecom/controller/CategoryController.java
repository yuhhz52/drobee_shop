package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.dto.PagingResult;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.service.CategoryService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable("id") UUID categoryId){
        Category category = categoryService.getCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.<Category>builder().result(category).build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories(HttpServletResponse response){
        PagingResult<Category> pageResult = categoryService.getCategoryPage();
        response.setHeader("Content-Range", pageResult.contentRange());
        return ResponseEntity.ok(ApiResponse.<List<Category>>builder().result(pageResult.items()).build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody CategoryDto categoryDto){
        Category category = categoryService.createCategory(categoryDto);
        return ResponseEntity.status(201).body(ApiResponse.<Category>builder().result(category).build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@RequestBody CategoryDto categoryDto, @PathVariable("id") UUID categoryId){
        Category category = categoryService.updateCategory(categoryDto, categoryId);
        return ResponseEntity.ok(ApiResponse.<Category>builder().result(category).build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable("id") UUID categoryId){
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(ApiResponse.<Void>builder().result(null).build());
    }

}
