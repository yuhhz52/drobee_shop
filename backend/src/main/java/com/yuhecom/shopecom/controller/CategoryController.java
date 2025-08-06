package com.yuhecom.shopecom.controller;

import com.yuhecom.shopecom.dto.CategoryDto;
import com.yuhecom.shopecom.entity.Category;
import com.yuhecom.shopecom.service.CategoryService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable("id") UUID categoryId){
        Category category = categoryService.getCategory(categoryId);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(HttpServletResponse response){
        List<Category> categoryList = categoryService.getAllCategory();
        response.setHeader("Content-Range",String.valueOf(categoryList.size()));
        return new ResponseEntity<>(categoryList, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody CategoryDto categoryDto){
        Category category = categoryService.createCategory(categoryDto);
        return new ResponseEntity<>(category, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@RequestBody CategoryDto categoryDto, @PathVariable("id") UUID categoryId){
        Category category = categoryService.updateCategory(categoryDto, categoryId);
        return new ResponseEntity<>(category, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") UUID categoryId){
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.ok().build();
    }

}















