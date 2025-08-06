package com.yuhecom.shopecom.controller;


import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.entity.Product;
import com.yuhecom.shopecom.service.ProductService;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductsController {

    private ProductService productService;

    @Autowired
    public ProductsController(ProductService productService){
        this.productService = productService;
    }

    //Hien thi toan bo san pham
    @GetMapping
    public ResponseEntity<List<ProductDto>> getAllProducts(
            @RequestParam(required = false, name = "categoryId") UUID categoryId,
            @RequestParam(required = false, name = "typeIds") List<UUID> typeIds,
            @RequestParam(required = false, name = "typeId") UUID typeId,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String name,
            HttpServletResponse response) {
        List<ProductDto> productList = new ArrayList<>();
        if (StringUtils.isNotBlank(slug)) {
            ProductDto productDto = productService.getProductBySlug(slug);
            productList.add(productDto);
        } else {
            // Nếu typeId (đơn) có giá trị, chuyển thành list
            if (typeId != null) {
                if (typeIds == null) typeIds = new ArrayList<>();
                typeIds.add(typeId);
            }
            productList = productService.getAllProduct(categoryId, typeIds, name);
        }
        response.setHeader("Content-Range", String.valueOf(productList.size()));
        return new ResponseEntity<>(productList, HttpStatus.OK);
    }

    // Kiem san theo id
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProductById(@PathVariable UUID id){
        ProductDto productDto = productService.getProductById(id);
        return new ResponseEntity<>(productDto, HttpStatus.OK);
    }
    // Tao san pham
    @PostMapping()
    public ResponseEntity<Product> createProduct(@RequestBody  ProductDto productDto){
        Product product = productService.addProducts(productDto);
        return new ResponseEntity<>(product, HttpStatus.CREATED);

    }
    // Xoa
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok().build();
    }

    // Cap nhat
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@RequestBody ProductDto productDto,@PathVariable UUID id){
        Product product = productService.updateProduct(productDto,id);
        return new ResponseEntity<>(product,HttpStatus.OK);
    }

}
