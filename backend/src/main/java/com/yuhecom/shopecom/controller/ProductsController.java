package com.yuhecom.shopecom.controller;


import com.yuhecom.shopecom.dto.ApiResponse;
import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.dto.PagingResult;
import com.yuhecom.shopecom.entity.Product;
import com.yuhecom.shopecom.service.ProductService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<ApiResponse<List<ProductDto>>> getAllProducts(
            @RequestParam(required = false, name = "categoryId") UUID categoryId,
            @RequestParam(required = false, name = "typeIds") List<UUID> typeIds,
            @RequestParam(required = false, name = "typeId") UUID typeId,
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean newArrival,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            HttpServletResponse response
    ) {
        PagingResult<ProductDto> pageResult = productService.getProductsPage(categoryId, typeIds, typeId, slug, name, newArrival, page, size);
        response.setHeader("Content-Range", pageResult.contentRange());
        response.setHeader("Access-Control-Expose-Headers", "Content-Range");

        return ResponseEntity.ok(ApiResponse.<List<ProductDto>>builder().result(pageResult.items()).build());
    }


    // Kiem san theo id
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable UUID id){
        ProductDto productDto = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.<ProductDto>builder().result(productDto).build());
    }
    // Tao san pham
    @PostMapping()
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody  ProductDto productDto){
        Product product = productService.addProducts(productDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<Product>builder().result(product).build());

    }
    // Xoa
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable("id") UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.<Void>builder().result(null).build());
    }

    // Cap nhat
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Product>> updateProduct(@RequestBody ProductDto productDto,@PathVariable UUID id){
        Product product = productService.updateProduct(productDto,id);
        return ResponseEntity.ok(ApiResponse.<Product>builder().result(product).build());
    }

}
