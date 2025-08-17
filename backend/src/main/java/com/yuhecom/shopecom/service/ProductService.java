package com.yuhecom.shopecom.service;

import com.yuhecom.shopecom.dto.ProductDto;
import com.yuhecom.shopecom.entity.Product;
import com.yuhecom.shopecom.entity.ProductVariant;
import org.springframework.data.domain.Page;


import java.util.List;
import java.util.UUID;

public interface ProductService {

    public Product addProducts(ProductDto product);

    void deleteProduct(UUID productId);

    ProductDto getProductBySlug(String slug);

    public Page<ProductDto> getAllProduct(UUID categoryId, List<UUID> typeIds, String name, Boolean newArrival, int page, int size);

    ProductDto getProductById(UUID id);

    Product updateProduct(ProductDto productDto, UUID id);

    Product fetchProductById(UUID uuid) throws Exception;

    public ProductVariant fetchProductVariantById(UUID id);


}













